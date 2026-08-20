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
