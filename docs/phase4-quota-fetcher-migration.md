# Phase 4: QuotaFetcher Migration Plan

**Created:** 2026-01-15
**Status:** Ready for Implementation
**Parent Doc:** [swift-cleanup-plan.md](./swift-cleanup-plan.md)

## Executive Summary

Migrate QuotaViewModel from Swift quota fetchers to DaemonIPCClient, then delete 6 Swift fetchers (2,217 lines).

**Analysis Date:** 2026-01-15

### Migration Summary

| Fetcher | Lines | Blocker | Phase |
|---------|-------|---------|-------|
| `OpenAIQuotaFetcher.swift` | 291 | None | 4A (Safe) |
| `ClaudeCodeQuotaFetcher.swift` | 364 | None | 4A (Safe) |
| `GeminiCLIQuotaFetcher.swift` | 186 | None | 4A (Safe) |
| `CodexCLIQuotaFetcher.swift` | 370 | None | 4A (Safe) |
| `KiroQuotaFetcher.swift` | 519 | Token refresh logic | 4B (Blocked) |
| `CopilotQuotaFetcher.swift` | 487 | Model filtering for AgentConfig | 4B (Blocked) |
| **Total** | **2,217** | | |

---

## Current Architecture

### How Quota Fetching Works Today

```
QuotaViewModel.refreshQuotasUnified()
    │
    ├── Daemon Available? ─────> refreshQuotasViaDaemon()
    │                               └── DaemonQuotaService.fetchAllQuotas()
    │                                   └── DaemonIPCClient.fetchQuotas()
    │                                       └── quotio-cli daemon
    │                                           └── TS quota fetchers
    │
    └── Daemon Unavailable? ──> refreshQuotasViaDirectFetchers()
                                    ├── OpenAIQuotaFetcher.fetchAllCodexQuotas()
                                    ├── CopilotQuotaFetcher.fetchAllCopilotQuotas()
                                    ├── ClaudeCodeQuotaFetcher.fetchAsProviderQuota()
                                    ├── KiroQuotaFetcher.fetchAllQuotas()
                                    ├── GeminiCLIQuotaFetcher.fetchAsProviderQuota()
                                    └── CodexCLIQuotaFetcher.fetchAsProviderQuota()
```

### Key Insight

The daemon path (`refreshQuotasViaDaemon()`) already works and uses the TS fetchers. The Swift fetchers are only used as fallback when daemon is unavailable.

---

## Phase 4A: Safe Deletions (1,211 lines)

These fetchers have no external dependencies and can be deleted immediately after removing their usage from QuotaViewModel.

### 4A.1: Delete OpenAIQuotaFetcher.swift (291 lines)

**File:** `Quotio/Services/QuotaFetchers/OpenAIQuotaFetcher.swift`
**TS Equivalent:** `quotio-cli/src/services/quota-fetchers/openai.ts`

**Current Usage in QuotaViewModel:**
```swift
// Line 19
@ObservationIgnored private let openAIFetcher = OpenAIQuotaFetcher()

// Line 170-172
await openAIFetcher.updateProxyConfiguration()

// Line 1211-1213
private func refreshOpenAIQuotasInternal() async {
    let quotas = await openAIFetcher.fetchAllCodexQuotas()
    providerQuotas[.codex] = quotas
}
```

**Migration Steps:**

1. **Remove declaration** (line 19):
   ```swift
   // DELETE THIS LINE
   @ObservationIgnored private let openAIFetcher = OpenAIQuotaFetcher()
   ```

2. **Remove from updateProxyConfiguration()** (line 171):
   ```swift
   // DELETE THIS LINE
   await openAIFetcher.updateProxyConfiguration()
   ```

3. **Update refreshOpenAIQuotasInternal()** (lines 1211-1213):
   ```swift
   private func refreshOpenAIQuotasInternal() async {
       // Daemon handles this via DaemonQuotaService
       // No-op when called directly - data comes from refreshQuotasViaDaemon()
       guard !modeManager.isMonitorMode else { return }
       
       if let quotas = await daemonQuotaService.fetchQuotas(for: .codex) {
           providerQuotas[.codex] = quotas
       }
   }
   ```

4. **Delete file:**
   ```bash
   git rm Quotio/Services/QuotaFetchers/OpenAIQuotaFetcher.swift
   ```

5. **Verify build:**
   ```bash
   xcodebuild -project Quotio.xcodeproj -scheme Quotio -configuration Debug build 2>&1 | grep -E "error:|warning:"
   ```

