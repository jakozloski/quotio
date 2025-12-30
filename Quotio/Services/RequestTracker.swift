//
//  RequestTracker.swift
//  Quotio - Request History Tracking Service
//
//  This service tracks API requests through two methods:
//  1. Callbacks from ProxyBridge for real-time request metadata
//  2. Log file watching for token usage extraction (CLIProxyAPI logs)
//
//  Request history is persisted to disk for session continuity.
//

import Foundation

/// Service for tracking API request history with persistence
@MainActor
@Observable
final class RequestTracker {
    
    // MARK: - Singleton
    
    static let shared = RequestTracker()
    
    // MARK: - Properties
    
    /// Current request history (newest first)
    private(set) var requestHistory: [RequestLog] = []
    
    /// Aggregate statistics
    private(set) var stats: RequestStats = .empty
    
    /// Whether the tracker is actively watching logs
    private(set) var isWatching = false
    
    /// Last error message
    private(set) var lastError: String?
    
    // MARK: - Private Properties
    
    /// Storage container
    private var store: RequestHistoryStore = .empty
    
    /// File handle for log watching
    private var logFileHandle: FileHandle?
    
    /// Dispatch source for file system events
    private var fileWatchSource: DispatchSourceFileSystemObject?
    
    /// Path to CLIProxyAPI log file
    private var logFilePath: String?
    
    /// Queue for file operations
    private let fileQueue = DispatchQueue(label: "io.quotio.request-tracker-file")
    
    /// Storage file URL
    private var storageURL: URL {
        let appSupport = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first!
        let quotioDir = appSupport.appendingPathComponent("Quotio")
        try? FileManager.default.createDirectory(at: quotioDir, withIntermediateDirectories: true)
        return quotioDir.appendingPathComponent("request-history.json")
    }
    
    // MARK: - Initialization
    
    private init() {
        loadFromDisk()
    }
    
    // MARK: - Public Methods
    
    /// Add a request from ProxyBridge callback
    func addRequest(from metadata: ProxyBridge.RequestMetadata) {
        let entry = RequestLog(
            timestamp: metadata.timestamp,
            method: metadata.method,
            endpoint: metadata.path,
            provider: metadata.provider,
            model: metadata.model,
            inputTokens: nil,  // Will be updated from logs
            outputTokens: nil, // Will be updated from logs
            durationMs: metadata.durationMs,
            statusCode: metadata.statusCode,
            requestSize: metadata.requestSize,
            responseSize: metadata.responseSize,
            errorMessage: nil
        )
        
        addEntry(entry)
    }
    
    /// Add a request entry directly
    func addEntry(_ entry: RequestLog) {
        store.addEntry(entry)
        requestHistory = store.entries
        stats = store.calculateStats()
        saveToDisk()
    }
    
    /// Start watching CLIProxyAPI log file
    func startWatching(logDirectory: String) {
        guard !isWatching else { return }
        
        // CLIProxyAPI logs to ~/.cli-proxy-api/logs/
        let logsDir = (logDirectory as NSString).appendingPathComponent("logs")
        
        // Find the most recent log file
        logFilePath = findLatestLogFile(in: logsDir)
        
        guard let path = logFilePath else {
            NSLog("[RequestTracker] No log file found in \(logsDir)")
            return
        }
        
        NSLog("[RequestTracker] Starting to watch: \(path)")
        
        // Open file handle for reading
        guard let handle = FileHandle(forReadingAtPath: path) else {
            lastError = "Cannot open log file"
            NSLog("[RequestTracker] Cannot open log file: \(path)")
            return
        }
        
        // Seek to end to only read new content
        handle.seekToEndOfFile()
        logFileHandle = handle
        
        // Create file system event source
        let fd = handle.fileDescriptor
        let source = DispatchSource.makeFileSystemObjectSource(
            fileDescriptor: fd,
            eventMask: [.write, .extend],
            queue: fileQueue
        )
        
        // Capture handle in closure to avoid MainActor isolation issues
        let capturedHandle = handle
        source.setEventHandler { [weak self] in
            self?.handleLogFileChange(handle: capturedHandle)
        }
        
        source.setCancelHandler {
            capturedHandle.closeFile()
            Task { @MainActor [weak self] in
                self?.logFileHandle = nil
            }
        }
        
        source.resume()
        fileWatchSource = source
        isWatching = true
    }
    
    /// Stop watching log files
    func stopWatching() {
        fileWatchSource?.cancel()
        fileWatchSource = nil
        isWatching = false
        NSLog("[RequestTracker] Stopped watching")
    }
    
    /// Clear all history
    func clearHistory() {
        store = .empty
        requestHistory = []
        stats = .empty
        saveToDisk()
    }
    
    /// Get requests filtered by provider
    func requests(for provider: String) -> [RequestLog] {
        requestHistory.filter { $0.provider == provider }
    }
    
    /// Get requests from last N minutes
    func recentRequests(minutes: Int) -> [RequestLog] {
        let cutoff = Date().addingTimeInterval(-Double(minutes * 60))
        return requestHistory.filter { $0.timestamp >= cutoff }
    }
    
    // MARK: - Log File Handling
    
