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
