# Apply the Apple Screen Time patch (Samuel’s CLI)

Cursor often cannot push to `sampritch/screentimescorer`. Use this zip on your machine.

**Zips (same contents, no `node_modules`, no `.env`):**

- Project media: see coordinator handoff / `media/apple-screentime-patch.zip`
- Artifact copy: `/opt/cursor/artifacts/apple-screentime-patch.zip` (on the agent VM)

## Option A — Patch an existing clone

```bash
cd ~/src   # or wherever you keep repos
git clone https://github.com/sampritch/screentimescorer.git
cd screentimescorer

# Inspect the patch tree (unzip to a sibling folder first if you want a diff)
unzip -l /path/to/apple-screentime-patch.zip | head

# Overlay patch files onto the repo (zip root = project files)
unzip -o /path/to/apple-screentime-patch.zip -d .

npm install
npx tsc --noEmit

git checkout -b cursor/apple-screentime-device-usage-d51d
git add modules plugins src docs ios-placeholders app.json package.json package-lock.json README.md
git status   # confirm no .env
git commit -m "Add FamilyControls device usage module and Link device flow"
git push -u origin cursor/apple-screentime-device-usage-d51d
```

Then open a PR on GitHub from that branch into `main`.

## Option B — Already on the feature branch from the agent

If you pulled the agent’s branch (when push worked):

```bash
git fetch origin
git checkout cursor/apple-screentime-device-usage-d51d
npm install
```

## After apply — iOS device

```bash
npx expo prebuild --platform ios
npx expo run:ios --device
```

Complete Apple portal + Xcode steps in [`FAMILYCONTROLS.md`](./FAMILYCONTROLS.md).

## Secrets

- Keep Supabase keys in root `.env` only (never commit).
- `.env.example` stays template-only.
- Do not put Apple signing certs, `.p12`, or provisioning profiles in the repo.
