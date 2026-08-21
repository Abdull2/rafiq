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


## R32 — profile context, Fiqh al-Busola, Mujahada, benefit routing
- `profile-v1` may now include optional additive fields: `married`, `hasKids`, `timeBand`, `moneyBand`, `skills[]`. Existing age/gender/advancedIssues remain unchanged. Current users are not forced through onboarding again.
- New local user keys: `mujahada-weight-v1`, `fiqh-busola-progress-v1`, `benefit-choice-v1`.
- New static content files: `fiqh-busola.json`, `benefit.json`. Static religious/scientific content is not user data.
- No backend, account system, analytics, cloud sync or telemetry was added.

## R36 — Tafsir Muyassar external-content path
R36 does not add a backend or database. It adds an on-demand external content view for **التفسير الميسر** using the official King Fahd Complex embed URL. The iframe is lazy: it receives a `src` only after the user explicitly opens the tafsir. Exact-ayah Tafsir Muyassar links use Quran.com as a viewer; the canonical publisher/source remains the King Fahd Complex. No new user persistence is created, and the existing Al-Mukhtasar proxy architecture remains separate and unchanged.

## R37 — Home/Knowledge restructure + Al-Mukhtasar retirement (2026-08-21)

R37 adds no new cloud/backend architecture and no new persistent user key.

- Home resume reads existing local state only (`quran-pos`, `qalb-levels-v1`, `fiqh-busola-progress-v1`) and routes to existing systems. It does not create a second planning/history/progress database.
- New knowledge datasets (`usul-tafsir.json`, `usul-fiqh.json`, `fuqaha.json`, `islamic-history.json`) are static educational content, not user data.
- Full Tafseer Muyassar reading is opened through the official King Fahd Complex embed. No new local tafsir-reading-position key is created.
- Al-Mukhtasar active runtime/UI is removed. Existing `tafsir-pos-v1` records are intentionally retained as legacy local data to avoid silently deleting a user's prior record. New R37 UI does not write/update that key.
- `rafiq:data-version` remains 2. Backup metadata app version is 24.37.0.

## R38 — Zikr/Tazkiyah landing maps + Knowledge source presentation (2026-08-21)

R38 adds no backend, account, analytics, cloud sync, or new persistent state.

- `v-zikrhub` is a UI landing view. It routes to the existing `azkar`, `dua`, `tasbih`, and `asma` screens; direct Hisn access sets the existing in-memory `azkarMode` and then opens the existing Adhkar view.
- Tazkiyah keeps the stable internal route/ID `qalb`. `hHome()` is only an entry map and routes into the existing `hRender`, `hObstacles`, `hNafs`, and `hPathsRender` systems after loading the existing local state.
- Simple Knowledge source deduplication compares an item's source URL with the dataset's primary `meta.url` and suppresses only the repeated visual copy. Different URLs remain visible and the underlying source arrays are retained.
- `usul-tafsir.json` keeps all existing module IDs. The change is additive educational text, not a user-data shape change.
- `rafiq:data-version` remains 2. Backup metadata app version is 24.38.0.
