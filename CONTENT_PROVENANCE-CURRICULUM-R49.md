# CONTENT PROVENANCE — Curriculum R49

Date: 2026-08-22
Release: TADARUQ v24 R49

## Scope
R49 reorganizes `العلم` into a source-first curriculum rather than a flat library. It adds structured educational maps for العقيدة، فقه الحياة، التجويد، علوم الحديث، الأخلاق، الآداب، الحياة الرقمية، والقواعد الفقهية. The app does **not** present itself as a mufti and does not infer a personal ruling from a few answers.

## Source/display rule
1. The section-level source and method are displayed **before** the cards.
2. Religious claims must remain attributable to a visible primary/recognized source.
3. R49 educational text is original Tadaruq paraphrase/map text, not a transcription of the linked books or encyclopedias.
4. In fiqh, `قول الجمهور` is used only where a reliable comparative fiqh source expressly identifies a majority position. It is never inferred merely because Tadaruq prefers an answer.
5. `خلاف معتبر` is shown where the user should know that recognized juristic disagreement exists.
6. `يحتاج فتوى خاصة` is used for cases whose ruling depends materially on personal facts, wording, contracts, rights, divorce, inheritance, or contemporary complexities.
7. Tadaruq does not search for the strictest or easiest opinion and does not bind the whole app to one madhhab.

## 1. العقيدة والإيمان
Dataset: `aqeedah.json` — 19 modules.

Primary backbone:
- **الموسوعة العقدية — مؤسسة الدرر السنية**
- https://dorar.net/aqeeda?l=1

The map covers introductions to aqeedah/iman/tawhid, belief in Allah, rububiyyah/uluhiyyah/names and attributes, worship, testimony and following the Messenger, angels, books, messengers, the Last Day, qadar, the nature of iman, major/minor shirk, riya, magic/divination/astrology/superstition, amulets/attachments, companions/Ahl al-Bayt/scholars, and restraint in takfir.

Safety boundary: the section teaches doctrines; it is not a tool for declaring a named individual or group outside Islam.

## 2. الفقه الميسر + فقه حياتي
Datasets: existing `knowledge.json` + new `fiqh-life.json` — 145 practical navigation topics.

Basic/public starting point:
- **الفقه الميسر في ضوء الكتاب والسنة** — مجموعة من المؤلفين.
- The IslamHouse bibliographic page identifies King Fahd Complex as the source and describes the work as fiqh rulings with their scriptural evidences in an accessible concise presentation.
- https://islamhouse.com/ar/books/203277

Comparative fiqh / agreement-majority-disagreement layer:
- **الموسوعة الفقهية — الدرر السنية**
- https://dorar.net/feqhia

Contemporary collective-jurisprudence layer:
- **مجمع الفقه الإسلامي الدولي** — decisions and recommendations.
- https://iifa-aifi.org/ar/القرارات
- Its published strategy explicitly encourages collective ijtihad, identifies acceptable choices among multiple opinions according to evidence and maqasid, and rejects madhhab fanaticism.

R49 keeps `الفقه الميسر` first for ordinary users. `فقه حياتي` is a fast situation-based map, not a competing book. Groups include prayer, purification, women, fasting/Ramadan, zakat, Hajj/Umrah, marriage/family, money/transactions, illness/travel, funerals, wills/inheritance, food/slaughter, and oaths/vows.

### Limited zakat arithmetic helper
R49 includes a clearly labelled non-fatwa calculator that computes only 2.5% of a cash amount the user has already determined is zakatable. It does not determine nisab/hawl and must not be used for crops, livestock, complex investments, or debt disputes.

## 3. التجويد
Dataset: `tajweed.json` — 14 modules.

Primary source:
- **التجويد الميسر — مجمع الملك فهد لطباعة المصحف الشريف**
- https://epub.qurancomplex.gov.sa/issues/books/TajweedMuyassar/
- Complex announcement: https://qurancomplex.gov.sa/en/أطلق-المجمع-نسخة-الإلكترونية-من-كتاب-ا/

The Complex states that the book was prepared by a specialist committee for Hafs from Asim via al-Shatibiyyah and intentionally uses brief, clear, accessible presentation. R49 therefore uses it as the introductory tajweed backbone.

Boundary: written cards do not replace oral recitation and mushafahah with a proficient teacher/reciter.

## 4. علوم الحديث
Dataset: `hadith-sciences.json` — 12 modules.

Primary operational reference:
- **الموسوعة الحديثية — الدرر السنية**
- https://dorar.net/hadith

Additional educational material index:
- https://islamhouse.com/ar/category/344948/books/fa/1

Tadaruq does not grade hadith independently. Any displayed grading must remain attributed to its hadith source.

## 5. الأخلاق والسلوك
Dataset: `akhlaq.json` — 141 current top-level moral-trait doors at review time.

Primary source:
- **موسوعة الأخلاق والسلوك — مؤسسة الدرر السنية**
- https://dorar.net/alakhlaq

Current R49 audit of the public index found:
- 71 `الأخلاق المحمودة`
- 70 `الأخلاق المذمومة`
- Total: 141 top-level trait doors.

R49 does not copy the encyclopedia body. The in-app card for every indexed trait is an original learning map pointing users back to the encyclopedia for definitions, evidence, distinctions, examples and detailed means of acquisition/avoidance.

## 6. الآداب الشرعية
Dataset: `adab.json` — 64 principal doors.

Primary source:
- **موسوعة الآداب الشرعية — مؤسسة الدرر السنية**
- https://dorar.net/aadab

The public encyclopedia is organized around four major books reflected by R49:
1. الأدب مع الله ورسوله ومع الآخرين
2. آداب العبادات
3. آداب التعامل
4. الآداب الشخصية

R49 records 64 principal doors under those four groups at review time. It distinguishes adab from khuluq, and redirects actual juristic rulings to the fiqh layer when needed.

## 7. الحياة الرقمية
Dataset: `digital-life.json` — 12 modules.

Backbone:
- Qur'anic principles explicitly linked at item level (including al-Hujurat 6, 11, 12; al-Isra 36, 53; al-Nur 27, 30–31).
- **موسوعة الآداب الشرعية** and **موسوعة الأخلاق والسلوك** for conduct and character principles.

This is an application of stable principles to digital conduct (verification, speech, privacy, gaze, attribution, AI academic honesty, online commerce ethics, time and harassment), not a platform-specific fatwa engine.

## 8. القواعد الفقهية
Dataset: `qawaid-fiqh.json` — 10 modules.

Primary reference layer:
- **الموسوعة الفقهية — الدرر السنية**
- https://dorar.net/feqhia

The five major rules are introduced along with limits and application cautions. The section explicitly states that rules are learning tools, not automatic fatwa generators.

## Copyright / attribution boundary
R49 stores topic taxonomies, source identifiers and original Tadaruq educational summaries. It does not redistribute full Dorar encyclopedia body text or full third-party books as a substitute for their sites/publications. Users are given direct source links for expansion.
