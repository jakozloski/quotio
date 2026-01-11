# Quotio/Services/Proxy/CLIProxyManager.swift

[← Back to Module](../modules/root/MODULE.md) | [← Back to INDEX](../INDEX.md)

## Overview

- **Lines:** 1807
- **Language:** Swift
- **Symbols:** 59
- **Public symbols:** 0

## Symbol Table

| Line | Kind | Name | Visibility | Signature |
| ---- | ---- | ---- | ---------- | --------- |
| 9 | class | CLIProxyManager | (internal) | `class CLIProxyManager` |
| 177 | method | init | (internal) | `init()` |
| 210 | fn | updateConfigValue | (private) | `private func updateConfigValue(pattern: String,...` |
| 230 | fn | updateConfigPort | (private) | `private func updateConfigPort(_ newPort: UInt16)` |
| 234 | fn | updateConfigHost | (private) | `private func updateConfigHost(_ host: String)` |
| 238 | fn | updateConfigLogging | (internal) | `func updateConfigLogging(enabled: Bool)` |
| 245 | fn | updateConfigRoutingStrategy | (internal) | `func updateConfigRoutingStrategy(_ strategy: St...` |
| 249 | fn | updateConfigProxyURL | (internal) | `func updateConfigProxyURL(_ url: String?)` |
| 269 | fn | ensureConfigExists | (private) | `private func ensureConfigExists()` |
| 303 | fn | syncSecretKeyInConfig | (private) | `private func syncSecretKeyInConfig()` |
| 319 | fn | regenerateManagementKey | (internal) | `func regenerateManagementKey() async throws` |
| 350 | fn | syncProxyURLInConfig | (private) | `private func syncProxyURLInConfig()` |
| 363 | fn | syncCustomProvidersToConfig | (private) | `private func syncCustomProvidersToConfig()` |
| 380 | fn | downloadAndInstallBinary | (internal) | `func downloadAndInstallBinary() async throws` |
| 441 | fn | fetchLatestRelease | (private) | `private func fetchLatestRelease() async throws ...` |
| 462 | fn | findCompatibleAsset | (private) | `private func findCompatibleAsset(in release: Re...` |
| 487 | fn | downloadAsset | (private) | `private func downloadAsset(url: String) async t...` |
| 506 | fn | extractAndInstall | (private) | `private func extractAndInstall(data: Data, asse...` |
| 568 | fn | findBinaryInDirectory | (private) | `private func findBinaryInDirectory(_ directory:...` |
| 601 | fn | start | (internal) | `func start() async throws` |
| 733 | fn | stop | (internal) | `func stop()` |
| 789 | fn | startHealthMonitor | (private) | `private func startHealthMonitor()` |
| 803 | fn | stopHealthMonitor | (private) | `private func stopHealthMonitor()` |
| 808 | fn | performHealthCheck | (private) | `private func performHealthCheck() async` |
| 871 | fn | cleanupOrphanProcesses | (private) | `private func cleanupOrphanProcesses() async` |
| 925 | fn | terminateAuthProcess | (internal) | `func terminateAuthProcess()` |
| 931 | fn | toggle | (internal) | `func toggle() async throws` |
| 939 | fn | copyEndpointToClipboard | (internal) | `func copyEndpointToClipboard()` |
| 944 | fn | revealInFinder | (internal) | `func revealInFinder()` |
| 950 | enum | ProxyError | (internal) | `enum ProxyError` |
| 981 | enum | AuthCommand | (internal) | `enum AuthCommand` |
| 1019 | struct | AuthCommandResult | (internal) | `struct AuthCommandResult` |
| 1025 | mod | extension CLIProxyManager | (internal) | - |
| 1026 | fn | runAuthCommand | (internal) | `func runAuthCommand(_ command: AuthCommand) asy...` |
| 1058 | fn | appendOutput | (internal) | `func appendOutput(_ str: String)` |
| 1062 | fn | tryResume | (internal) | `func tryResume() -> Bool` |
| 1073 | fn | safeResume | (internal) | `@Sendable func safeResume(_ result: AuthCommand...` |
| 1173 | mod | extension CLIProxyManager | (internal) | - |
| 1202 | fn | checkForUpgrade | (internal) | `func checkForUpgrade() async` |
| 1283 | fn | saveInstalledVersion | (private) | `private func saveInstalledVersion(_ version: St...` |
| 1291 | fn | fetchAvailableReleases | (internal) | `func fetchAvailableReleases(limit: Int = 10) as...` |
| 1313 | fn | versionInfo | (internal) | `func versionInfo(from release: GitHubRelease) -...` |
| 1319 | fn | fetchGitHubRelease | (private) | `private func fetchGitHubRelease(tag: String) as...` |
| 1341 | fn | findCompatibleAsset | (private) | `private func findCompatibleAsset(from release: ...` |
| 1374 | fn | performManagedUpgrade | (internal) | `func performManagedUpgrade(to version: ProxyVer...` |
| 1428 | fn | downloadAndInstallVersion | (private) | `private func downloadAndInstallVersion(_ versio...` |
| 1475 | fn | startDryRun | (private) | `private func startDryRun(version: String) async...` |
| 1546 | fn | promote | (private) | `private func promote(version: String) async throws` |
| 1581 | fn | rollback | (internal) | `func rollback() async throws` |
| 1614 | fn | stopTestProxy | (private) | `private func stopTestProxy() async` |
| 1643 | fn | stopTestProxySync | (private) | `private func stopTestProxySync()` |
| 1669 | fn | findUnusedPort | (private) | `private func findUnusedPort() throws -> UInt16` |
| 1679 | fn | isPortInUse | (private) | `private func isPortInUse(_ port: UInt16) -> Bool` |
| 1698 | fn | createTestConfig | (private) | `private func createTestConfig(port: UInt16) -> ...` |
| 1726 | fn | cleanupTestConfig | (private) | `private func cleanupTestConfig(_ configPath: St...` |
| 1734 | fn | isNewerVersion | (private) | `private func isNewerVersion(_ newer: String, th...` |
| 1737 | fn | parseVersion | (internal) | `func parseVersion(_ version: String) -> [Int]` |
| 1769 | fn | findPreviousVersion | (private) | `private func findPreviousVersion() -> String?` |
| 1782 | fn | migrateToVersionedStorage | (internal) | `func migrateToVersionedStorage() async throws` |

## Memory Markers

### 🟢 `NOTE` (line 203)

> Bridge mode default is registered in AppDelegate.applicationDidFinishLaunching()

### 🟢 `NOTE` (line 244)

> Changes take effect after proxy restart (CLIProxyAPI does not support live routing API)

