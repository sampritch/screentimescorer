# Apply the social auth + Face ID patch (Samuel’s CLI)

Cursor often cannot push to `sampritch/screentimescorer`. Use this zip on your machine.

**Zips (same contents, no `node_modules`, no `.env`):**

- Project media: `/cursor/stores/self/media/social-auth-faceid-patch.zip`
- Artifact copy: `/opt/cursor/artifacts/social-auth-faceid-patch.zip`

## Option A — Overlay onto an existing clone

```bash
cd ~/src   # or wherever you keep repos
git clone https://github.com/sampritch/screentimescorer.git
cd screentimescorer

# Inspect
unzip -l /path/to/social-auth-faceid-patch.zip | head

# Overlay (zip root = project files)
unzip -o /path/to/social-auth-faceid-patch.zip -d .

npm install
npx tsc --noEmit

git checkout -b cursor/social-auth-faceid-d539
git add \
  App.tsx app.json package.json package-lock.json \
  src/lib/supabase.ts src/lib/oauth.ts src/lib/secureStorage.ts \
  src/context/AuthContext.tsx src/context/BiometricContext.tsx \
  src/screens/AuthScreen.tsx src/screens/AccountScreen.tsx \
  src/screens/BiometricLockScreen.tsx src/navigation/RootNavigator.tsx \
  docs/SOCIAL-AUTH-FACEID.md docs/APPLY-SOCIAL-AUTH-FACEID-PATCH.md \
  README.md supabase/README.md .env.example
git status   # confirm no .env
git commit -m "Add Apple/Google sign-in and Face ID biometric unlock"
git push -u origin cursor/social-auth-faceid-d539
```

Then open a PR on GitHub from that branch into `main`.

## Option B — Agent branch already available

```bash
git fetch origin
git checkout cursor/social-auth-faceid-d539
npm install
```

## After apply — rebuild native

Apple Sign-In, Face ID, and OAuth redirects need a development build:

```bash
npx expo prebuild
npx expo run:ios --device
npx expo run:android
```

Complete console steps in [`SOCIAL-AUTH-FACEID.md`](./SOCIAL-AUTH-FACEID.md).

## Secrets

- Keep Supabase keys in root `.env` only (never commit).
- Never commit Apple `.p8`, Google client secrets, or provisioning profiles.
