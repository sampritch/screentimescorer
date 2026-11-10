# Social auth + Face ID / biometrics (Samuel checklist)

Bundle ID / package: **`com.sampritchard.screentimescorer`**  
App scheme (deep link): **`screentimescorer://auth/callback`**  
Supabase callback (always): **`https://<PROJECT_REF>.supabase.co/auth/v1/callback`**

Code already wires:

| Provider | Platform | Implementation |
|---|---|---|
| Apple | iOS (primary) | `expo-apple-authentication` → `supabase.auth.signInWithIdToken({ provider: 'apple' })` |
| Google | iOS + Android | `supabase.auth.signInWithOAuth({ provider: 'google' })` + `expo-web-browser` / `expo-auth-session` redirect |
| Email/password | both | unchanged |
| Face ID / biometrics | iOS Face ID · Android biometrics | `expo-local-authentication` gate after session; preference + session in Secure Store |

You must finish **dashboard / console** setup below before social buttons work in a **development build** (not Expo Go for Apple Sign-In / Face ID).

---

## A. Supabase Dashboard

### 1. Redirect URLs

**Authentication → URL Configuration**

Add to **Redirect URLs**:

```
screentimescorer://auth/callback
screentimescorer://**
```

Optional while testing with Expo tunnel / web:

```
exp://127.0.0.1:8081/--/auth/callback
http://localhost:8081
```

**Site URL** can stay your production web URL or the Supabase project URL for now.

### 2. Enable Google provider

**Authentication → Providers → Google → Enable**

Paste:

- **Client ID** = Google Cloud **Web** OAuth client ID  
- **Client Secret** = that Web client’s secret  

Also add any **iOS** / **Android** OAuth client IDs into the same Google provider **Client IDs** list (comma-separated if the UI supports multiple), so native ID tokens would validate later if you add native Google Sign-In.

### 3. Enable Apple provider

**Authentication → Providers → Apple → Enable**

Fill:

| Field | Value |
|---|---|
| **Client IDs** | First: Services ID (e.g. `com.sampritchard.screentimescorer.web`). Also include App ID / Bundle ID `com.sampritchard.screentimescorer` for native. |
| **Secret Key** (JWT) | Generated from Apple `.p8` key (see section B). Supabase UI can generate this if you paste Key ID, Team ID, and `.p8`. |
| **Key ID** | From Apple Developer → Keys |
| **Team ID** | Apple Developer membership Team ID |

Native iOS Sign in with Apple uses `signInWithIdToken` and validates against Client IDs that include the Bundle ID. Web / Android Apple OAuth (if you add it later) needs the Services ID **first** in Client IDs.

---

## B. Apple Developer

1. **Certificates, Identifiers & Profiles → Identifiers**  
   Confirm App ID **`com.sampritchard.screentimescorer`** has **Sign In with Apple** enabled (capability).

2. Create a **Services ID** (e.g. `com.sampritchard.screentimescorer.web`):
   - Enable **Sign In with Apple** → Configure  
   - **Primary App ID**: the App ID above  
   - **Domains**: `<PROJECT_REF>.supabase.co`  
   - **Return URLs**: `https://<PROJECT_REF>.supabase.co/auth/v1/callback`

3. Create a **Key** with **Sign In with Apple** → download the **`.p8` once**. Note **Key ID**.

4. In Supabase Apple provider, upload/paste Key ID + Team ID + `.p8` so Supabase can mint the client secret JWT (rotate before 6 months if you manage secret yourself).

5. Xcode / Expo: `usesAppleSignIn: true` and plugin `expo-apple-authentication` are already in `app.json`. Rebuild native:

```bash
npx expo prebuild --clean
npx expo run:ios --device
```

---

## C. Google Cloud Console

1. Create/select a GCP project → **APIs & Services → OAuth consent screen** (External or Internal). Add scopes:
   - `openid`
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`

2. **Credentials → Create OAuth client ID → Web application**
   - **Authorized redirect URIs**:  
     `https://<PROJECT_REF>.supabase.co/auth/v1/callback`
   - Copy **Client ID** + **Client Secret** → Supabase Google provider (required for the browser OAuth flow the app uses).

3. (Recommended) **iOS** OAuth client:
   - Type: iOS  
   - Bundle ID: `com.sampritchard.screentimescorer`

4. (Recommended) **Android** OAuth client:
   - Type: Android  
   - Package: `com.sampritchard.screentimescorer`  
   - SHA-1: debug keystore + Play App Signing SHA-1  

   Get debug SHA-1:

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

5. Add those client IDs to Supabase Google provider Client IDs list as needed.

---

## D. Face ID / biometrics (no console work)

Already in the app:

- Account → **Unlock with Face ID / biometrics** switch  
- Session persisted via chunked **SecureStore** (`src/lib/secureStorage.ts`)  
- Lock screen after launch / return from background when enabled  

Requires a **dev client / production build** (Face ID not in Expo Go). Rebuild after adding `expo-local-authentication`.

---

## E. Smoke test

1. `cp .env.example .env` with real Supabase URL + anon key.  
2. Dev build on device.  
3. Auth screen: **Continue with Google** → browser → returns to app signed in.  
4. iOS: **Sign in with Apple** button → native sheet → signed in.  
5. Account → enable Face ID → background app → reopen → lock screen → unlock.  
6. Log out clears biometric preference.

---

## F. What this patch does **not** include

- No secrets, `.p8`, or OAuth client secrets in the repo  
- No native `@react-native-google-signin/google-signin` (uses Supabase OAuth + system browser instead)  
- Android Sign in with Apple (optional later via OAuth / Services ID)
