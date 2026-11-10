# FamilyControls (iOS) — approved entitlement notes

**Status:** Apple **FamilyControls** distribution entitlement is **APPROVED** for App ID `com.sampritchard.screentimescorer`.

This scaffold includes entitlement **placeholders** only. It does not yet ship a DeviceActivity / FamilyControls native module.

## What is already wired

| Artifact | Role |
|---|---|
| `app.json` → `ios.entitlements.com.apple.developer.family-controls` | Expo writes entitlement during prebuild |
| `app.json` → `ios.infoPlist.NSFamilyControlsUsageDescription` | Usage description string |
| `plugins/withFamilyControls.js` | Config plugin reinforcing the entitlement key |
| `ios-placeholders/ScreenTimeScorer.entitlements` | Reference plist for Xcode / audits |

## Enable on the App ID (Samuel)

1. Sign in at [developer.apple.com](https://developer.apple.com).
2. **Certificates, Identifiers & Profiles → Identifiers** → select `com.sampritchard.screentimescorer`.
3. Ensure **Family Controls** (and related DeviceActivity / Managed Settings capabilities as listed) is enabled.
4. Regenerate provisioning profiles after capability changes.
5. Run `npx expo prebuild` (or EAS Build) so the entitlement lands in the generated `ios/` project.
6. Confirm the generated entitlements file contains:

```xml
<key>com.apple.developer.family-controls</key>
<true/>
```

## Product honesty

- Rich iOS Screen Time / category reports require FamilyControls + DeviceActivity (+ ManagedSettings where needed).
- Until the native bridge is implemented, the app shows **demo metrics** and must not claim Settings-level Screen Time graphs.
- Android MVP continues via `PACKAGE_USAGE_STATS` / `UsageStatsManager` (permission listed in `app.json`; module TBD).

## Next engineering slice

1. Native Expo module for FamilyControls authorization + DeviceActivity reports.
2. Daily aggregate sync to Supabase (no raw infinite event logs).
3. Expand Home / History from demo metrics to live device data.
