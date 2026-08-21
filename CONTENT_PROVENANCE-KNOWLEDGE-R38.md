# CONTENT PROVENANCE — Knowledge R38

## Scope
R38 keeps the R37 Knowledge architecture and source hierarchy, expands the existing `usul-tafsir.json` educational text, and changes only how repeated section-level sources are displayed. The educational text remains paraphrase, not a verbatim quotation unless explicitly marked otherwise.

## 1) أصول التفسير — R38 expansion
- Primary backbone: **أصول في التفسير — الشيخ محمد بن صالح العثيمين**.
- Canonical/official source shown at the top of the section: مؤسسة الشيخ محمد بن صالح العثيمين الخيرية.
- Official URL: https://foundation.binothaimeen.net/ar/books/show/94fb3673-5701-4ec7-af13-5cf188eb99da
- The Foundation describes the work as covering the Qur'an's revelation and first revelation, types of revelation, writing/collection, the meaning/reference of tafsir, and the Muslim's duty in interpretation.
- The published book index/text view was also checked for the existing R37 topics used by Tadaruq, including causes of revelation and general wording/specific cause, Makki/Madani, writing/collection, اختلاف التفسير المأثور, famous Companions/Tabi'in in tafsir, and Isra'iliyyat.
- R38 **preserves the same nine module IDs** and expands each module from a very short introduction into a longer educational lead plus several study points.
- The wording is deliberately explanatory and non-verbatim. It does not claim to replace reading the book or consulting qualified scholars in difficult matters.

Additional verification references used during R38 review:
- https://waqfeya.net/books/%D8%A3%D8%B5%D9%88%D9%84-%D9%81%D9%8A-%D8%A7%D9%84%D8%AA%D9%81%D8%B3%D9%8A%D8%B1/954f88a731ee4ff5ac8bc5895549ce88
- https://quranpedia.net/book/1451/1/27
- https://usul.ai/ar/t/introduction-to-tafsir-principles/51

## 2) Repeated-source display rule
R38 keeps source data in the JSON/content files for provenance and Saved Later metadata, but the UI no longer repeats the **same URL as the section-level primary reference** below every simple Knowledge card.

Display behavior:
- the primary source appears once in the section intro;
- an item source whose normalized URL is identical to that primary source is not repeated visually;
- a genuinely different/additional item source remains visible directly on that card and is labelled as an additional reference;
- source arrays are not deleted from the data files.

This display rule applies to the simple structured Knowledge datasets rendered through `sourceModules()` (`usul-tafsir.json`, `usul-fiqh.json`, `fuqaha.json`, `islamic-history.json`). It does not remove distinct per-item evidence from other high-detail religious sections such as Tazkiyah, where immediate sources may differ from item to item.

## 3) Other R37 Knowledge sources remain unchanged
The R37 provenance remains authoritative for Tafseer Muyassar, Usul al-Fiqh, jurist biographies, Islamic history, qira'at resources, and the Al-Mukhtasar retirement decision. See `CONTENT_PROVENANCE-KNOWLEDGE-R37.md` for those unchanged source details.
