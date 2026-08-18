# Rafiq — Data Architecture (v24 R5)

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
