# Rafiq — Local Data Safety Layer (v24 R10)

## Why this exists
Rafiq now has real users. Their local data must be treated as legacy user data that survives ordinary UI/content releases. R10 adds a guard layer without adding a cloud backend or central database.

## Data version
- Public app/extension version remains `24.0.0`.
- Local schema version is separate: `rafiq:data-version`.
- Current local schema: **1**.
- Future changes to storage keys or data shapes MUST add a migration. Never silently rename/delete a user key.

## Automatic first-run protection
On the first R10 launch for a device with pre-R10 data:
1. Rafiq inventories registered local data.
2. It creates `rafiq:safety-snapshot:v1` before changing the schema version.
3. It runs the v0 -> v1 migration. This first migration deliberately rewrites no legacy user records; it only registers the schema version.
4. It validates the resulting structures.
5. On failure, it restores the safety snapshot and leaves the old data version in place.

## Registered app data
Exact keys include settings/profile, Saved Later, todos, Qur'an position, dua/Riyad favorites, Heart tracking/journal/progress/personal paths, Irtaqi state, Khabia and related state.

Dynamic prefixes:
- `day:*` — daily logs, including Qur'an pages and adhkar/prayer/review records.
- `tas:*` — full tasbih configuration/custom items/daily counts.

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