---

### 4A.2: Delete ClaudeCodeQuotaFetcher.swift (364 lines)

**File:** `Quotio/Services/QuotaFetchers/ClaudeCodeQuotaFetcher.swift`
**TS Equivalent:** `quotio-cli/src/services/quota-fetchers/claude.ts`

**Current Usage in QuotaViewModel:**
```swift
// Line 41
@ObservationIgnored private let claudeCodeFetcher = ClaudeCodeQuotaFetcher()

// Line 174
await claudeCodeFetcher.updateProxyConfiguration()

// Lines 376-393
private func refreshClaudeCodeQuotasInternal() async {
    let quotas = await claudeCodeFetcher.fetchAsProviderQuota()
    // ... merge logic
}
```

**Migration Steps:**

1. **Remove declaration** (line 41):
   ```swift
   // DELETE THIS LINE
   @ObservationIgnored private let claudeCodeFetcher = ClaudeCodeQuotaFetcher()
   ```

2. **Remove from updateProxyConfiguration()** (line 174):
   ```swift
   // DELETE THIS LINE
   await claudeCodeFetcher.updateProxyConfiguration()
   ```

3. **Update refreshClaudeCodeQuotasInternal()** (lines 376-393):
   ```swift
   private func refreshClaudeCodeQuotasInternal() async {
       if let quotas = await daemonQuotaService.fetchQuotas(for: .claude) {
           // Merge with existing data (don't overwrite proxy data)
           if var existing = providerQuotas[.claude] {
               for (email, quota) in quotas {
                   existing[email] = quota
               }
               providerQuotas[.claude] = existing
           } else {
               providerQuotas[.claude] = quotas
           }
       }
   }
   ```

4. **Delete file:**
   ```bash
   git rm Quotio/Services/QuotaFetchers/ClaudeCodeQuotaFetcher.swift
   ```

5. **Verify build**

---

### 4A.3: Delete GeminiCLIQuotaFetcher.swift (186 lines)

**File:** `Quotio/Services/QuotaFetchers/GeminiCLIQuotaFetcher.swift`
**TS Equivalent:** `quotio-cli/src/services/quota-fetchers/gemini.ts`

**Current Usage in QuotaViewModel:**
```swift
// Line 44
@ObservationIgnored private let geminiCLIFetcher = GeminiCLIQuotaFetcher()

// Line 177
await geminiCLIFetcher.updateProxyConfiguration()

// Lines 428-442 (only in Monitor Mode)
private func refreshGeminiCLIQuotasInternal() async {
    guard modeManager.isMonitorMode else { return }
    let quotas = await geminiCLIFetcher.fetchAsProviderQuota()
    // ... merge logic
}
```

**Migration Steps:**

1. **Remove declaration** (line 44)

2. **Remove from updateProxyConfiguration()** (line 177)

3. **Update refreshGeminiCLIQuotasInternal()** (lines 428-442):
   ```swift
   private func refreshGeminiCLIQuotasInternal() async {
       guard modeManager.isMonitorMode else { return }
       
       if let quotas = await daemonQuotaService.fetchQuotas(for: .gemini) {
           if var existing = providerQuotas[.gemini] {
               for (email, quota) in quotas {
                   existing[email] = quota
               }
               providerQuotas[.gemini] = existing
           } else {
               providerQuotas[.gemini] = quotas
           }
       }
   }
   ```

4. **Delete file:**
   ```bash
   git rm Quotio/Services/QuotaFetchers/GeminiCLIQuotaFetcher.swift
   ```

5. **Verify build**

---

### 4A.4: Delete CodexCLIQuotaFetcher.swift (370 lines)

**File:** `Quotio/Services/QuotaFetchers/CodexCLIQuotaFetcher.swift`
**TS Equivalent:** `quotio-cli/src/services/quota-fetchers/codex.ts`

**Current Usage in QuotaViewModel:**
```swift
// Line 43
@ObservationIgnored private let codexCLIFetcher = CodexCLIQuotaFetcher()

// Line 176
await codexCLIFetcher.updateProxyConfiguration()

// Lines 408-424 (only in Monitor Mode)
private func refreshCodexCLIQuotasInternal() async {
    guard modeManager.isMonitorMode else { return }
    let quotas = await codexCLIFetcher.fetchAsProviderQuota()
    // ... merge logic
}
```

