# CONTENT PROVENANCE — Knowledge R37

## Scope
R37 reorganizes the top-level `العلم` experience and adds four structured educational datasets. The app text is concise educational paraphrase; it is not presented as verbatim quotation unless explicitly marked otherwise.

## 1) التفسير الميسر
- Canonical publisher/source: **مجمع الملك فهد لطباعة المصحف الشريف**.
- Official book page: https://qurancomplex.gov.sa/kfgqpc-books-tafseer-muyassar/
- Official developer platform states the Tafseer Muyassar dataset is trusted/approved by the Complex and is provided for developers/researchers/publishers to use in applications: https://qurancomplex.gov.sa/en/techquran/dev/
- Full standalone reader in Tadaruq uses the Complex's official embed service rather than scraping the text: https://qurancomplex.gov.sa/embed-isdarat/
- Exact-ayah convenience links may use Quran.com as a viewer; Quran.com is not labelled as the publisher of Tafseer Muyassar.

## 2) أصول التفسير
- Backbone: **أصول في التفسير — الشيخ محمد بن صالح العثيمين**.
- Official source: مؤسسة الشيخ محمد بن صالح العثيمين الخيرية.
- URL: https://foundation.binothaimeen.net/ar/books/show/94fb3673-5701-4ec7-af13-5cf188eb99da
- The Foundation describes the work as foundational notes on revelation, first revelation, kinds of revelation, writing/collection of the Qur'an, the meaning and reference of tafsir, and the Muslim's duty in interpretation.
- `usul-tafsir.json` is an educational map derived from those topics; it is not a transcription of the book.

## 3) أصول الفقه
- Backbone: **الأصول من علم الأصول — الشيخ محمد بن صالح العثيمين**.
- Official source: مؤسسة الشيخ محمد بن صالح العثيمين الخيرية.
- URL: https://foundation.binothaimeen.net/ar/books/show/b9e2147e-bb9c-45be-a716-fe9073cd4264
- The official page states the book introduces the beginner to rulings and their divisions, knowledge, speech, command/prohibition, general/specific, absolute/restricted, concise/clarified, and other usul topics.
- `usul-fiqh.json` is a non-verbatim educational map. It does not qualify the reader for issuing fatwa.

## 4) فقهاء عبر العصور
- Primary biographical backbone: **سير أعلام النبلاء — الإمام الذهبي**.
- Digital reading layer: Islamweb library edition of the work.
- The four madhhab imams use direct biography pages where verified in this release. Other cards link to the book entry and identify the requested translation by name.
- Cards intentionally state only basic/stable biographical facts and do not attempt to summarize each scholar's entire madhhab, rank, or contested positions.
- Any future special virtue, quote, miracle-like anecdote, or disputed claim requires item-level verification before publication.

## 5) مختصر التاريخ الإسلامي
- Backbone: **الموسوعة التاريخية — الدرر السنية**: https://dorar.net/history
- R37 uses direct event links where verified (e.g. Hijra, Badr, Fath Makkah, Bayt al-Maqdis, Hijri dating, Salah al-Din's recovery of Jerusalem); broad era cards point to the main historical encyclopedia rather than inventing a single event reference.
- The app explicitly frames this as a chronological educational map and does not infer modern legal/political rulings from a historical card.

## 6) مصاحف الروايات الأخرى
- Canonical authority: **مجمع الملك فهد لطباعة المصحف الشريف**.
- Official qira'at Mushafs page: https://qurancomplex.gov.sa/quran-qiraat/
- Official print/vector resources include Hafs and other narrations such as Warsh, Qalun, Shu'bah, and al-Duri: https://dm.qurancomplex.gov.sa/
- R37 does **not** swap the current in-app 604-page Hafs/KFQC reader. Alternate qira'a support would require its own verified fixed-page assets, ayah mapping/interaction metadata, and real-device QA. The current reader remains Hafs to avoid mixing geometry or verse-selection data.

## 7) Al-Mukhtasar removal
At the owner's explicit R37 request, Al-Mukhtasar is removed from the active/public UI and runtime integration. The historical `tafsir-pos-v1` local key remains registered in Data Safety so an upgrade does not silently delete an existing user's prior local record. Historical handoff/provenance entries are preserved as history and marked superseded by R37.
