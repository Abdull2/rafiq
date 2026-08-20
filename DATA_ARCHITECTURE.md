# Tadaruq — Data Architecture (current through v24 R24)

## Current state

There is **no central backend and no cloud user database** in the current Rafiq product. Publishing to Chrome Web Store or Google Play does not create one automatically.

### Chrome extension build
- Most app state in `app/app.js` is stored locally through the `store` wrapper, which falls back to `localStorage` in the extension page.
- Extension-only notebook/preferences/prayer badge data use `chrome.storage.local`; temporary launch/search commands use `chrome.storage.session`.
- The developer cannot remotely read a user's local records.

### Existing Android / Google Play package
The previously generated PWABuilder Android package is a Trusted Web Activity wrapper for:
`https://abdull2.github.io/rafiq/`

That package is a distribution shell around the hosted PWA. Google Play is **not** the backend. The website host serves the app files; user data still stays in that device/browser storage unless a separate backend is added.

## Consequences
- Each device has its own data.
- Chrome extension and Android/PWA data do not sync automatically.
- Uninstalling/clearing local site/app data may remove local records, so export/import remains important.
- The owner currently has no dashboard showing all users' personal records.

## Analytics vs database
These are separate decisions:
1. **Anonymous product analytics** can measure screens/features without storing personal notes, religious self-assessment text, selected problems, or health-related content.
2. **Cloud sync/database** is only needed if users should sign in and restore/sync their own data across devices.

Do not add either silently. Before implementation the owner must choose what is collected, whether login exists, retention/deletion rules, and update the privacy/store disclosures.

## Recommended privacy boundary for future analytics
Potential safe events: app_open, screen_view, content_open, saved_later_used, path_feature_opened, quiz_completed (without answers), export_used.

Do **not** send by default: journal text, notebook text, dua text entered by user, exact selected mental-health/relationship problem, geolocation coordinates, prayer/faith scores tied to an identity, or personal path check-in text/state.

## R10 — local data-safety layer
R10 adds `app/data-safety.js`. This is **not** a backend. It is a local compatibility/backup layer around the existing per-device data model.

- Local schema version: `rafiq:data-version = 2`. R17 adds only additive daily-plan/task-review fields; existing records remain valid.
- First R10 launch snapshots legacy local data before registering the schema version.
- Future schema/storage changes must run explicit migrations and roll back on validation failure.
- Settings now exports a fuller portable backup, audits local structures, verifies new backups with a SHA-256 checksum where supported, and imports old partial `muhasabah-backup` files non-destructively.
- `day:*`, `tas:*`, Qur'an position/font, Saved Later, personal paths, heart journal/progress, **Tazkiyah depth-study progress (`qalb-levels-v1`)**, dua/Riyad favorites, Irtaqi, todos, Khabia and profile/settings are covered by the local registry.
- In the Chrome extension, portable backup can also include the Rafiq notebook/preferences/prayer-extension state from `chrome.storage.local`.

See `DATA_SAFETY.md` before changing any persistent storage key or structure.


## R24 — Tazkiyah study-depth state
R24 keeps `rafiq:data-version = 2`. The persistent key `qalb-levels-v1` already existed in R23 and is retained for backward compatibility; R24 only registers it in the Data Safety registry and extends records additively with optional completion/review timestamps. Backups and safety snapshots now include it. The values mean **study progress/review history only**, never a religious or spiritual rank.

## R26 — قارئ المختصر
`tafsir-pos-v1` هو موضع قراءة محلي مستقل عن `quran-pos`. الاستفسار السريع عن تفسير آية من المصحف لا يغيّر موضع قراءة المختصر؛ زر «فتح في قارئ المختصر» فقط ينقل القراءة لهذا الموضع. نص التفسير، عند تفعيل التكامل، يُجلب آية واحدة في كل مرة عبر proxy سري ولا يُضمّن في المستودع.
