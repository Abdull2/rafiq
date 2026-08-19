# NEXT AI — READ THIS FIRST

**Project:** رفيق يومك (Rafiq Yomak)  
**State ID:** `RAFIQ-HANDOFF-v24-2026-08-18`  
**Current artifact type:** Chrome Manifest V3 side-panel extension  
**Current release:** `v24` (Chrome manifest version `24.0.0`)

> This file is the continuity record for future AI sessions. Before changing code or content, inspect this file, `manifest.json`, `app/app.js`, `app/index.html`, and the relevant JSON data. Do not ask the owner to repeat decisions already documented here unless a conflict genuinely requires a decision.

## 1) Product vision

رفيق is meant to be a **daily Muslim companion while browsing**, not merely a collection of Islamic pages. The fixed foundation is Qur'an, adhkar, du'a, beneficial knowledge and worship. The variable layer is the user's real situation: family, relationships, study, work, anxiety/worry, digital temptations, spiritual setbacks, questions, etc.

The product should connect ordinary worldly problems to Islam **without pretending every life problem is a fatwa** and without replacing professional medical care.

Core product principle:

> **الدين ثابت، والمشكلة تختلف من شخص لآخر. رفيق يساعد المستخدم أن يصل إلى الباب المناسب بسرعة، بمصدر ظاهر، وخطوة عملية معقولة.**

## 2) Non-negotiable owner decisions

1. **Religious sourcing is mandatory.** Every religious claim, advice item, verse, hadith, dhikr, du'a, heart-work item, obstacle answer/step, and religious learning card must show its source under the content. If a religious claim has no reliable source, remove it or rewrite it into a transparent non-religious/product statement.
2. Prefer source hierarchy: Qur'an reference → authentic/graded hadith with a verifiable reference (Dorar is commonly used) → official/recognized scholarly work → clearly-labelled educational synthesis.
3. Do not imply that an educational paraphrase is a verbatim quote from a scholar. For Fiqh al-Nafs, label content as **صياغة تعليمية مستفادة من المنهج** unless a specific quotation/source has been verified.
4. **Bedtime daily review must stay lightweight.** Current design uses 5 essential questions, 3 quick rating choices, optional mood, and one optional line for tomorrow. Do not restore a long nightly questionnaire.
5. The home page should be a **gateway/teaser to the app**, using prompts such as “هل قرأت وردك اليوم؟” that jump directly to the relevant section.
6. User can save useful content for later using a **＋ / محفوظاتي** model similar to a shopping cart/read-later list.
7. Personalization asks **age + ذكر/أنثى**, stored locally. Use them only when meaningful: pronouns, age gates, women/men-specific topics, and life-stage relevance. Avoid stereotyping or changing universal religious rulings merely due to demographics.
8. App UI language: clean Arabic; direct address should use masculine/feminine forms where relevant (`أنت/أنتِ`, `فعلته/فعلتِه`). Neutral wording is preferred where it avoids awkward duplication.
9. Remove/avoid guilt-heavy or pseudo-spiritual metrics. Tracking is a tool, not a judgement on faith or a declaration of spiritual rank.
10. No invented sacred counts, durations, or promises. If a number is presented as religiously special, it must have direct evidence. User-selected counters/goals must be explicitly presented as organizational only.
11. A previously rejected home-page tagline about avoiding long lists/pressure must not return; keep the current calmer copy instead.
12. Do not reintroduce a “40-day spiritual program” as if 40 has a special virtue unless a specific valid basis is provided and correctly framed.

## 3) Current information architecture

Bottom navigation (6 tabs):
- **يومي** — home/gateway + prayer card + lightweight evening summary
- **المصحف** — Qur'an
- **العلم** — Riyad al-Salihin + ما لا يسع المسلم جهله + الفقه الميسر
- **الذكر** — adhkar + du'a + السبحة + أسماء الله الحسنى
- **القلب** — **مساري** + أمراض القلوب + أعمال القلوب + العقبات + بنك الأعمال + فقه النفس + **إشكاليات (مسار متقدم اختياري)**
- **ارتقِ** — practical improvement journey

Header includes **محفوظاتي** bookmark icon.

