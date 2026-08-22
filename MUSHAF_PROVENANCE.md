# Rafiq Mushaf provenance — v24 R14

## Product requirement
The primary Quran reading view must preserve the printed Madinah Mushaf composition. A browser must not reflow Quranic words between lines. The start/end of each printed line and the start/end of each of the 604 pages are fixed.

## Canonical Mushaf authority
- Mushaf: Mushaf al-Madinah al-Nabawiyyah, Hafs 'an 'Asim.
- Publisher/authority: King Fahd Glorious Qur'an Printing Complex.
- Official digital vector resource: https://dm.qurancomplex.gov.sa/
- The Complex is the religious/typographic authority referenced by Rafiq. A technical mirror is not presented as an independent Quran source.

## Interactive technical page layer
Rafiq currently loads fixed SVG pages from:
- Project: https://github.com/quranpedia/quran-svg
- Folder: `mushafs/hafs/kfqc/svg/`
- Pinned revision: `0198423eb867ba26051aba6ac902cd5d10aadd1b`
- Page files: `001.svg` ... `604.svg`

The repository provides the KFQC page vector geometry plus transparent `.ayahPolygon` hit regions. Rafiq uses those polygons only to identify the selected surah/ayah for bookmarking the reading position and opening tafsir. The Quran glyph paths are not edited or recomposed.

## Runtime safety
- SVG is parsed and sanitized before DOM insertion.
- `script`, `foreignObject`, `iframe`, `object`, and `embed` are removed.
- Inline `on*` event attributes and unsafe script/data-HTML links are removed.
- Browser zoom scales the complete page. It must never rewrap or justify Quran text.
- If both read-only asset origins fail, Rafiq may display the existing textual Quran as a fallback, but must clearly warn that this fallback is not the page-accurate printed Mushaf view.

## Paging direction
Owner's explicit RTL reading rule:
- finger swipe **left -> right** (`dx > 0`) = **NEXT** page
- finger swipe **right -> left** = **PREVIOUS** page

This supersedes older R12 documentation that described the opposite gesture.

## User data
R14 changes no user-data key or shape. `quran-pos` remains the reading-position key and Data Safety schema stays v1.

## R15 reader UX note
R15 changes only the reading shell around the same pinned fixed KFQC pages: immersive fullscreen, optional control hiding, session cache, and a short page-entry transition. It does **not** reflow, rewrite, crop, or reconstruct Quran text. The complete page SVG remains the indivisible visual unit, so printed line and page boundaries remain fixed.

## R43 reader-shell robustness update — 2026-08-21
R43 keeps the same canonical Mushaf identity, the same pinned Quranpedia revision `0198423eb867ba26051aba6ac902cd5d10aadd1b`, the same 604 KFQC Hafs SVG pages, and the same `.ayahPolygon` interaction geometry. It changes the **reader shell**, not Qur'anic page content.

### R43 state separation
R42 used one `qSelectedAyah` state for several responsibilities and `openPage()` auto-selected either the saved ayah or the first ayah on every page. That made a yellow ayah highlight appear even when the reader had made no selection.

R43 separates concerns:
- `quran-pos` remains the persistent reading-position object and its key/shape is compatible;
- page opening never creates a visual ayah selection;
- the toolbar Tafsir action uses the first ayah on the page as a logical default only;
- an ayah is highlighted only while the explicit ayah action sheet is open;
- closing the action sheet clears the highlight;
- Tafsir does not mutate `quran-pos`; only the explicit `حفظ الموضع هنا` action writes the chosen surah/ayah.

### Original SVG geometry is authoritative
R43 disables the historical runtime `viewBox` fitting/cropping calculation. The pinned page SVG's original `viewBox` is preserved exactly. Browser responsiveness is handled through CSS scaling/contain behavior only. This intentionally trades a small amount of possible unused whitespace for stronger protection against accidental clipping or geometry drift.

### Offline/full-Mushaf availability
R43 introduces an **optional full 604-page offline download** using CacheStorage cache `tadaruq-mushaf-kfqc-r43-v1`.
- It does not add 604 pages to the mandatory PWA install/precache payload.
- Every successfully read page is cached automatically.
- The Quran tools page can download all missing pages with three bounded workers and can resume later.
- A complete state means exactly 604 cached page numbers.
- The user can stop and resume, or delete the local public-content copy without affecting `quran-pos` or any personal backup data.
- Tadaruq requests persistent browser storage when the user starts the full download, but the browser ultimately controls quota/eviction policy.

