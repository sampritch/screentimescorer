# iOS entitlement placeholders

Apple **FamilyControls** distribution entitlement status: **APPROVED**.

| File | Purpose |
|---|---|
| `ScreenTimeScorer.entitlements` | Expected entitlement key for Screen Time / DeviceActivity family APIs |
| `../plugins/withFamilyControls.js` | Expo config plugin that writes the same key during `expo prebuild` |
| `../docs/FAMILYCONTROLS.md` | How to enable the capability on the App ID and regenerate profiles |

These placeholders do **not** implement usage collection. Native DeviceActivity / FamilyControls modules come in a later slice.