For crowded multi-section areas, prefer horizontally scrollable segmented chips + search + category chips instead of dense button grids.

## 4) Current release history / decisions

### v1.3
- Simplified end-of-day review to 5 essentials.
- 3 rating choices instead of 4.
- Optional mood and one optional tomorrow note.
- Added concise first-use onboarding.

### v1.4
- Rebuilt home as a gateway with questions that deep-link into Qur'an, adhkar, knowledge, fiqh, heart, etc.
- Added learning sections: `ما لا يسع المسلم جهله` + `الفقه الميسر`.
- Renamed “المسبحة والورد” to **السبحة**.
- Completed requested sleep dhikr and last two verses of al-Baqarah in ruqyah.
- Added audio via browser/system speech synthesis (not licensed human recitations yet).
- Expanded onboarding.

### v1.5
- Strict Sharia source audit, especially heart content.
- Every displayed religious item should expose a source.
- Removed unsourced/weakly framed sections temporarily.
- Removed dubious sacred counts and clarified organizational counters.

### v1.6
- Restored and rebuilt **العقبات، فقه النفس، بنك الأعمال** with visible sources.
- `فقه النفس` is explicitly based at a methodological level on **فقه النفس | مكاني**, supervised by Dr. عبد الرحمن ذاكر الهاشمي, while religious claims retain independent religious evidence.
- Added medical boundary: the app does not diagnose depression/anxiety/etc.; persistent or function-impairing symptoms require qualified professional assessment; self-harm risk is urgent.
- Added age + sex personalization onboarding/settings (`profile-v1`, local only).
- Added audience/minAge/maxAge filters to relevant content and some sex-specific wording/content. Female prayer tracking no longer presents mosque/congregation as the first/default state; direct welcome/evening wording adapts where appropriate.
- Added clearer bottom-tab icons.
- Improved knowledge/heart UX with horizontal segmented navigation, search and grouped filters.
- Added read-later **＋** across major content types and a `محفوظاتي` panel (`saved-later-v1`, local only).
- Re-audited the compact in-app tasbih: fixed religious counts are shown only where sourced; other counters are explicitly organizational, and the source is visible under the dhikr.
- Added the explicit official source for **ما لا يسع المسلم جهله**.
- Updated privacy policy to disclose age/sex personalization and saved-local content.

### v1.7 (previous internal build)
- Added **إشكاليات — مسار متقدم** inside `القلب`, based on the 13 Dr. Ahmed Abdelmonem lecture links supplied by the owner.
- The supplied Markdown was a Gemini-generated summary, **not a verified verbatim transcript**. Therefore all app wording is explicitly educational paraphrase, and every idea links to the original YouTube video + timestamp. See `CONTENT_PROVENANCE-ISHKALIAT.md` and `references/raw-user-ishkaliat-notes.md`.
- Advanced content is opt-in via `profile-v1.advancedIssues`; do not ask users to label themselves “religious/devout” and do not score religiosity. UX label: **إظهار «إشكاليات» — المسار المتقدم**.
- Added 13 lecture cards / 65 sourced ideas with search, thematic chips, save-later support, full-video links, and point-level timestamp links.
- Added all 13 lecture links to `app/sources.html`.
- Updated privacy copy for the local advanced-track preference and user-clicked external source links.
- Backup export/import now includes profile personalization and saved-later items.