The same remote pinned SVG source/fallback remains the source of the page bytes. R43 does not alter, recreate, OCR, or re-typeset any Qur'anic glyph path.

### R43 stale runtime bug removed
The Quran-tools route still contained a call to the already-removed `renderTafsirResume()` function. This could throw when returning from the Mushaf to its index/tools surface. R43 removes that dead call.


## R44 focused-reader/navigation update — 2026-08-21
R44 does not change Qur'anic text, the pinned KFQC revision, page count, ayah polygons, swipe rule, or `quran-pos`. It changes the reader shell and application navigation around the R43 renderer.

### Reader surface
- entering the Mushaf `read` view hides the app-wide primary navigation and header;
- the reader owns its own top bar and five-action bottom toolbar (previous, search, tafsir, index/tools, next);
- controls auto-hide after reading begins and return on an explicit page tap;
- fullscreen uses the same reader control state and preserves original SVG geometry;
- landscape containment is verified against the deterministic SVG fixture at 844×390 without document overflow or page clipping.

### Renderer boundary
R44 introduces `MUSHAF_RENDERER_ID='kfqc-svg'` and `MUSHAF_RENDERERS` as an explicit adapter seam. The active renderer remains the R43 pinned KFQC SVG renderer. This does **not** authorize switching to QCF or any other renderer without a separately verified source, geometry, interaction mapping, and real-device test.

### QCF research boundary
During R44 research, Quran Foundation documentation was reviewed. Its QCF/code_v2 delivery is API/credential based and its documentation warns consumers not to persist/cache font assets as a permanent local copy because corrected font assets may be updated. Tadaruq therefore does not ship a guessed/local QCF engine or expose API credentials in public JavaScript. Future QCF work requires an official supported delivery architecture and a measured migration plan.

## R45 interaction / Tafsir / fixed-viewport update — 2026-08-21
R45 changes reader-shell interaction only. It does **not** change the Qur'anic text, pinned KFQC source revision, 604-page count, `.ayahPolygon` coordinates, page `viewBox`, or the owner-defined swipe direction.

### Natural Back behavior
Entering focused `read` mode from another app destination adds a temporary browser-history reader state. Browser/system Back now exits the reader to the destination from which it was entered. If selected-ayah Tafsir is open, the first Back closes that overlay and the next Back leaves the reader. The visible reader Back button calls the same leave/history path rather than implementing a separate navigation rule.

### Fixed printed page
The focused printed Mushaf uses a fixed `100dvh` viewport. Body/wrapper/read-view overflow is suppressed and the printed page surface uses `touch-action:none`; this prevents the page/document from being dragged vertically for no reading purpose. Tadaruq's explicit horizontal swipe detector remains active and preserves the established rule: finger left-to-right = NEXT page. Text fallback remains internally scrollable because its content can reflow and is not the authoritative fixed-page renderer.

### Selected-ayah Tafsir Muyassar
R45 displays the complete Tafsir Muyassar response for the explicitly selected ayah inside a sheet. Canonical religious/content authority is the King Fahd Complex digital Tafseer Muyassar dataset. Technical per-ayah transport uses AlQuran.cloud edition `ar.muyassar`; responses are validated and failures show no synthesized tafsir. Public responses may be cached in `tadaruq-tafsir-muyassar-r45-v1`.

This Tafsir layer is separate from Quran page geometry: no tafsir text is inserted into, overlaid upon, or used to reconstruct the fixed SVG page.

## R49 presentation fit — 2026-08-22
Owner supplied Tadaruq and Ayah-app screenshots to compare apparent page size/readability. Both screenshots were 589 CSS/image pixels wide; rough visible text extents were already comparable horizontally. The more successful Ayah presentation mainly occupied more vertical reading space with less top/bottom dead area.

R49 therefore replaces the old blind R47 110% portrait rule with a conservative presentation-only strategy:
- the pinned KFQC SVG viewBox remains authoritative and is never rewritten;
- portrait reader top-aligns the page;
- `applyMushafAyahLikeFit()` measures non-hit-region SVG content bounds and may enlarge the WHOLE SVG only when there is measured blank horizontal room;
- final scale is clamped to 1.000–1.035;
- glyph paths and `.ayahPolygon` hit regions share the exact same CSS transform;
- landscape/short-height remain conservatively contained;
- R46 dark-mode white-pre-filter-canvas rule remains intact.

No new Quran content source, page mapping, polygon source, glyph data, or page count is introduced. Real-device visual QA on representative live pages remains required.
