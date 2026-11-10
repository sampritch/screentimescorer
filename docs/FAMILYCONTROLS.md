# FamilyControls / DeviceActivity — iOS device usage

**Status:** Apple **FamilyControls** distribution entitlement is **APPROVED** for App ID `com.sampritchard.screentimescorer`.

This slice ships a real local Expo module + Link device UI. Android remains a stub (`not implemented`) until UsageStats (PT-10).

---

## What shipped

| Artifact | Role |
|---|---|
| `modules/device-usage/` | Local Expo module (`DeviceUsage`) |
| `modules/device-usage/ios/DeviceUsageModule.swift` | `requestPermission`, `isAuthorized`, `getTodayUsage`, `startDailyMonitoring` |
| `modules/device-usage/ios/DeviceActivityMonitorExtension/` | Monitor extension scaffold (App Group writer) |
| `modules/device-usage/android/` | Stub — rejects with NotImplemented |
| `plugins/withFamilyControls.js` | Family Controls + App Group entitlements on prebuild |
| `src/lib/deviceUsage.ts` | JS re-export of the module API |
| `src/screens/LinkDeviceScreen.tsx` | In-app Link device flow (`Platform.OS` gate) |
| `app.json` | Entitlements + `NSFamilyControlsUsageDescription` |

**JS API (iOS real / Android stub):**

```ts
import {
  requestPermission,
  isAuthorized,
  getTodayUsage,
} from './src/lib/deviceUsage';

await requestPermission(); // { status, platform, message? }
await isAuthorized();      // boolean
await getTodayUsage();     // { date, screenTimeMinutes, pickups, source, ... }
```

---

## What Samuel must configure (Apple Developer + Xcode)

### 1. App ID capabilities (main app)

1. Sign in at [developer.apple.com](https://developer.apple.com).
2. **Certificates, Identifiers & Profiles → Identifiers** → `com.sampritchard.screentimescorer`.
3. Enable **Family Controls**.
4. Enable **App Groups** → create/select `group.com.sampritchard.screentimescorer`.
5. Save; **regenerate** Development + Distribution provisioning profiles.

### 2. Extension App ID (for daily aggregates)

1. Create App ID `com.sampritchard.screentimescorer.DeviceActivityMonitor`.
2. Enable **Family Controls** (extension needs entitlement coverage — Apple often requires a separate approval for extension bundle IDs; confirm in the portal).
3. Enable the **same App Group** `group.com.sampritchard.screentimescorer`.
4. Regenerate profiles that include the extension.

### 3. Expo prebuild + Xcode

```bash
cd screentimescorer
npm install
npx expo prebuild --platform ios
open ios/*.xcworkspace   # macOS only
```

In Xcode:

1. Confirm main target entitlements include:
   - `com.apple.developer.family-controls` = true  
   - App Group `group.com.sampritchard.screentimescorer`
2. **Signing & Capabilities** → Team = Samuel’s Apple team; unique bundle ID as above.
3. Add **Device Activity Monitor Extension** target (bundle ID ending in `.DeviceActivityMonitor`).
4. Replace generated sources with files from  
   `modules/device-usage/ios/DeviceActivityMonitorExtension/`.
5. Add Family Controls + App Group capabilities on the **extension** target.
6. Ensure the extension is embedded in the app target’s **Frameworks, Libraries, and Embedded Content** / Embed Foundation Extensions.

Until the extension exists, authorization still works; `getTodayUsage()` returns `source: "pending"` with zeros.

---

## Run on a real device (Simulator is limited)

FamilyControls **does not authorize on Simulator**. Always use a physical iPhone/iPad.

```bash
# From macOS with Xcode + device plugged in / wireless debugging
npm install
npx expo prebuild --platform ios
npx expo run:ios --device
```

Or archive via EAS / Xcode → install on device / TestFlight (distribution profile must include Family Controls).

**Do not use Expo Go** — custom native modules require a **development build** (`expo-dev-client` / `expo run:ios`).

### Device test steps

1. Install the development build on a real iPhone signed with a profile that includes Family Controls.
2. Sign in to the app → **Home** or **Account → Link this device**.
3. Tap **Link with Apple Screen Time** → complete Face ID / system auth sheet.
4. Confirm status shows **Linked / authorized**.
5. Confirm `isAuthorized()` is true (UI shows linked).
6. After the DeviceActivity monitor extension is installed and has run interval callbacks, pull to refresh / re-open Link device — today’s screen time minutes should leave `pending` and show `source: device`.
7. Deny / revoke Screen Time access in iOS Settings and confirm the app reflects unauthorized / demo metrics.

### Android path

Link device → **Link with Android UsageStats** shows a stub alert.  
`requestPermission()` / `getTodayUsage()` return `notImplemented` / `source: "not_implemented"`. No UsageStats wiring yet.

---

## Product honesty / App Review

- Personal wellness on **this** device only — not parental surveillance of others.
- Pickups are **optional**; Apple has no simple public pickups integer. UI may show “not available yet”.
- Aggregates are daily totals via DeviceActivity monitor + App Group — **not** a clone of Settings → Screen Time charts.
- Never claim Settings-level Screen Time graphs in marketing until the bridge is proven on device.

---

## Architecture (short)

```
JS  requestPermission / getTodayUsage / isAuthorized
        │
        ▼
Expo module DeviceUsage (Swift)
        │  AuthorizationCenter (.individual)
        │  DeviceActivityCenter.startMonitoring(daily)
        ▼
App Group UserDefaults
  usage.date / usage.screenTimeMinutes / usage.pickups
        ▲
DeviceActivityMonitor extension (writes on interval/event)
```