### v24 (CURRENT — owner canonical version)
- Owner reset the canonical release number to **v24**; `manifest.json` uses Chrome-compatible `24.0.0`. Future releases must continue from the owner’s canonical numbering, not the earlier internal 1.x sequence.
- **Source UI cleanup:** religious/reference links now use calm source cards instead of default blue underlined links. This especially fixes the compact tasbih source presentation.
- **Back navigation cleanup:** shared `.back` buttons are now intentional RTL pills with a right-pointing return arrow; the Qur'an reader back control was aligned to RTL as well.
- **Fiqh al-Nafs UX rebuilt:** search/category filters remain, but results are now clean topic cards; each topic opens a dedicated detail view with separate psychological explanation, iman compass, reflection questions, practical steps, medical boundary, visible sources, save-later and personal-path CTA.
- Added **`مساري`** inside `القلب`. A user can choose one or multiple real problems from `العقبات`, a heart disease from `أمراض القلوب`, or a Fiqh al-Nafs topic and start a local personal follow-up path. Storage key: `qalb-paths-v1`.
- Personal paths do **not** diagnose or invent religious treatment. They reuse the already sourced content/steps from `qalb.json`, present them as progress stations, and add only product-level tracking/review (`أخف / كما هي / أشد`). Mental-health paths repeat the professional-care boundary.
- Backup/export now includes `qalbPaths` and import restores them. Privacy policy explicitly discloses the locally stored selected problem paths and review state.
- **ارتقِ source placement fixed:** axis references were removed from between assessment questions. **مراجع «ارتقِ»** now appear only after the assessment, in a dedicated collapsible references section and inside the resulting plan where relevant. Female wording for the two mosque-specific prayer questions is also adapted during the assessment.
- Every future code/content change must append a dated entry to this handoff (or the current release section) and update `AI_HANDOFF.json`, `PROMPT_FOR_NEXT_AI.txt`, release notes and manifest version.

## 5) Source policy and currently important references

### ما لا يسع المسلم جهله
General official reference:
- **كتاب “ما لا يسع المسلم جهله”**
- Authoring body: **اللجنة العلمية برئاسة الشؤون الدينية بالمسجد الحرام والمسجد النبوي**
- Official page: `https://risala.prh.gov.sa/ar/contents/251`
- The app section is a concise educational map, not a verbatim copy. Individual cards should also expose their own evidence.

### الفقه الميسر
General reference:
- **الفقه الميسر في ضوء الكتاب والسنة**
- إعداد مجموعة من العلماء، وزارة الشؤون الإسلامية والدعوة والإرشاد، طبع مجمع الملك فهد.
- Current stored reference link is in `app/knowledge.json`.
- Summaries are non-verbatim educational summaries; specific disputed/personal cases should point to qualified scholars.

### فقه النفس
Methodological reference:
- Official Makany: `https://makany.co/`
- Site states the method uses العقل والوحي والنظر with revelation as the reference and is supervised by **د. عبد الرحمن ذاكر الهاشمي**, physician and educational/psychological treatment consultant.
- App content must say “مستفاد من المنهج / صياغة تعليمية” unless a specific talk/text is directly verified.

### إشكاليات — د. أحمد عبد المنعم
Source/provenance rule:
- User supplied 13 YouTube links plus AI-generated summaries/timestamps.
- Treat those summaries as **secondary notes**, not authoritative transcripts.
- App copy must say it is a non-verbatim educational summary.
- Every displayed idea needs the original video + timestamp immediately underneath.
- Do not turn lecture commentary into a fatwa. When Rafiq states a religious ruling or primary-text claim itself, retain/attach primary Qur'an/hadith/scholarly evidence as appropriate.
- Full implementation/provenance: `CONTENT_PROVENANCE-ISHKALIAT.md`; structured content: `app/ishkaliat.json`.

### Medical boundary
Reference examples:
- WHO depression fact sheet: `https://www.who.int/news-room/fact-sheets/detail/depression`
- NHS depression diagnosis: `https://www.nhs.uk/mental-health/conditions/depression-in-adults/diagnosis/`
- Rule: ordinary worry/sadness can be discussed educationally. Persistent symptoms, significant impairment in work/study/relationships, diagnosed disorders, or self-harm risk must not be treated as “just spiritual weakness”; recommend qualified professional care while preserving religious support.

## 6) Personalization rules

Storage key: `profile-v1` with `{age, gender, advancedIssues}` where gender is `male` or `female`; `advancedIssues` is a local-only content preference for showing the optional advanced track.

Current logic:
- `audience`, `minAge`, `maxAge` on content items.
- Female-specific example: hijab obstacle.
- Some bank-deed text supports `maleText` / `femaleText`.
- Direct UI welcome changes to `أهلًا بك / أهلًا بكِ`.
- Life-stage label is only a UX aid; never infer medical/religious facts from age alone.

Future improvement: expand age/sex-aware content only where truly material (puberty, hijab, marriage, parenting, age-appropriate digital/relationship issues). Keep universal content universal.