    private func findLatestLogFile(in directory: String) -> String? {
        let fm = FileManager.default
        
        guard let contents = try? fm.contentsOfDirectory(atPath: directory) else {
            return nil
        }
        
        // Find log files (typically named with dates or just "proxy.log")
        let logFiles = contents
            .filter { $0.hasSuffix(".log") }
            .map { (directory as NSString).appendingPathComponent($0) }
            .compactMap { path -> (String, Date)? in
                guard let attrs = try? fm.attributesOfItem(atPath: path),
                      let modDate = attrs[.modificationDate] as? Date else {
                    return nil
                }
                return (path, modDate)
            }
            .sorted { $0.1 > $1.1 }  // Most recent first
        
        return logFiles.first?.0
    }
    
    private nonisolated func handleLogFileChange(handle: FileHandle) {
        let newData = handle.readDataToEndOfFile()
        guard !newData.isEmpty,
              let content = String(data: newData, encoding: .utf8) else {
            return
        }
        
        // Parse log lines
        let lines = content.components(separatedBy: .newlines)
        for line in lines where !line.isEmpty {
            if let logEntry = parseLogLine(line) {
                Task { @MainActor [weak self] in
                    self?.processLogEntry(logEntry)
                }
            }
        }
    }
    
    /// Parse a single log line from CLIProxyAPI
    private nonisolated func parseLogLine(_ line: String) -> ParsedLogEntry? {
        // CLIProxyAPI logs JSON entries for requests
        // Example: {"timestamp":"2024-01-15T10:30:00Z","provider":"claude","model":"claude-sonnet-4","input_tokens":1000,"output_tokens":500}
        
        guard let data = line.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            return nil
        }
        
        // Check if this is a request completion log
        guard json["input_tokens"] != nil || json["output_tokens"] != nil else {
            return nil
        }
        
        return ParsedLogEntry(
            timestamp: parseTimestamp(json["timestamp"] as? String),
            provider: json["provider"] as? String,
            model: json["model"] as? String,
            inputTokens: json["input_tokens"] as? Int,
            outputTokens: json["output_tokens"] as? Int,
            statusCode: json["status_code"] as? Int ?? json["status"] as? Int,
            error: json["error"] as? String
        )
    }
    
    private nonisolated func parseTimestamp(_ str: String?) -> Date {
        guard let str = str else { return Date() }
        
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        
        return formatter.date(from: str) ?? Date()
    }
    
    /// Process a parsed log entry - update existing request or create new
    private func processLogEntry(_ entry: ParsedLogEntry) {
        // Try to find a recent request to update with token info
        // Match by timestamp (within 5 seconds) and provider/model
        let recentCutoff = entry.timestamp.addingTimeInterval(-5)
        
        if let index = requestHistory.firstIndex(where: { request in
            request.timestamp >= recentCutoff &&
            request.provider == entry.provider &&
            (request.model == entry.model || request.model == nil)
        }) {
            // Update existing entry with token info
            var updated = requestHistory[index]
            updated = RequestLog(
                id: updated.id,
                timestamp: updated.timestamp,
                method: updated.method,
                endpoint: updated.endpoint,
                provider: entry.provider ?? updated.provider,
                model: entry.model ?? updated.model,
                inputTokens: entry.inputTokens ?? updated.inputTokens,
                outputTokens: entry.outputTokens ?? updated.outputTokens,
                durationMs: updated.durationMs,
                statusCode: entry.statusCode ?? updated.statusCode,
                requestSize: updated.requestSize,
                responseSize: updated.responseSize,
                errorMessage: entry.error ?? updated.errorMessage
            )
            
            store.entries[index] = updated
            requestHistory = store.entries
            stats = store.calculateStats()
            saveToDisk()
            
        } else {
            // Create new entry from log
            let newEntry = RequestLog(
                timestamp: entry.timestamp,
                method: "POST",  // Assumed
                endpoint: "",    // Unknown from log
                provider: entry.provider,
                model: entry.model,
                inputTokens: entry.inputTokens,
                outputTokens: entry.outputTokens,
                durationMs: 0,   // Unknown from log
                statusCode: entry.statusCode,
                requestSize: 0,
                responseSize: 0,
                errorMessage: entry.error
            )
            
            addEntry(newEntry)
        }
    }
    
    // MARK: - Persistence
    
    private func loadFromDisk() {
        guard FileManager.default.fileExists(atPath: storageURL.path) else {
            NSLog("[RequestTracker] No history file found, starting fresh")
            return
        }
        
        do {
            let data = try Data(contentsOf: storageURL)
            store = try JSONDecoder().decode(RequestHistoryStore.self, from: data)
            requestHistory = store.entries
            stats = store.calculateStats()
            NSLog("[RequestTracker] Loaded \(store.entries.count) entries from disk")
        } catch {
            NSLog("[RequestTracker] Failed to load history: \(error)")
            lastError = error.localizedDescription
        }
    }
    
    private func saveToDisk() {
        fileQueue.async { [weak self] in
            guard let self = self else { return }
            
            do {
                let encoder = JSONEncoder()
                encoder.dateEncodingStrategy = .iso8601
                encoder.outputFormatting = .prettyPrinted
                
                let data = try encoder.encode(self.store)
                try data.write(to: self.storageURL)
            } catch {
                Task { @MainActor [weak self] in
                    self?.lastError = error.localizedDescription
                }
                NSLog("[RequestTracker] Failed to save history: \(error)")
            }
        }
    }
}

// MARK: - Helper Types

private struct ParsedLogEntry {
    let timestamp: Date
    let provider: String?
    let model: String?
    let inputTokens: Int?
    let outputTokens: Int?
    let statusCode: Int?
    let error: String?
}
