# Quotio/Services/Proxy/CLIProxyManager.swift

[← Back to Module](../modules/root/MODULE.md) | [← Back to INDEX](../INDEX.md)

## Overview

- **Lines:** 1776
- **Language:** Swift
- **Symbols:** 57
- **Public symbols:** 0

## Symbol Table

| Line | Kind | Name | Visibility | Signature |
| ---- | ---- | ---- | ---------- | --------- |
| 9 | class | CLIProxyManager | (internal) | `class CLIProxyManager` |
| 160 | method | init | (internal) | `init()` |
| 193 | fn | updateConfigPort | (private) | `private func updateConfigPort(_ newPort: UInt16)` |
| 203 | fn | updateConfigLogging | (internal) | `func updateConfigLogging(enabled: Bool)` |
| 216 | fn | updateConfigRoutingStrategy | (internal) | `func updateConfigRoutingStrategy(_ strategy: St...` |
| 226 | fn | updateConfigProxyURL | (internal) | `func updateConfigProxyURL(_ url: String?)` |
| 246 | fn | ensureConfigExists | (private) | `private func ensureConfigExists()` |
| 280 | fn | syncSecretKeyInConfig | (private) | `private func syncSecretKeyInConfig()` |
| 296 | fn | regenerateManagementKey | (internal) | `func regenerateManagementKey() async throws` |
| 327 | fn | syncProxyURLInConfig | (private) | `private func syncProxyURLInConfig()` |
| 340 | fn | syncCustomProvidersToConfig | (private) | `private func syncCustomProvidersToConfig()` |
| 357 | fn | downloadAndInstallBinary | (internal) | `func downloadAndInstallBinary() async throws` |
| 418 | fn | fetchLatestRelease | (private) | `private func fetchLatestRelease() async throws ...` |
| 437 | fn | findCompatibleAsset | (private) | `private func findCompatibleAsset(in release: Re...` |
| 462 | fn | downloadAsset | (private) | `private func downloadAsset(url: String) async t...` |
| 479 | fn | extractAndInstall | (private) | `private func extractAndInstall(data: Data, asse...` |
| 541 | fn | findBinaryInDirectory | (private) | `private func findBinaryInDirectory(_ directory:...` |
| 574 | fn | start | (internal) | `func start() async throws` |
| 706 | fn | stop | (internal) | `func stop()` |
| 762 | fn | startHealthMonitor | (private) | `private func startHealthMonitor()` |
| 776 | fn | stopHealthMonitor | (private) | `private func stopHealthMonitor()` |
| 781 | fn | performHealthCheck | (private) | `private func performHealthCheck() async` |
| 844 | fn | cleanupOrphanProcesses | (private) | `private func cleanupOrphanProcesses() async` |
| 898 | fn | terminateAuthProcess | (internal) | `func terminateAuthProcess()` |
| 904 | fn | toggle | (internal) | `func toggle() async throws` |
| 912 | fn | copyEndpointToClipboard | (internal) | `func copyEndpointToClipboard()` |
| 917 | fn | revealInFinder | (internal) | `func revealInFinder()` |
| 923 | enum | ProxyError | (internal) | `enum ProxyError` |
| 954 | enum | AuthCommand | (internal) | `enum AuthCommand` |
| 992 | struct | AuthCommandResult | (internal) | `struct AuthCommandResult` |
| 998 | mod | extension CLIProxyManager | (internal) | - |
| 999 | fn | runAuthCommand | (internal) | `func runAuthCommand(_ command: AuthCommand) asy...` |
| 1031 | fn | appendOutput | (internal) | `func appendOutput(_ str: String)` |
| 1035 | fn | tryResume | (internal) | `func tryResume() -> Bool` |
| 1046 | fn | safeResume | (internal) | `@Sendable func safeResume(_ result: AuthCommand...` |
| 1146 | mod | extension CLIProxyManager | (internal) | - |
| 1175 | fn | checkForUpgrade | (internal) | `func checkForUpgrade() async` |
| 1256 | fn | saveInstalledVersion | (private) | `private func saveInstalledVersion(_ version: St...` |
| 1264 | fn | fetchAvailableReleases | (internal) | `func fetchAvailableReleases(limit: Int = 10) as...` |
| 1284 | fn | versionInfo | (internal) | `func versionInfo(from release: GitHubRelease) -...` |
| 1290 | fn | fetchGitHubRelease | (private) | `private func fetchGitHubRelease(tag: String) as...` |
| 1310 | fn | findCompatibleAsset | (private) | `private func findCompatibleAsset(from release: ...` |
| 1343 | fn | performManagedUpgrade | (internal) | `func performManagedUpgrade(to version: ProxyVer...` |
| 1397 | fn | downloadAndInstallVersion | (private) | `private func downloadAndInstallVersion(_ versio...` |
| 1444 | fn | startDryRun | (private) | `private func startDryRun(version: String) async...` |
| 1515 | fn | promote | (private) | `private func promote(version: String) async throws` |
| 1550 | fn | rollback | (internal) | `func rollback() async throws` |
| 1583 | fn | stopTestProxy | (private) | `private func stopTestProxy() async` |
| 1612 | fn | stopTestProxySync | (private) | `private func stopTestProxySync()` |
| 1638 | fn | findUnusedPort | (private) | `private func findUnusedPort() throws -> UInt16` |
| 1648 | fn | isPortInUse | (private) | `private func isPortInUse(_ port: UInt16) -> Bool` |
| 1667 | fn | createTestConfig | (private) | `private func createTestConfig(port: UInt16) -> ...` |
| 1695 | fn | cleanupTestConfig | (private) | `private func cleanupTestConfig(_ configPath: St...` |
| 1703 | fn | isNewerVersion | (private) | `private func isNewerVersion(_ newer: String, th...` |
| 1706 | fn | parseVersion | (internal) | `func parseVersion(_ version: String) -> [Int]` |
| 1738 | fn | findPreviousVersion | (private) | `private func findPreviousVersion() -> String?` |
| 1751 | fn | migrateToVersionedStorage | (internal) | `func migrateToVersionedStorage() async throws` |

## Memory Markers

### 🟢 `NOTE` (line 186)

> Bridge mode default is registered in AppDelegate.applicationDidFinishLaunching()

### 🟢 `NOTE` (line 215)

> Changes take effect after proxy restart (CLIProxyAPI does not support live routing API)