## 7) Mental-health product boundary

`فقه النفس` is **education + self-reflection + Islamic orientation**, not diagnosis or psychotherapy.

Do:
- Help label feelings/thoughts, ask reflective questions, offer low-risk practical steps, connect to Qur'an/Sunnah, and encourage help when needed.
- Distinguish ordinary grief/worry from persistent disabling symptoms.
- Respect existing medical diagnoses and treatment; explicitly preserve existing prescribed medication/therapy/follow-up unless the treating clinician changes it. Never tell users to stop treatment because of app content.

Do not:
- Diagnose depression/OCD/anxiety disorder from a few answers.
- Present dhikr/ruqyah alone as a replacement for evidence-based care for a diagnosed disorder.
- Attribute all symptoms to weak iman, sin, jinn, or waswasa.

## 8) Saved-for-later model

Storage key: `saved-later-v1`.

Major content registers a `＋` via `laterRegister()` and stores title/text/source/tab locally. `محفوظاتي` lets the user review and open the parent section.

Known enhancement: implement **deep links to the exact saved item**, not just the parent tab; add optional filters by type and “mark as read/done”.


## 9) Personal problem-path model (v24)

Storage key: `qalb-paths-v1`.

- Supported path origins now: `problem` (heart disease), `obstacle` (specific real-life issue), and `nafs` (Fiqh al-Nafs topic).
- Stored objects reference source content by IDs and store only local progress/check-ins; they do not copy a new unsourced treatment protocol.
- A path is an organizational follow-up layer: understand the issue → work through already-sourced practical steps → return to the relevant iman anchor where present → review whether the issue feels `أخف / كما هي / أشد`.
- Multiple active paths are supported because different users can have different simultaneous real-life concerns.
- For mental-health-related paths, the app must keep the explicit rule: education/support does not replace diagnosis, clinician follow-up, medication, therapy, or urgent help when appropriate.

## 10) Known technical files

- `manifest.json` — MV3 manifest/version/permissions.
- `background.js` — side panel/context menu/background behavior.
- `app/index.html` — layout/CSS/markup/onboarding/settings/panels.
- `app/app.js` — main UI/application logic.
- `app/qalb.json` — heart diseases/works/obstacles/Fiqh al-Nafs/bank deeds.
- `app/knowledge.json` — essentials + fiqh data and general references.
- `app/ishkaliat.json` — optional advanced lecture-based issues track; every point has a source timestamp.
- `CONTENT_PROVENANCE-ISHKALIAT.md` — provenance/attribution rules for the advanced track.
- `references/raw-user-ishkaliat-notes.md` — raw owner-supplied secondary notes; not authoritative.
- `app/azkar.json`, `app/adiya.json`, `app/riyad.json`, `app/quran.json`, `app/asma.json`, `app/irtaqi.json` — content data.
- `app/sources.html` — public scientific/source methodology page.
- `app/privacy.html` — privacy disclosures.

## 11) Testing gates before each release

At minimum:
1. `manifest.json` parses and version is bumped.
2. All JSON files parse.
3. `node --check app/app.js` passes.
4. Search for rejected copy and stale feature names.
5. Sharia-source audit:
   - every obstacle `why`, answer, and practical step has a source label/link;
   - every Fiqh al-Nafs block has methodological/religious/medical source labels as applicable;
   - every bank deed has a source;
   - every essentials/fiqh card shows the general reference and specific references;
   - adhkar/du'a/heart/Qur'an/hadith source labels remain visible;
   - every `ishkaliat.json` intro/point has an original video + timestamp, and the UI shows it directly under that content.
6. Verify `＋` does not accidentally open a heart tile (event-propagation regression).
7. Test onboarding/profile for male + female and at least teen + adult ages.
8. Test dark/light, narrow side-panel width, scrolling segmented navigation, search, saved list, and settings.
9. If permissions or data use change, update `privacy.html` and Chrome Web Store disclosures before upload.

## 12) Near-term roadmap

