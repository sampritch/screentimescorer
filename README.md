# Screen Time Scorer

Cross-platform **React Native + Expo (TypeScript)** app that scores screen time and phone pickups, then tips users toward healthier habits.

| | |
|---|---|
| Owner | Samuel Pritchard |
| Bundle / Android package | `com.sampritchard.screentimescorer` |
| Target GitHub remote | https://github.com/sampritch/screentimescorer.git |
| Auth | Supabase email/password + Apple (iOS) + Google OAuth; optional Face ID / biometrics unlock |
| FamilyControls | **APPROVED** — local Expo module + Link device flow |
| Free tier | Today’s Phone Health Score + **one tip** |
| Paid (stub) | Trends, history, multiple tips, expert-team advice · **$1 / 7-day paid trial** |

This repo was scaffolded locally. **Do not expect a cloud push from Cursor** — push from your own machine/CLI (commands below).

---

## Prerequisites

- Node 20+ (Node 22 OK)
- npm
- Expo Go for JS-only smoke tests, **or** a dev client / prebuild for native modules
- A Supabase project (URL + anon key)
- macOS + Xcode for iOS device builds; Android Studio / SDK for Android

---

## Run locally

```bash
cd screentimescorer   # or wherever you cloned / unzipped
cp .env.example .env
# Edit .env with your Supabase Project URL and anon key

npm install
npx expo start
```

Useful scripts:

```bash
npm run android   # Expo start targeting Android
npm run ios       # Expo start targeting iOS (macOS)
npm run web       # Web smoke (limited)
```

### Dev client / prebuild (native-ready)

```bash
npx expo prebuild
npx expo run:android
# macOS:
npx expo run:ios
```

`expo-dev-client` is installed so custom native modules (UsageStats / FamilyControls) can land later without leaving Expo.

---

## Supabase setup

1. Create a Supabase project.
2. Enable **Email** auth (Auth → Providers).
3. Enable **Google** + **Apple** providers and add redirect URL `screentimescorer://auth/callback` — full console steps: [`docs/SOCIAL-AUTH-FACEID.md`](./docs/SOCIAL-AUTH-FACEID.md).
4. Copy **Project URL** + **anon public** key into `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

5. Optional SQL + delete-account Edge Function: see [`supabase/README.md`](./supabase/README.md).
6. Ship **`.env.example` only** — never commit real `.env` secrets.

Client code reads `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` via `src/lib/supabase.ts`. Sessions persist in **SecureStore** on device.

---

## Social auth + Face ID

| | |
|---|---|
| Apple | Native iOS via `expo-apple-authentication` → `signInWithIdToken` |
| Google | Supabase OAuth + `expo-auth-session` / `expo-web-browser` (iOS + Android) |
| Biometrics | Optional unlock gate (`expo-local-authentication`); toggle in Account |
| Apply zip | [`docs/APPLY-SOCIAL-AUTH-FACEID-PATCH.md`](./docs/APPLY-SOCIAL-AUTH-FACEID-PATCH.md) |
| Checklist | [`docs/SOCIAL-AUTH-FACEID.md`](./docs/SOCIAL-AUTH-FACEID.md) |

Needs a **development build** (not Expo Go) for Apple Sign-In and Face ID.

---

## Screens (MVP shell)

| Screen | Notes |
|---|---|
| **Auth** | Apple (iOS) · Google · email sign up / log in |
| **Home** | Today’s score hero + one tip (live metrics when linked) |
| **History** | Paid gate stub → demo week when stub trial active |
| **Tips** | Free: one tip; paid: multiple + expert-team stub |
| **Account** | Biometric unlock toggle, link device, log out, delete account |
| **Biometric lock** | Shown when Face ID / biometrics unlock is enabled |
| **Link device** | iOS FamilyControls auth · Android UsageStats stub |
| **Paywall** | Stub for $1 / 7-day paid trial (local entitlement flip) |

Tab bar: Home · History · Tips · Account.

---

## FamilyControls (iOS) — device usage

Entitlement is **approved**. This repo includes:

- Local Expo module `modules/device-usage` → `requestPermission()` / `isAuthorized()` / `getTodayUsage()`
- Config plugin + App Group `group.com.sampritchard.screentimescorer`
- DeviceActivityMonitor extension **scaffold** (add target in Xcode)
- In-app **Link this device** screen (`Platform.OS`: Apple real / Android stub)
- Docs: [`docs/FAMILYCONTROLS.md`](./docs/FAMILYCONTROLS.md) · apply zip: [`docs/APPLY-APPLE-SCREENTIME-PATCH.md`](./docs/APPLY-APPLE-SCREENTIME-PATCH.md)

**Real device required** (Simulator cannot authorize). Use a development build, not Expo Go:

```bash
npx expo prebuild --platform ios
npx expo run:ios --device
```

---

## Monetization stub

- Free = today’s score + one tip only.
- Paywall stub toggles a local “Paid trial” flag (no store billing yet).
- Next: RevenueCat over StoreKit 2 + Play Billing; webhook → `entitlement_active` on Supabase profile.

---

## Push this scaffold to GitHub (Samuel)

Cursor cannot access the remote. From a machine with GitHub auth (HTTPS or SSH):

### If you already have this folder with the initial `main` commit

```bash
cd /path/to/screentimescorer

git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/sampritch/screentimescorer.git

git branch -M main
git push -u origin main
```

### If you unzipped a copy without `.git`

```bash
cd /path/to/screentimescorer

git init
git add .
git commit -m "Initial commit: Expo Screen Time Scorer scaffold"

git branch -M main
git remote add origin https://github.com/sampritch/screentimescorer.git
git push -u origin main
```

### SSH alternative remote

```bash
git remote add origin git@github.com:sampritch/screentimescorer.git
git push -u origin main
```

Create the empty repo `sampritch/screentimescorer` on GitHub first (no README/license if you want a clean first push).

---

## Project layout

```
App.tsx
src/
  components/     PrimaryButton, PaidGate
  context/        Auth, Biometric, subscription stubs
  lib/            supabase, oauth, secureStorage, score, subscription, deviceUsage
  navigation/     stack + tabs
  screens/        Auth, BiometricLock, Home, History, Tips, Account, LinkDevice, Paywall
  theme/
modules/device-usage/   FamilyControls + Android stub Expo module
plugins/withFamilyControls.js
ios-placeholders/
supabase/
docs/FAMILYCONTROLS.md
docs/APPLY-APPLE-SCREENTIME-PATCH.md
docs/SOCIAL-AUTH-FACEID.md
docs/APPLY-SOCIAL-AUTH-FACEID-PATCH.md
.env.example
```

---

## License

See `LICENSE` (from Expo template). Product ownership: Samuel Pritchard.