**Migration Steps:**

1. **Remove declaration** (line 43)

2. **Remove from updateProxyConfiguration()** (line 176)

3. **Update refreshCodexCLIQuotasInternal()** (lines 408-424):
   ```swift
   private func refreshCodexCLIQuotasInternal() async {
       guard modeManager.isMonitorMode else { return }
       
       if let quotas = await daemonQuotaService.fetchQuotas(for: .codex) {
           if var existing = providerQuotas[.codex] {
               for (email, quota) in quotas {
                   existing[email] = quota
               }
               providerQuotas[.codex] = existing
           } else {
               providerQuotas[.codex] = quotas
           }
       }
   }
   ```

4. **Delete file:**
   ```bash
   git rm Quotio/Services/QuotaFetchers/CodexCLIQuotaFetcher.swift
   ```

5. **Verify build**

---

## Phase 4B: Blocked Deletions (1,006 lines)

These fetchers require additional IPC methods before they can be deleted.

### 4B.1: KiroQuotaFetcher.swift (519 lines) - BLOCKED

**Blocker:** Token refresh logic

**Current Usage:**
```swift
// Line 46
@ObservationIgnored private let kiroFetcher = KiroQuotaFetcher()

// Lines 533, 551 - Token refresh before quota fetch
await kiroFetcher.refreshAllTokensIfNeeded()

// Lines 466-518 - Complex remapping for authFiles
private func refreshKiroQuotasInternal() async {
    let rawQuotas = await kiroFetcher.fetchAllQuotas()
    // Complex remapping logic for authFiles and directAuthFiles
}
```

**Why Blocked:**
1. `refreshAllTokensIfNeeded()` - Proactive token refresh before quota fetch
2. Complex account key remapping logic for authFiles

**Required IPC Methods:**
```typescript
// Add to quotio-cli/src/services/daemon/service.ts
case "quota.refreshTokens":
    // Calls kiroFetcher.refreshAllTokensIfNeeded() equivalent
    return { success: true, refreshed: ["account1", "account2"] }
```

**Required Swift Changes:**
```swift
// Add to IPCProtocol.swift
case quotaRefreshTokens = "quota.refreshTokens"

// Add to DaemonIPCClient.swift
func refreshQuotaTokens(provider: String) async throws -> IPCQuotaRefreshTokensResult {
    try await call(.quotaRefreshTokens, params: IPCQuotaRefreshTokensParams(provider: provider))
}
```

**Migration Path:**
1. Implement `quota.refreshTokens` IPC in quotio-cli
2. Add Swift IPC types and client method
3. Replace `kiroFetcher.refreshAllTokensIfNeeded()` calls
4. Move remapping logic to DaemonQuotaService or simplify by using consistent keys from daemon
5. Delete Swift file

---

### 4B.2: CopilotQuotaFetcher.swift (487 lines) - BLOCKED

**Blocker:** Used by AgentConfigurationService

**Current Usage in QuotaViewModel:**
```swift
// Line 20
@ObservationIgnored private let copilotFetcher = CopilotQuotaFetcher()

// Line 172
await copilotFetcher.updateProxyConfiguration()

// Lines 1216-1218
private func refreshCopilotQuotasInternal() async {
    let quotas = await copilotFetcher.fetchAllCopilotQuotas()
    providerQuotas[.copilot] = quotas
}
```

**External Usage in AgentConfigurationService.swift:**
```swift
// Line 605-606
let copilotFetcher = CopilotQuotaFetcher()
let availableCopilotModelIds = await copilotFetcher.fetchUserAvailableModelIds()
```

**Why Blocked:**
`fetchUserAvailableModelIds()` is used to filter which Copilot models are available to the user when listing available models for agent configuration.

**Required IPC Methods:**
```typescript
// Add to quotio-cli/src/services/daemon/service.ts
case "copilot.availableModels":
    // Returns list of model IDs available to user's Copilot subscription
    return { success: true, modelIds: ["gpt-4o", "claude-3.5-sonnet", ...] }
```

**Required Swift Changes:**
```swift
// Add to IPCProtocol.swift
case copilotAvailableModels = "copilot.availableModels"

// Add to DaemonIPCClient.swift
func getCopilotAvailableModels() async throws -> IPCCopilotAvailableModelsResult {
    try await call(.copilotAvailableModels)
}
```