Priority order:
1. Reliability + source integrity.
2. Exact-item deep linking from `محفوظاتي`.
3. Verify/refine the new `إشكاليات` summaries against actual transcripts/official text if supplied, while preserving point-level original-video timestamps.
4. More real-life obstacle cases with careful source mapping (family, boundaries, friendship, marriage, loneliness, pornography/sexual temptation, debt/money, job stress, study failure, social media, comparison, grief) — no sensationalism.
5. More precise age/sex personalization where genuinely needed.
6. Licensed/authorized **human audio** for adhkar if a trustworthy audio source/licence is secured; do not scrape random recitations.
7. Continued UX cleanup in large content areas.
8. Full regression/accessibility test before store release.

## 13) Instructions to the next AI

- Read this file before proposing changes.
- Treat the current ZIP/source as source of truth over memories of earlier versions.
- Preserve the product philosophy and non-negotiables above.
- When adding Islamic content, verify sources on the web where necessary and write the source into the app data/UI, not only in chat.
- If a source cannot be verified, say so and omit/rewrite the claim rather than filling the gap confidently.
- When adding psychological content, maintain the medical boundary and do not make diagnostic claims.
- Keep the owner's interaction cost low: make a reasonable implementation, test it, then report exactly what changed and any decisions still genuinely needed.



## 14) v24 UX revision — direct “Add to My Path” discoverability

Owner feedback after v24: the personal-path feature existed, but the action to save a problem into `مساري` was not discoverable enough. The UX was revised **without changing the public version family (still v24 / manifest 24.0.0)**.

Implemented behavior:
- Heart-disease cards now show a visible `＋ أضف لمساري` action directly on the card; the user does not have to open the detail page first.
- Fiqh al-Nafs topic cards now show the same direct action.
- Every specific obstacle/question shows `＋ أضف لمساري` before its details are expanded.
- Tapping the quick action saves locally to `qalb-paths-v1` and stays on the current browsing screen, showing `✓ في مساري` plus a toast.
- If a previously archived path is selected again, it is reactivated rather than blocked as a duplicate.
- The empty `مساري` screen now starts from the user's lived concern (`هم أو قلق`, `فتور`, `ذنب يتكرر`, `مشكلة أسرية`, `علاقة أو ارتباط`, `مرض قلب`) and routes to the most relevant section/search. This is navigation/personal organization, **not diagnosis**.
- The existing full `ابدأ مسارًا لهذه المشكلة` action remains in detail views.
- `＋` for `محفوظاتي` remains a separate concept: save to read later vs. add a real concern to `مساري`. Keep these two actions visually/textually distinct in future work.

Testing requirement added: verify quick-path buttons do not trigger the parent card/open event, and that obstacle expand/collapse still works after inserting the quick action row.

## 15) v24 R3 — saved-state feedback + mature Sharia-priority «ارتقِ» plan

Owner feedback: the generic `＋` save-for-later control did save content, but the icon did not visibly change, so users could not tell the item was saved. Owner also requested that the post-assessment `ارتقِ` plan become more mature and visibly grounded in Sharia principles.

Implemented:
- Generic `محفوظاتي` buttons now render from saved state: `＋` when unsaved and `✓` when saved. This state is synchronized immediately after click across all duplicate instances, includes `aria-pressed`, updated title/label, and a strong visual selected state.
- Quick `＋ أضف لمساري` buttons were hardened too: even if a stale button is clicked for an already-active path, the UI is force-synchronized to `✓ في مساري`; reactivated archived paths also update immediately.
- `ارتقِ` moved from a pure “lowest score first” algorithm to a **Sharia-priority framework**. The plan now explicitly follows: (1) obligations/prayer + rights + necessary knowledge, (2) stable Qur'an/dhikr, (3) optional growth/nawafil only after a reasonable foundation.
- New plan principles are visible after the assessment, not inside quiz questions: **الفرائض قبل النوافل**, **القليل الدائم قبل الكثير المنقطع**, **بلا تكلف ولا إنهاك**, and **اعرف حكم ما تعمل**. Each principle has a clickable source.
- Core verified references used in the plan include: hadith al-wali (Sahih al-Bukhari 6502; Dorar), “أحب الأعمال إلى الله أدومها وإن قل” (Bukhari/Muslim; Dorar), “إن الدين يسر” (Bukhari 39; Dorar), Qur'an 16:43, 4:103, 49:12, 17:23, 47:24, 33:41–42, 33:56, and relevant verified hadith links for rights, Qur'an learning, istighfar, and witr.
- `ارتقِ` assessment remains a **self-organization tool, not a judgement of faith**. The 40-day duration remains explicitly organizational, not a sacred number or Sunnah. v3 journeys receive a unique journey ID so a new assessment on the same date does not inherit old completion marks.
- Existing v2 `ارتقِ` journeys are automatically rebuilt once from the last saved assessment into the v3 framework; no user re-entry is required.
- Each daily plan card now explains **“لماذا هذه الخطوة الآن؟”**, shows one primary task, at most one maintenance task, and displays the direct source beside the relevant task. This is intentionally different from dumping all references into the assessment.
- The assessment axes were matured to: `الصلاة والفرائض`, `ترك الأذى وحقوق العباد`, `العلم اللازم والتزكية`, `القرآن`, `الذكر والدعاء`, `النوافل والزيادة`. It still contains 24 questions total.

