# Quotio/ViewModels/QuotaViewModel.swift

[← Back to Module](../modules/root/MODULE.md) | [← Back to INDEX](../INDEX.md)

## Overview

- **Lines:** 1657
- **Language:** Swift
- **Symbols:** 79
- **Public symbols:** 0

## Symbol Table

| Line | Kind | Name | Visibility | Signature |
| ---- | ---- | ---- | ---------- | --------- |
| 11 | class | QuotaViewModel | (internal) | `class QuotaViewModel` |
| 111 | method | init | (internal) | `init()` |
| 119 | fn | setupRefreshCadenceCallback | (private) | `private func setupRefreshCadenceCallback()` |
| 127 | fn | setupWarmupCallback | (private) | `private func setupWarmupCallback()` |
| 145 | fn | restartAutoRefresh | (private) | `private func restartAutoRefresh()` |
| 159 | fn | initialize | (internal) | `func initialize() async` |
| 168 | fn | initializeFullMode | (private) | `private func initializeFullMode() async` |
| 185 | fn | checkForProxyUpgrade | (private) | `private func checkForProxyUpgrade() async` |
| 190 | fn | initializeQuotaOnlyMode | (private) | `private func initializeQuotaOnlyMode() async` |
| 204 | fn | loadDirectAuthFiles | (internal) | `func loadDirectAuthFiles() async` |
| 210 | fn | refreshQuotasDirectly | (internal) | `func refreshQuotasDirectly() async` |
| 235 | fn | autoSelectMenuBarItems | (private) | `private func autoSelectMenuBarItems()` |
| 272 | fn | refreshClaudeCodeQuotasInternal | (private) | `private func refreshClaudeCodeQuotasInternal() ...` |
| 293 | fn | refreshCursorQuotasInternal | (private) | `private func refreshCursorQuotasInternal() async` |
| 304 | fn | refreshCodexCLIQuotasInternal | (private) | `private func refreshCodexCLIQuotasInternal() async` |
| 324 | fn | refreshGeminiCLIQuotasInternal | (private) | `private func refreshGeminiCLIQuotasInternal() a...` |
| 342 | fn | refreshGlmQuotasInternal | (private) | `private func refreshGlmQuotasInternal() async` |
| 352 | fn | refreshTraeQuotasInternal | (private) | `private func refreshTraeQuotasInternal() async` |
| 362 | fn | refreshKiroQuotasInternal | (private) | `private func refreshKiroQuotasInternal() async` |
| 368 | fn | cleanName | (internal) | `func cleanName(_ name: String) -> String` |
| 418 | fn | startQuotaOnlyAutoRefresh | (private) | `private func startQuotaOnlyAutoRefresh()` |
| 435 | fn | startQuotaAutoRefreshWithoutProxy | (private) | `private func startQuotaAutoRefreshWithoutProxy()` |
| 453 | fn | isWarmupEnabled | (internal) | `func isWarmupEnabled(for provider: AIProvider, ...` |
| 457 | fn | warmupStatus | (internal) | `func warmupStatus(provider: AIProvider, account...` |
| 462 | fn | warmupNextRunDate | (internal) | `func warmupNextRunDate(provider: AIProvider, ac...` |
| 467 | fn | toggleWarmup | (internal) | `func toggleWarmup(for provider: AIProvider, acc...` |
| 476 | fn | setWarmupEnabled | (internal) | `func setWarmupEnabled(_ enabled: Bool, provider...` |
| 488 | fn | nextDailyRunDate | (private) | `private func nextDailyRunDate(minutes: Int, now...` |
| 499 | fn | restartWarmupScheduler | (private) | `private func restartWarmupScheduler()` |
| 532 | fn | runWarmupCycle | (private) | `private func runWarmupCycle() async` |
| 595 | fn | warmupAccount | (private) | `private func warmupAccount(provider: AIProvider...` |
| 640 | fn | warmupAccount | (private) | `private func warmupAccount(     provider: AIPro...` |
| 701 | fn | fetchWarmupModels | (private) | `private func fetchWarmupModels(     provider: A...` |
| 725 | fn | warmupAvailableModels | (internal) | `func warmupAvailableModels(provider: AIProvider...` |
| 738 | fn | warmupAuthInfo | (private) | `private func warmupAuthInfo(provider: AIProvide...` |
| 760 | fn | warmupTargets | (private) | `private func warmupTargets() -> [WarmupAccountKey]` |
| 774 | fn | updateWarmupStatus | (private) | `private func updateWarmupStatus(for key: Warmup...` |
| 803 | fn | startProxy | (internal) | `func startProxy() async` |
| 825 | fn | stopProxy | (internal) | `func stopProxy()` |
| 847 | fn | toggleProxy | (internal) | `func toggleProxy() async` |
| 855 | fn | setupAPIClient | (private) | `private func setupAPIClient()` |
| 862 | fn | startAutoRefresh | (private) | `private func startAutoRefresh()` |
| 899 | fn | attemptProxyRecovery | (private) | `private func attemptProxyRecovery() async` |
| 915 | fn | refreshData | (internal) | `func refreshData() async` |
| 948 | fn | manualRefresh | (internal) | `func manualRefresh() async` |
| 959 | fn | refreshAllQuotas | (internal) | `func refreshAllQuotas() async` |
| 987 | fn | refreshQuotasUnified | (internal) | `func refreshQuotasUnified() async` |
| 1017 | fn | refreshAntigravityQuotasInternal | (private) | `private func refreshAntigravityQuotasInternal()...` |
| 1035 | fn | refreshAntigravityQuotasWithoutDetect | (private) | `private func refreshAntigravityQuotasWithoutDet...` |
| 1050 | fn | isAntigravityAccountActive | (internal) | `func isAntigravityAccountActive(email: String) ...` |
| 1055 | fn | switchAntigravityAccount | (internal) | `func switchAntigravityAccount(email: String) async` |
| 1067 | fn | beginAntigravitySwitch | (internal) | `func beginAntigravitySwitch(accountId: String, ...` |
| 1072 | fn | cancelAntigravitySwitch | (internal) | `func cancelAntigravitySwitch()` |
| 1077 | fn | dismissAntigravitySwitchResult | (internal) | `func dismissAntigravitySwitchResult()` |
| 1080 | fn | refreshOpenAIQuotasInternal | (private) | `private func refreshOpenAIQuotasInternal() async` |
| 1085 | fn | refreshCopilotQuotasInternal | (private) | `private func refreshCopilotQuotasInternal() async` |
| 1090 | fn | refreshQuotaForProvider | (internal) | `func refreshQuotaForProvider(_ provider: AIProv...` |
| 1121 | fn | refreshAutoDetectedProviders | (internal) | `func refreshAutoDetectedProviders() async` |
| 1128 | fn | startOAuth | (internal) | `func startOAuth(for provider: AIProvider, proje...` |
| 1170 | fn | startCopilotAuth | (private) | `private func startCopilotAuth() async` |
| 1187 | fn | startKiroAuth | (private) | `private func startKiroAuth(method: AuthCommand)...` |
| 1221 | fn | pollCopilotAuthCompletion | (private) | `private func pollCopilotAuthCompletion() async` |
| 1238 | fn | pollKiroAuthCompletion | (private) | `private func pollKiroAuthCompletion() async` |
| 1256 | fn | pollOAuthStatus | (private) | `private func pollOAuthStatus(state: String, pro...` |
| 1284 | fn | cancelOAuth | (internal) | `func cancelOAuth()` |
| 1288 | fn | deleteAuthFile | (internal) | `func deleteAuthFile(_ file: AuthFile) async` |
| 1316 | fn | pruneMenuBarItems | (private) | `private func pruneMenuBarItems()` |
| 1360 | fn | importVertexServiceAccount | (internal) | `func importVertexServiceAccount(url: URL) async` |
| 1384 | fn | fetchAPIKeys | (internal) | `func fetchAPIKeys() async` |
| 1394 | fn | addAPIKey | (internal) | `func addAPIKey(_ key: String) async` |
| 1406 | fn | updateAPIKey | (internal) | `func updateAPIKey(old: String, new: String) async` |
| 1418 | fn | deleteAPIKey | (internal) | `func deleteAPIKey(_ key: String) async` |
| 1431 | fn | checkAccountStatusChanges | (private) | `private func checkAccountStatusChanges()` |
| 1452 | fn | checkQuotaNotifications | (internal) | `func checkQuotaNotifications()` |
| 1484 | fn | scanIDEsWithConsent | (internal) | `func scanIDEsWithConsent(options: IDEScanOption...` |
| 1551 | fn | savePersistedIDEQuotas | (private) | `private func savePersistedIDEQuotas()` |
| 1574 | fn | loadPersistedIDEQuotas | (private) | `private func loadPersistedIDEQuotas()` |
| 1636 | fn | shortenAccountKey | (private) | `private func shortenAccountKey(_ key: String) -...` |
| 1648 | struct | OAuthState | (internal) | `struct OAuthState` |

## Memory Markers

### 🟢 `NOTE` (line 209)

> Cursor and Trae are NOT auto-refreshed - user must use "Scan for IDEs" (issue #29)

### 🟢 `NOTE` (line 217)

> Cursor and Trae removed from auto-refresh to address privacy concerns (issue #29)

### 🟢 `NOTE` (line 966)

> Cursor and Trae removed from auto-refresh (issue #29)

### 🟢 `NOTE` (line 986)

> Cursor and Trae require explicit user scan (issue #29)

### 🟢 `NOTE` (line 995)

> Cursor and Trae removed - require explicit scan (issue #29)

### 🟢 `NOTE` (line 1043)

> Don't call detectActiveAccount() here - already set by switch operation

