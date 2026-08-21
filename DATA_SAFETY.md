# Tadaruq — Local Data Safety Layer (current through v24 R24; introduced in R10)

## Why this exists
Rafiq now has real users. Their local data must be treated as legacy user data that survives ordinary UI/content releases. R10 adds a guard layer without adding a cloud backend or central database.

## Data version
- Current Chrome extension code version is `24.4.0`; Google Play/TWA identity remains separate from the local data schema.
- Local schema version is separate: `rafiq:data-version`.
- Current local schema: **2**.
- Future changes to storage keys or data shapes MUST add a migration. Never silently rename/delete a user key.

## Automatic first-run protection
On the first R10 launch for a device with pre-R10 data:
1. Rafiq inventories registered local data.
2. It creates `rafiq:safety-snapshot:v1` before changing the schema version.
3. It runs versioned migrations in order. v0 -> v1 deliberately rewrites no legacy user records; it only registers the schema version.
4. R17 adds v1 -> v2 as an **additive compatibility migration** only: existing daily records remain valid, while new records may carry `goal`, `target`, `goalReview`; todo items may carry final task-review metadata. No old record is rewritten just to add empty fields.
5. It validates the resulting structures.
6. On failure, it restores the safety snapshot and leaves the old data version in place.

## Registered app data
Exact keys include settings/profile, Saved Later, todos, Qur'an position, dua/Riyad favorites, Heart tracking/journal/progress/personal paths, **Tazkiyah depth-study progress (`qalb-levels-v1`)**, Irtaqi state, Khabia and related state.

Dynamic prefixes:
- `day:*` — daily logs, including Qur'an pages, adhkar/prayer/review records, plus R17 daily goal/target and goal review.
- `tas:*` — full tasbih configuration/custom items/daily counts.
- `todo-items` remains the same registered exact key; R17 adds optional per-task final review fields (`review`, `reviewedAt`) without renaming the key or existing item IDs.

Raw local preference:
- `qFont`.

Chrome-extension-only portable backup also includes:
- `rafiqNotebook`
- `rafiqChromePrefs`
- `rafiqPrayerConfig`
- `rafiqLastPrayerNotification`

## User-facing backup
Settings -> `بياناتي والحماية` provides:
- `تنزيل نسخة كاملة`
- `استعادة نسخة`
- import mode: full restore or safe merge
- `فحص البيانات`
- local data-version/status summary

New backup format:
- `format: rafiq-backup`
- `backupVersion: 1`
- `dataVersion`
- all registered Rafiq records
- relevant raw/local extension state when available
- SHA-256 integrity checksum when Web Crypto is available

Old `muhasabah-backup` JSON files remain importable. Because the old exporter did not include every Rafiq feature, legacy imports are forced into non-destructive merge mode so they cannot erase newer data that was never present in the old file.

## Restore safety
Before every import, Rafiq creates an automatic safety snapshot. If validation/migration after import fails, app-local data is rolled back. Chrome-extension state is also snapshotted for import rollback when the Chrome storage API is available.

## Important limitations
- This is local resilience, not cloud backup.
- Clearing site/app/extension data or losing the device can still remove local data if the user has not downloaded a backup.
- No Firebase/Supabase/backend/analytics was added in R10.
- A cloud account/sync system remains a separate future privacy/product decision.

## Rules for future releases
1. Treat existing user data as immutable-by-default.
2. Any changed storage key/data shape requires a migration from every supported previous data version.
3. Create/verify a safety snapshot before destructive migration steps.
4. Never reuse a content ID for a different item. Prefer stable semantic IDs.
5. If an ID must change, add an explicit old -> new mapping migration.
6. Add new persistent keys to the Rafiq data registry in `app/data-safety.js`.
7. Run `node qa/test_data_safety.js` from the package root plus `node --check` before packaging.

## R13 note — static Hisn cache is not user data
R13 may cache the public Hisn al-Muslim digital dataset in localStorage under `hisn-static-cache-v1-20260819` after the user opens the full book. This is replaceable static reference content, not a user record, so it is intentionally excluded from portable backups, safety snapshots and migrations. If a future release adds user-specific Hisn progress, bookmarks outside the existing `saved-later-v1`, notes, or reading state, that new persistent user key MUST be registered and migrated under the normal Data Safety rules.


## R24 note — Tazkiyah depth-study progress is protected user data
R23 introduced `qalb-levels-v1` for Tazkiyah study-level state. R24 keeps the same key and expands its additive shape to support `done`, `open`, `completedAt`, `lastAt`, and `reviews`. This state is educational progress only; it is **not** a spiritual score or faith rank.