Important continuation rule: do not regress `ارتقِ` into a score-maximization/gamification system. When adding plan tasks, separate **religiously fixed acts/counts** from **organizational product choices**, and put the source under the task itself.

## 16) v24 R4 — hadith typography + Nawawi 40 + sourced explanation reader

Owner feedback: Riyad al-Salihin displayed raw double parentheses such as `((رواه...))`, which looked broken in Arabic RTL. Owner also made sourced hadith explanation a top priority and requested adding al-Nawawi's Forty to the `العلم` tab.

Implemented:
- Riyad al-Salihin rendering now separates legacy double-parenthetical takhrij/source fragments from the main matn. The list/detail UI no longer shows the ugly `((...))` form; the references appear in a dedicated `التخريج والإحالات` block. The underlying local data is not doctrinally rewritten.
- Every Riyad hadith card is now clickable and opens a focused hadith reader. The reader shows: clean matn -> exact Sunnah.com Riyad link -> **trusted commentary reference before the explanation** -> concise explanation -> extracted takhrij/source notes.
- Trusted Riyad commentary reference: **شرح رياض الصالحين — الشيخ محمد بن صالح العثيمين رحمه الله**, linked to the official Ibn Uthaymeen Foundation book page.
- The concise Riyad explanation is deliberately labelled as a short educational Rafiq formulation, **not a verbatim quote from the shaykh**. Never misattribute generated/paraphrased wording as a direct quotation. For legal/theological detail, route the user to the cited commentary.
- Added `app/nawawi40.json` containing 42 Nawawi hadith entries, titles, concise explanation, takhrij labels, exact per-hadith verification links, and the official commentary-book link.
- Added a new `الأربعون النووية` segment inside `العلم`, with search, save-for-later integration, and click-to-open hadith reader.
- Trusted Nawawi commentary reference: **شرح الأربعين النووية — الشيخ محمد بن صالح العثيمين رحمه الله**, linked to the official Ibn Uthaymeen Foundation book page. The simplified notes are short educational paraphrases and not long quotations.
- Hadith 41 includes a neutral authenticity caution because later hadith scholars discussed its chain; do not present disputed grading as unanimous.
- `app/sources.html` now records the two commentary references and the explanation/paraphrase policy.
- Public version remains **v24 / manifest `24.0.0`** per owner instruction.

Continuation rules for hadith explanations:
1. A visible **commentary source/reference must appear before the simplified explanation**.
2. Do not invent a shaykh quotation. If wording is not checked verbatim, label it as a simplified educational formulation/paraphrase.
3. Keep the original hadith/takhrij source separately visible from the commentary source.
4. For high-risk fiqh, hudud, fighting, changing evil, medical, or family-law implications, include context/boundary notes and direct users to qualified scholarship; do not turn a short card into a fatwa.
5. Preserve exact verification links when available (`sunnah.com/riyadussalihin:<n>` and `sunnah.com/nawawi40:<n>`).



## 15) v24 R5 — clarity pass: adhkar spacing, Ishkaliat discoverability, deed evidence, history, data architecture

