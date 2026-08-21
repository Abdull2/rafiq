# CONTENT PROVENANCE — Knowledge R39

## Scope
R39 is a delivery/reliability correction for the **full Tafseer Muyassar reader**. It does not change Tafseer Muyassar text, attribution, or the R38 Usul al-Tafsir educational content.

## Correction to the R36/R37 embed assumption
The earlier implementation placed the Complex publications reader URL inside a cross-origin iframe. A 2026-08-21 verification found that the public Tafseer Muyassar book page still resolves to the Complex publications reader, while the previously documented content-embedding route is no longer a dependable endpoint. R39 therefore stops presenting the remote publications page inside an iframe.

Official full-reader/page links retained by R39:
- https://qurancomplex.gov.sa/isdarat-books/#flipbook-df_11362/1/
- https://qurancomplex.gov.sa/kfgqpc-books-tafseer-muyassar/

## Canonical data source remains the King Fahd Complex
The King Fahd Complex developer platform describes its Tafseer Muyassar dataset as trusted/approved content supplied for developers, researchers and publishers. The dataset includes Qur'an/ayah metadata and an `aya_tafseer` field for the Tafseer text corresponding to each ayah.

Official developer source:
- https://qurancomplex.gov.sa/en/techquran/dev/

Published integrity values shown by the Complex for that package at verification time:
- MD5: `5601682965e32f4dd6992c7600fdccc3`
- SHA-1: `5f533113c2f54f32eded734bb49e6a5837965722`

R39 does **not** import or repackage that dataset yet. It simply fixes the broken full-reader path by using direct official-site links. If a future release builds a native Tadaruq full Tafseer reader, the developer dataset is the preferred source path rather than scraping or iframe embedding.

## Exact-ayah viewer
The existing exact-ayah convenience link may continue to use Quran.com as a viewer. Quran.com is not relabelled as the publisher of Tafseer Muyassar; the canonical publisher/source remains the King Fahd Complex.
