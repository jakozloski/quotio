# Quotio/Views/Screens/SettingsScreen.swift

[← Back to Module](../modules/Quotio-Views-Screens/MODULE.md) | [← Back to INDEX](../INDEX.md)

## Overview

- **Lines:** 2354
- **Language:** Swift
- **Symbols:** 43
- **Public symbols:** 0

## Symbol Table

| Line | Kind | Name | Visibility | Signature |
| ---- | ---- | ---- | ---------- | --------- |
| 10 | struct | SettingsScreen | (internal) | `struct SettingsScreen` |
| 239 | fn | applyProxyURLSettings | (private) | `private func applyProxyURLSettings()` |
| 253 | struct | AppModeSection | (internal) | `struct AppModeSection` |
| 300 | fn | handleModeSelection | (private) | `private func handleModeSelection(_ mode: AppMode)` |
| 313 | fn | switchToMode | (private) | `private func switchToMode(_ mode: AppMode)` |
| 328 | struct | AppModeCard | (private) | `struct AppModeCard` |
| 417 | struct | PathLabel | (internal) | `struct PathLabel` |
| 441 | struct | NotificationSettingsSection | (internal) | `struct NotificationSettingsSection` |
| 511 | struct | QuotaDisplaySettingsSection | (internal) | `struct QuotaDisplaySettingsSection` |
| 539 | struct | RefreshCadenceSettingsSection | (internal) | `struct RefreshCadenceSettingsSection` |
| 578 | struct | UpdateSettingsSection | (internal) | `struct UpdateSettingsSection` |
| 620 | struct | ProxyUpdateSettingsSection | (internal) | `struct ProxyUpdateSettingsSection` |
| 750 | fn | checkForUpdate | (private) | `private func checkForUpdate()` |
| 760 | fn | performUpgrade | (private) | `private func performUpgrade(to version: ProxyVe...` |
| 779 | struct | ProxyVersionManagerSheet | (internal) | `struct ProxyVersionManagerSheet` |
| 938 | fn | sectionHeader | (private) | `@ViewBuilder   private func sectionHeader(_ tit...` |
| 953 | fn | isVersionInstalled | (private) | `private func isVersionInstalled(_ version: Stri...` |
| 957 | fn | refreshInstalledVersions | (private) | `private func refreshInstalledVersions()` |
| 961 | fn | loadReleases | (private) | `private func loadReleases() async` |
| 975 | fn | installVersion | (private) | `private func installVersion(_ release: GitHubRe...` |
| 993 | fn | performInstall | (private) | `private func performInstall(_ release: GitHubRe...` |
| 1014 | fn | activateVersion | (private) | `private func activateVersion(_ version: String)` |
| 1032 | fn | deleteVersion | (private) | `private func deleteVersion(_ version: String)` |
| 1045 | struct | InstalledVersionRow | (private) | `struct InstalledVersionRow` |
| 1103 | struct | AvailableVersionRow | (private) | `struct AvailableVersionRow` |
| 1189 | fn | formatDate | (private) | `private func formatDate(_ isoString: String) ->...` |
| 1207 | struct | MenuBarSettingsSection | (internal) | `struct MenuBarSettingsSection` |
| 1285 | struct | AppearanceSettingsSection | (internal) | `struct AppearanceSettingsSection` |
| 1314 | struct | PrivacySettingsSection | (internal) | `struct PrivacySettingsSection` |
| 1336 | struct | GeneralSettingsTab | (internal) | `struct GeneralSettingsTab` |
| 1387 | struct | AboutTab | (internal) | `struct AboutTab` |
| 1414 | struct | AboutScreen | (internal) | `struct AboutScreen` |
| 1629 | struct | AboutUpdateSection | (internal) | `struct AboutUpdateSection` |
| 1685 | struct | AboutProxyUpdateSection | (internal) | `struct AboutProxyUpdateSection` |
| 1821 | fn | checkForUpdate | (private) | `private func checkForUpdate()` |
| 1831 | fn | performUpgrade | (private) | `private func performUpgrade(to version: ProxyVe...` |
| 1850 | struct | VersionBadge | (internal) | `struct VersionBadge` |
| 1902 | struct | AboutUpdateCard | (internal) | `struct AboutUpdateCard` |
| 1993 | struct | AboutProxyUpdateCard | (internal) | `struct AboutProxyUpdateCard` |
| 2150 | fn | checkForUpdate | (private) | `private func checkForUpdate()` |
| 2160 | fn | performUpgrade | (private) | `private func performUpgrade(to version: ProxyVe...` |
| 2179 | struct | LinkCard | (internal) | `struct LinkCard` |
| 2266 | struct | ManagementKeyRow | (internal) | `struct ManagementKeyRow` |

## Memory Markers

### 🟢 `NOTE` (line 1235)

> QuotioApp's onChange handler will update the status bar