Owner feedback: do not modify ambiguous requirements. R5 changes only items whose intent was clear; no backend/cloud/analytics service was added.

Implemented:
- Adhkar typography spacing increased; the tap-to-count hint is now a separate line rather than crowding the Arabic dhikr text.
- `إشكاليات` is always visible in the Heart segmented navigation. If the advanced track is off, opening it shows an explicit opt-in screen and enables it only after a user click.
- Bank of Deeds references now show **الدليل المرتبط بالعمل** plus a short relevant verse/hadith phrase before the source link. Two loosely-worded actions were tightened to match their evidence more directly.
- `الخبيئة` no longer uses al-Bayyinah 5 as its main proof for secrecy; it now points directly to the hadith of the seven shaded by Allah, including the hidden charity example.
- `السجل` now starts with plain-language weekly cards: what the user actually recorded, then `ما الذي يحتاج تثبيتًا؟` based only on recorded app data. It explicitly says this is not a judgement on faith. Old detailed tracker/28-day stats remain under `عرض التفاصيل والأرقام`.
- Added `DATA_ARCHITECTURE.md`: current product has no cloud backend/database. Most app data is per-device local storage; the existing PWABuilder Android package points to `https://abdull2.github.io/rafiq/`. No cloud analytics or sync was introduced in R5.

Future AI rule: distinguish **product analytics** from **cloud user database/sync**. Do not introduce Firebase/Supabase/custom backend until the owner explicitly chooses the privacy/data model.

## 16) v24 R6 — companion supplications + Asma card layout repair

Owner requested a sourced **أدعية الصحابة** section and reported that the Names of Allah cards had become visually overlapped/broken on narrow widths.

Implemented:
- Added a new `أدعية الصحابة` category directly after Qur'anic supplications in `app/adiya.json`. It currently contains 5 carefully scoped items:
  1. Abu Bakr al-Siddiq — the supplication taught to him by the Prophet ﷺ in prayer; Sahih al-Bukhari 834.
  2. Ali ibn Abi Talib — `اللهم اهدني وسددني`; Sahih Muslim 2725.
  3. Mu'adh ibn Jabal — `اللهم أعني على ذكرك وشكرك وحسن عبادتك`; Abu Dawud 1522 / al-Nasa'i 1303; strong chain per Ibn Hajar.
  4. Aisha — `اللهم إنك عفو تحب العفو فاعف عني`; al-Tirmidhi 3513, hasan sahih.
  5. Abu al-Darda — `اللهم إني أسألك إيمانا دائما...`; athar graded sahih al-isnad in Ibn Abi Shaybah.
- Important attribution rule: the UI distinguishes **a companion's own supplication** from **a supplication the Prophet ﷺ taught to a specific companion**. Do not flatten these into one attribution.
- Each item has a visible source and direct Dorar verification link. `app/sources.html` documents the category and its references.
- The du'a renderer now supports `who`, `sUrl`, and a category `intro`; source text is clickable when a verification URL exists.
- Repaired Names of Allah list cards for narrow side-panel/mobile widths: card content now uses a two-column CSS grid, reserves dedicated space for the saved-later button, moves Qur'an-count metadata to its own wrapped chip, replaces the ambiguous single arrow with `فتح التفاصيل ←`, and keeps the source in a separate compact block below the card.
- Added short source labels in `asma.json` for list-card display while keeping full source titles in detailed/source views.
- Added defensive wrapping/min-width rules in Asma detail sections to reduce overflow and overlap.
- Public version remains `v24` / manifest `24.0.0`.

Continuation rules:
1. Do not add companion du'a merely because it is popular; verify the exact attribution and grading.
2. If the Prophet ﷺ taught a du'a to a companion, label it that way instead of claiming the companion authored it.
3. Preserve the Asma card's reserved bookmark space and responsive grid; regression-test at narrow widths before changing the card again.

## 17) v24 R7 — move Qur'an daily wird into the Mushaf tab

Owner flagged that `ورد القرآن` was incorrectly living inside the `الذكر / السبحة` area after the product information architecture evolved. The daily Qur'an pages tracker is now owned by the **المصحف** tab.

