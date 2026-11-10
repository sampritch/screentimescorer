# iOS entitlement placeholders

Apple **FamilyControls** distribution entitlement status: **APPROVED**.

| File | Purpose |
|---|---|
| `ScreenTimeScorer.entitlements` | Expected entitlement keys (Family Controls + App Group) |
| `../plugins/withFamilyControls.js` | Expo config plugin that writes the same keys during `expo prebuild` |
| `../modules/device-usage/` | Local Expo module: authorization + daily aggregate bridge |
| `../modules/device-usage/ios/DeviceActivityMonitorExtension/` | Monitor extension scaffold (add target in Xcode) |
| `../docs/FAMILYCONTROLS.md` | Enable capability, real-device testing, Samuel checklist |

Main-app APIs (`requestPermission`, `isAuthorized`, `getTodayUsage`) ship in the local module. Aggregate numbers require the DeviceActivityMonitor extension writing to the App Group.
