# CONTENT PROVENANCE — Tafsir Muyassar selected-ayah reader R45

Date: 2026-08-21

## Canonical religious/content authority
- Work: **التفسير الميسر للقرآن الكريم**.
- Publisher/authority: **مجمع الملك فهد لطباعة المصحف الشريف**.
- Official developer platform: https://qurancomplex.gov.sa/en/techquran/dev/
- Official book page: https://qurancomplex.gov.sa/kfgqpc-books-tafseer-muyassar/
- Official Complex developer documentation states that Tafseer Muyassar digital content is supplied for developers/researchers/publishers, is trusted/approved by the Complex, and includes an `aya_tafseer` field corresponding to each ayah.
- Official package metadata shown by the Complex: 7.51 MB, MD5 `5601682965e32f4dd6992c7600fdccc3`, SHA-1 `5f533113c2f54f32eded734bb49e6a5837965722`, last modified 2023-08-01.

## R45 transport layer
R45 does **not** scrape or generate tafsir. For the selected ayah it requests the `ar.muyassar` text edition through AlQuran.cloud's public ayah endpoint:

`https://api.alquran.cloud/v1/ayah/{surah}:{ayah}/ar.muyassar`

AlQuran.cloud API documentation defines `GET /v1/ayah/{reference}/{edition}` and permits a `surah:ayah` reference. The edition `ar.muyassar` is independently catalogued as Tafsir Al-Muyassar / King Fahd Quran Complex. AlQuran.cloud is treated as a **technical transport mirror**, not the author/publisher or canonical scholarly source.

## Runtime safeguards
- The response must be HTTP-successful.
- JSON payload must report code 200 and non-empty text.
- If response metadata exposes an edition identifier, it must equal `ar.muyassar`.
- HTML markup is converted to plain text before display; R45 does not rewrite or summarize the tafsir.
- Any invalid/empty/failed response fails closed: Tadaruq does not synthesize or substitute an AI explanation.
- Successfully loaded selected-ayah responses may be cached in public CacheStorage `tadaruq-tafsir-muyassar-r45-v1` for later reuse. This cache is public reference content, not personal user data.

## Verification boundary
The browser/runtime integration was executed against deterministic `ar.muyassar` response fixtures in Chromium. The execution environment could not reliably perform the real external selected-ayah request, so **real network delivery remains REQUIRES REAL-NETWORK TEST** after deployment. The canonical Complex source and the AlQuran.cloud API contract/edition attribution were web-verified separately.