Implemented:
- Removed the entire `ورد القرآن` card from `v-tasbih`.
- Added the same daily pages tracker inside `v-quran`, directly below the Qur'an resume hero and before the verse-of-the-day/search content.
- Preserved the existing local data model (`data.pages`) and khatma-based organizational goal; this is a UI/navigation move only, not a data migration.
- `switchTab('quran')` now calls both `openQuran()` and `renderQuran()`; `switchTab('tasbih')` now renders only the tasbih.
- Moved the `السبحة الكاملة` link into the actual tasbih section header, where it semantically belongs.
- Public version remains **v24 / manifest `24.0.0`**.

Information-architecture rule going forward:
- `الذكر` owns adhkar, dua, tasbih, and Names of Allah.
- `المصحف` owns Qur'an reading, Qur'an search, resume reading, and the daily Qur'an wird/progress tracker.
- Home may show a shortcut/status for the Qur'an wird, but opening it should route to `المصحف`, not `الذكر`.

## 18) v24 R8 — Names of Allah card UI rebuilt after second overlap report

Owner reported that the **أسماء الله الحسنى** layout was still visually broken after the R6 patch. The previous fix still depended on an absolutely positioned bookmark and a full-width clickable grid, which could collide with content in RTL/narrow layouts.

Implemented in R8:
- Rebuilt each Asma list card structurally instead of adding another spacing patch. The card is now a true three-column RTL row: **number | content | bookmark**.
- The saved-later `＋/✓` control now occupies its own grid column and is **not absolutely positioned over the card text**. Do not reintroduce absolute positioning for the Asma bookmark.
- The clickable content is a separate `.asma-open` control containing the name, a two-line meaning preview, a small Qur'an-reference count chip, and a clear `المعنى والأثر والأدلة ←` hint.
- The source/reference is a dedicated footer row below the content, so it cannot collide with the name or bookmark.
- `#asma-list` is responsive: one column on narrow/mobile widths and can use multiple columns only when there is genuinely enough width.
- Added explicit min-width/wrapping rules for cards and detail/source content.
- No religious content, Asma dataset, sources, or saved-later storage model changed in this release. This is a UI-structure repair only.
- Public version remains **v24 / manifest `24.0.0`**.

Regression rule for future AI:
1. Test Asma list at narrow side-panel/mobile width before delivery.
2. Bookmark must remain a dedicated grid cell; never overlay it on name/meaning text.
3. Source stays in a separate footer row.
4. Do not change the Asma religious dataset merely to solve layout problems.



## 19) v24 R9 — sourced concise Prophetic biography in Knowledge

Owner asked for an authenticated concise seerah inside Rafiq. Added a new **السيرة المختصرة** section inside the Knowledge tab.

Implemented:
- Added `app/seerah.json` with 11 concise educational stations: lineage/upbringing, Khadijah and family life, first revelation, Makkan call, Isra/Mi'raj and prayer, migration, Madinah and spread of the message, Prophetic character, meaning of the message, signs of Prophethood with the Qur'an as the greatest enduring sign, and completion of the message/death.
- Primary source for every station: **«رسول الإسلام محمد ﷺ»** by the Scientific Committee of the Presidency of Religious Affairs at the Grand Mosque and the Prophet's Mosque: `https://risala.prh.gov.sa/ar/contents/321`.
- Rafiq text is explicitly labeled an educational paraphrase, not a verbatim reproduction of the source.
- Added an expansion reference from the official Ibn Uthaymeen Foundation: **«التعليق على نور اليقين في سيرة سيد المرسلين»**.
- Each station shows its linked source immediately beneath the content and supports `＋/✓` Saved Later.
- Added search and chronological/category filters.
- `app/sources.html` documents both the primary source and expansion reference.
- Public version remains **v24 / manifest 24.0.0**.

Seerah source-integrity rule for future AI:
1. Do not add popular stories, miracle narratives, battle details, dates, or quotations merely because they are famous. Add only when a reliable source is available and visible in the UI.
2. Keep Rafiq summaries clearly distinguished from verbatim words of a scholar/book.
3. The official Presidency book is the current primary backbone for the concise section; deeper chronology may be expanded later only with vetted seerah references.