R24 also fixes an R23 omission: `qalb-levels-v1` is now explicitly registered in `app/data-safety.js` and validated as an object, so portable backups/safety snapshots/replace restores include it. Local schema remains **2** because this is registration of an already-existing additive key, not a destructive key rename or incompatible record rewrite. Existing R23 values such as `{done:[...], open:n}` remain valid; missing R24 fields are read with safe defaults.

## R26 — موضع قارئ المختصر
أضيف المفتاح المحلي `tafsir-pos-v1` ويحفظ فقط موضع القراءة المتتابعة في المختصر (`sura`, `aya`, `updatedAt`). لا يحفظ نص كتاب المختصر أو نسخة منه. المفتاح مسجل في Data Safety backup/restore كبنية `object`. Data schema يبقى 2 لأن الإضافة توافقية وغير هادمة.


## R32 additive local data
Registered in the Data Safety exact-key registry without changing schema version 2:
- `mujahada-weight-v1` — user's optional self-rating of the impact/frequency of each Mujahada obstacle; object, local only. It is not a spiritual score or medical diagnosis.
- `fiqh-busola-progress-v1` — completed/open learning stages in Fiqh al-Busola; object, local only.
- `benefit-choice-v1` — optional selected service/benefit route; object, local only.

`profile-v1` also accepts optional `married`, `hasKids`, `timeBand`, `moneyBand`, and `skills[]`. These are used only for on-device recommendations. No exact income or exact free-time hours are collected.

**Play-policy note:** R32 adds smoking/nicotine education and a self-organization cessation path. Re-check the Google Play Health apps declaration before shipping this feature publicly; do not conceal the feature to preserve a prior declaration.

## R33 — 2026-08-21: Tazkiyah 4→5 stage compatibility

R33 adds a fifth study stage to the existing Works / Heart Diseases / Obstacles curriculum. This is **not** a new user-data schema and introduces no new persistent key.

- Existing progress remains in `qalb-levels-v1`.
- Existing completed level numbers are preserved exactly; R33 never deletes/reset `done` entries.
- If a legacy topic had levels 1–4 completed and the newly added level 5 is not complete, the app moves only the stored `open`/resume pointer to level 5 so the user discovers the new material. Earlier stages remain reviewable afterward.
- `rafiq:data-version` remains `2`.
- Backup metadata app version is `24.33.0`.

## R36 — trusted Tafsir Muyassar + typography (2026-08-21)

R36 introduces **no persistent user-data key, no schema migration, and no stored-shape change**. `rafiq:data-version` remains **2** and existing keys including `quran-pos` and `tafsir-pos-v1` are unchanged.

- The new Tafsir Muyassar full-book view is a user-initiated external iframe from `qurancomplex.gov.sa`; it does not create a local reading-position key.
- Exact-ayah Tafsir Muyassar links may open `quran.com`; Tadaruq sends only the ayah/surah encoded in the requested URL, not profile/day/location/worship data.
- The existing Al-Mukhtasar `tafsir-pos-v1` behavior and proxy-secret boundary are preserved.
- The typography pass changes CSS only and has no data effect.
- Backup metadata app version is `24.36.0`; backup schema remains unchanged.

## R37 — 2026-08-21

No persistent storage key was added, renamed, deleted, or incompatibly reshaped.

- `rafiq:data-version` remains **2**.
- Home redesign reads existing state only and reuses existing navigation/planning systems.
- New Knowledge JSON files are static public educational content and are not included as personal data in backup/snapshot registries.
- Al-Mukhtasar UI/runtime was removed at the owner's request. **`tafsir-pos-v1` remains in the exact-key/type registry as legacy data** so upgrades do not silently delete or orphan an existing user's backup/restore record. R37 has no active code that advances this key.
- Tafseer Muyassar is accessed by user action through official/public web content; no profile, daily record, worship log, journal, personal path, or exact coordinates are sent by Tadaruq as payload fields.
- Backup metadata app version: **24.37.0**.

## R38 — 2026-08-21

R38 changes navigation/UI and static educational content only. It introduces **no new persistent user-data key and no migration**.

- `rafiq:data-version` remains **2**.
- Existing `qalb` route/storage identifiers remain unchanged; Tazkiyah still uses the established `qalb-*` keys including `qalb-levels-v1`.
- The new Zikr and Tazkiyah landing maps route into existing screens and reuse existing storage; they do not create a parallel progress/navigation database.
- `usul-tafsir.json` keeps the same nine item IDs, so Saved Later/content references are not invalidated by ID churn.
- Source-display deduplication is presentation-only. Source arrays remain in static content files and no user record is modified.
- Backup metadata app version: **24.38.0**.
