# DeviceActivityMonitor extension (scaffold)

Sources for a `com.apple.deviceactivity.monitor-extension` target.

## Add in Xcode (after `npx expo prebuild`)

1. Open `ios/*.xcworkspace`.
2. **File → New → Target → Device Activity Monitor Extension** (or generic App Extension with the monitor point).
3. Product name: `DeviceActivityMonitor`
4. Bundle ID: `com.sampritchard.screentimescorer.DeviceActivityMonitor`
5. Replace generated Swift with `DeviceActivityMonitorExtension.swift` from this folder.
6. Use this folder’s `Info.plist` / entitlements as reference.
7. Enable **Family Controls** + App Group `group.com.sampritchard.screentimescorer` on the **extension App ID** in the Apple Developer portal (extension needs its own FamilyControls approval coverage).
8. Regenerate profiles; build/run on a **real device**.

Until the extension target exists, `requestPermission()` / `isAuthorized()` still work from the main app module; `getTodayUsage()` returns `source: "pending"` with zeros until the monitor writes App Group keys.