**Migration Path:**
1. Implement `copilot.availableModels` IPC in quotio-cli
2. Add Swift IPC types and client method
3. Update AgentConfigurationService to use DaemonIPCClient
4. Update QuotaViewModel refreshCopilotQuotasInternal()
5. Delete Swift file

---

## Implementation Order

### Recommended Sequence

```
Week 1: Phase 4A (Safe Deletions)
├── 4A.1: Delete OpenAIQuotaFetcher.swift (291 lines)
├── 4A.2: Delete ClaudeCodeQuotaFetcher.swift (364 lines)
├── 4A.3: Delete GeminiCLIQuotaFetcher.swift (186 lines)
└── 4A.4: Delete CodexCLIQuotaFetcher.swift (370 lines)
    Total: 1,211 lines removed

Week 2: Phase 4B Prerequisites
├── Add quota.refreshTokens IPC method
└── Add copilot.availableModels IPC method

Week 3: Phase 4B (Blocked Deletions)
├── 4B.1: Delete KiroQuotaFetcher.swift (519 lines)
└── 4B.2: Delete CopilotQuotaFetcher.swift (487 lines)
    Total: 1,006 lines removed

Grand Total: 2,217 lines removed
```

---

## Fallback Strategy

### Current Fallback Pattern

When daemon is unavailable, `refreshQuotasViaDirectFetchers()` uses Swift fetchers directly.

### Post-Migration Behavior

After Phase 4A completion:
- If daemon unavailable: Quota fetch for deleted providers will fail silently
- UI shows stale data or "Unable to refresh" message
- User can manually start daemon to refresh

**Recommended UI Change:**
```swift
// Add to QuotaViewModel
var quotaRefreshError: String? {
    if !daemonManager.isRunning {
        return "Start daemon to refresh quotas"
    }
    return nil
}
```

---

## Verification Checklist

### Before Each Deletion

- [ ] Verify TS equivalent exists and passes tests: `cd quotio-cli && bun test`
- [ ] Search for all usages: `rg "FetcherName" Quotio/`
- [ ] Check for method-specific usages beyond standard fetch

### After Each Deletion

- [ ] Build succeeds: `xcodebuild -scheme Quotio -configuration Debug build`
- [ ] No new compiler warnings
- [ ] Manual test: Start app, verify quota refresh works

### After Phase 4A Complete

- [ ] All 4 fetchers deleted
- [ ] `git diff --stat` shows ~1,211 lines removed
- [ ] Full E2E test: Start proxy, refresh quotas, verify all providers
- [ ] Test Monitor Mode: Verify quotas still load

### After Phase 4B Complete

- [ ] All 6 fetchers deleted
- [ ] `git diff --stat` shows ~2,217 lines removed
- [ ] Test Kiro token refresh works via daemon
- [ ] Test AgentConfiguration model filtering works

---

## Commands Reference

```bash
# Verify CLI tests pass
cd quotio-cli && bun test

# Check for usages before deletion
rg "OpenAIQuotaFetcher" Quotio/ --line-number
rg "ClaudeCodeQuotaFetcher" Quotio/ --line-number
rg "GeminiCLIQuotaFetcher" Quotio/ --line-number
rg "CodexCLIQuotaFetcher" Quotio/ --line-number
rg "KiroQuotaFetcher" Quotio/ --line-number
rg "CopilotQuotaFetcher" Quotio/ --line-number

# Delete files
git rm Quotio/Services/QuotaFetchers/OpenAIQuotaFetcher.swift
git rm Quotio/Services/QuotaFetchers/ClaudeCodeQuotaFetcher.swift
git rm Quotio/Services/QuotaFetchers/GeminiCLIQuotaFetcher.swift
git rm Quotio/Services/QuotaFetchers/CodexCLIQuotaFetcher.swift

# Verify build
xcodebuild -project Quotio.xcodeproj -scheme Quotio -configuration Debug build 2>&1 | grep -E "error:|warning:"

# Check lines removed
git diff --stat HEAD~1
```

---

## Notes

- **GLMQuotaFetcher** (line 21) is NOT in scope - it's a different fetcher not listed for deletion
- **AntigravityQuotaFetcher** stays in Swift - complex Protobuf/SQLite logic
- **CursorQuotaFetcher** stays in Swift - reads local SQLite (macOS-specific)
- **TraeQuotaFetcher** stays in Swift - reads local JSON (macOS-specific)
- After Phase 4, the Services/AGENTS.md should be updated to remove deleted fetchers from documentation
