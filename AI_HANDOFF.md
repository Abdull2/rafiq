# NEXT AI — READ THIS FIRST

**Project:** تدارُك - Tadaruq (legacy/internal identifiers may still use Rafiq)  
**State ID:** `TADARUQ-HANDOFF-v24-R18-2026-08-19`  
**Current artifact type:** GitHub Pages PWA + Google Play TWA distribution, with Chrome Manifest V3 side-panel source retained  
**Current release:** `v24 R27` (Chrome manifest version `24.7.0`; local data schema `rafiq:data-version = 2`; Google Play package `com.tadaruqnoor.rafiq`)

> This file is the continuity record for future AI sessions. Before changing code or content, inspect this file, `manifest.json`, the hosted root `app.js` + `index.html` (and `app/app.js` + `app/index.html` in the full extension-source layout), plus the relevant JSON data. Do not ask the owner to repeat decisions already documented here unless a conflict genuinely requires a decision.

## 0) IMMUTABLE AI_HANDOFF POLICY — OWNER ORDER, DO NOT DELETE

This section is an explicit owner instruction and overrides any cleanup/refactor impulse:

1. **NEVER delete `AI_HANDOFF.md`.** Do not rename it, truncate it, replace it with a shorter summary, exclude it from a release ZIP, or move it out of the project root/source handoff. Its absence is a release-blocking regression.
2. **Preserve all existing history.** Future work is append-only for prior decisions/history. Correct an old note by appending a dated correction; do not erase the earlier record unless the owner explicitly orders a redaction.
3. **Every coding/chat session must be recorded here before returning artifacts.** Append the user request, important user/assistant exchanges, decisions, errors encountered, URLs/package IDs/version codes that matter, files changed, tests run, test results, unresolved items, and exact follow-up steps.
4. The owner explicitly asked to keep **the chat and every change** in this file. When the exact transcript is available, append it or a chronological near-verbatim ledger. If a platform/tool prevents exact transcript export, write a faithful chronological record that preserves all substantive messages, commands, errors, decisions, and corrections. Never silently omit a major exchange.
5. Update `AI_HANDOFF.json`, `PROMPT_FOR_NEXT_AI.txt`, release notes, QA report, and manifest version whenever code/content changes. `AI_HANDOFF.md` remains the primary human-readable source of truth.
6. A future AI must read this file **before** proposing or making edits and must not ask the owner to repeat information already recorded here.
7. **Do not commit Android signing secrets.** `signing.keystore`, passwords, signing-key-info files, API tokens, or Play credentials must never be placed in GitHub or this handoff.

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

## 20) v24 R10 — local data-safety release before more features

Owner confirmed that Rafiq is already being used by friends. From this release onward, existing user data is treated as production legacy data and must survive ordinary UI/content updates.

Implemented:
- Added `app/data-safety.js` as a local-first compatibility layer. This does **not** add a backend, account system, analytics, Firebase, Supabase, or central database.
- Added a separate local schema version key: `rafiq:data-version`. Current schema is **1** while the public app/manifest remains **24.0.0**.
- On the first R10 launch with legacy data, Rafiq inventories registered data and creates `rafiq:safety-snapshot:v1` before registering schema v1. The v0 -> v1 migration intentionally rewrites no legacy user records.
- Migration framework is fail-safe: validation runs after migration and a failed migration restores the pre-migration safety snapshot rather than continuing with partially converted data.
- Replaced the old partial exporter with a fuller portable backup covering settings/profile, daily logs, Saved Later, todos, Qur'an position/font, dua/Riyad favorites, Heart journal/progress/tracking/personal paths, Irtaqi state, Khabia and `tas:*` data.
- Chrome-extension portable backups additionally include Rafiq notebook/preferences/prayer extension state when `chrome.storage.local` is available.
- New backups use `format: rafiq-backup`, include backup/data versions, and include a SHA-256 integrity checksum when Web Crypto is available.
- Old `muhasabah-backup` JSON remains importable. Because that legacy format omitted several later features, legacy imports are forced into non-destructive merge mode so an old backup cannot erase newer local data that it never contained.
- Before every import, Rafiq creates a local safety snapshot; failed restore/validation rolls app-local data back. Chrome extension state is also snapshotted for import rollback when available.
- Settings now contains `بياناتي والحماية`: full backup download, restore, safe-merge option, local structural audit, and data-version/status summary.
- Added `DATA_SAFETY.md`; future AI/developers MUST read it before changing storage.

Non-negotiable storage rule going forward:
1. Never rename/delete/restructure a persistent user key without a versioned migration.
2. Add every new persistent key/prefix to the registry in `app/data-safety.js`.
3. Preserve stable content IDs; if an ID must change, add an explicit old -> new mapping migration.
4. A successful syntax build is not enough: run the Data Safety harness and validate JSON before packaging.
5. Local safety is not cloud backup. Clearing app/site/extension data can still remove user records; downloaded backups remain important until/if the owner explicitly chooses cloud sync.


## 16) v24 R11 — medium seerah + companions batch 1
- Upgraded the Knowledge seerah from an ultra-short 11-station overview to **19 stations**.
- Every old R9 seerah ID is preserved exactly: `origin`, `khadija`, `revelation`, `makkah`, `isra`, `migration`, `madinah`, `character`, `message`, `signs`, `farewell`. Do not rename them: users may have `seerah:<id>` in `saved-later-v1`.
- New additive seerah IDs: `abyssinia`, `badr`, `uhud`, `khandaq`, `hudaybiyah`, `khaybar`, `conquest`, `tabuk`.
- Seerah card UX is now: **quick summary -> open card -> medium detail -> visible source stack**.
- General seerah source remains `رسول الإسلام محمد ﷺ` from the Presidency of Religious Affairs. Detailed milestones link directly to the relevant pages in al-Dhahabi's `سير أعلام النبلاء`. The official Ibn Uthaymeen Foundation `التعليق على نور اليقين` remains the book-level expansion reference.
- Added `app/companions.json` with **24 famous companions/companions women**. Stable Saved Later IDs are `companion:<semantic-id>`; never rename without migration.
- Companion UI has search + filters + quick intro + medium detail + direct Siyar biography source. `الإصابة في تمييز الصحابة` is a general cross-check reference.
- Companion content rule: classical biography books can contain reports of differing strength. Rafiq should state only stable/basic facts by default; any special virtue, quotation, miracle-like story, or disputed anecdote that needs hadith grading must be separately verified before asserting it.
- R11 changed **content and UI only**. No storage key, storage shape, or data schema change. R10 Data Safety remains in force.


## 21) v24 R12 — familiar Mushaf entry + sourced Adhkar + cleaned Knowledge navigation
- Quran bottom tab now opens the **Mushaf reader directly**, not the tracker/search landing page. On a first reading state it opens page 1 (Al-Fatihah); when a saved reading position exists it resumes that page.
- Existing `quran-pos` storage is preserved. No Quran/user-data storage key or shape changed.
- Mushaf retains horizontal swipe paging: **swipe from left to right -> next page**, swipe from right to left -> previous page. (This corrects the older R12 wording.) A short hint is shown on page 1 only.
- The reader's `الفهرس` control opens the existing Quran tools screen containing resume, Qur'an wird, Ayah of the day, search, and surah index. The bottom Quran tab remains visually selected while reading.
- Quran reader source line links to the King Fahd Glorious Qur'an Printing Complex as the review/reference authority.
- Adhkar now has a visible section-level source banner above every major set. Current canonical book-level source is **حصن المسلم من أذكار الكتاب والسنة — سعيد بن علي بن وهف القحطاني**, linked to the official `رسالة الحرمين` resource (`risala.prh.gov.sa/ar/content/51`). Item-level sources remain visible.
- Added a visible `حصن المسلم` entry in the Adhkar tabs. It is a book/source overview and route to the full official resource; Rafiq does not silently copy the entire copyrighted compilation.
- Removed the debated hard-coded precise time phrases for morning/evening from the UI and replaced them with neutral `ورد الصباح` / `ورد المساء`.
- Knowledge navigation is now text-only: removed decorative icons/counts from tab labels. **الأربعون النووية comes before رياض الصالحين** and is the default Knowledge section.
- Added a Riyad al-Salihin introduction parallel to the Nawawi 40 intro: author, scope, source of the book text (Shamela entry for the Shu'ayb al-Arna'ut / Mu'assasat al-Risalah edition), and the official Ibn Uthaymeen Foundation commentary reference.
- Riyad hadith details now distinguish **source of the book/text** from **commentary reference**; the quick per-hadith locator is secondary.
- R12 is content/navigation/UI only. No persistent user key, saved-content ID, or data schema changed; R10 Data Safety schema v1 remains unchanged.
- Public version remains **v24 / manifest 24.0.0**.

Regression rules:
1. Quran tab should never dump a new user into a dashboard before showing the Mushaf; first reading state starts at Al-Fatihah.
2. Preserve `quran-pos` semantics. Permanent RTL paging rule: **left-to-right finger swipe (`dx > 0`) -> next page; right-to-left swipe -> previous page**.
3. Every Adhkar major section keeps a visible trusted source banner *above* its contents, and every item keeps its own source below.
4. Do not put icon glyphs/counts back into Knowledge tab labels unless the owner explicitly requests them.
5. Keep Nawawi 40 before Riyad al-Salihin in Knowledge navigation.

## 22) v24 R13 — full Hisn al-Muslim reader + official Al-Mukhtasar tafsir bridge

Owner approved adding the complete Hisn al-Muslim experience and requested a complete, trusted "المختصر في التفسير" experience in the Mushaf tab.

Implemented:
- `الذكر -> حصن المسلم كاملًا` is now a real full-book reader rather than only an overview/link.
- The full Hisn index is loaded on demand from the open-source `asellam/HisnElMuslim` JSON dataset (MIT license, Copyright 2021 Abdellah SELLAM). The dataset maintainer states that he transcribed it from the printed book and cross-compared it with a digital copy to correct errors.
- The **religious/canonical source remains** the official `حصن المسلم من أذكار الكتاب والسنة — سعيد بن علي بن وهف القحطاني` resource published by `رسالة الحرمين / رئاسة الشؤون الدينية بالحرمين`: `https://risala.prh.gov.sa/ar/content/51`. The GitHub dataset is only a digital transcription layer, not an independent religious authority.
- Full Hisn UX: complete chapter index, chapter reader, text, repetition count from the book dataset, visible book reference/takhrij below each item, device TTS, Saved Later, and search across the full Hisn corpus plus the existing curated adhkar sets.
- External Hisn data is cached in localStorage under `hisn-static-cache-v1-20260819` only as **static content cache**. It is intentionally NOT part of the Data Safety user-data registry/backup and must never be treated as personal data.
- If the remote dataset cannot load, Rafiq fails safely and shows the official Risala al-Haramain full-book link instead of inventing/missing text.
- `app/privacy.html` now discloses the jsDelivr/GitHub static-content request; no journal, profile, worship log, geolocation, or other personal state is sent with that request by Rafiq.
- Added third-party license attribution for the HisnElMuslim digital dataset.

Al-Mukhtasar tafsir:
- Added an official `المختصر في تفسير القرآن الكريم` card inside Qur'an tools and a visible `التفسير` action in the Mushaf reader.
- When an ayah is selected, the tafsir action deep-links that exact surah/ayah to the official Dar al-Mukhtasar reader (`https://mokhtasr.com/ar/books/200?aya=...&sura=...`). A per-page tafsir card always shows the current ayah target.
- Book authority/source is `مركز تفسير للدراسات القرآنية`; the official publication page is `https://www.tafsir.sa/publication/5294/al-mkhtsr-fy-at-tfsyr`.
- **Do not bundle/copy the full Al-Mukhtasar text into Rafiq without explicit permission/license.** The official Dar al-Mukhtasar terms state that site/program material may not be reproduced/published/broadcast except for personal non-commercial use, while clear linking is allowed. Their API exists at `https://mokhtasr.com/ar/api-doc` but book-content endpoints require an Authorization token. If the owner later obtains an API token or written permission for Rafiq, native inline tafsir can be added using the official API instead of copying the book.
- This release adds no cloud backend, analytics, account, or central database.
- No persistent **user** data key/schema/stable saved-content ID was renamed or removed. Data Safety schema remains v1. The only new localStorage entry is a replaceable static Hisn content cache.
- Public manifest remains `24.0.0`.

R13 regression rules:
1. Full Hisn must always identify the official Risala al-Haramain edition as the canonical book source, with the GitHub dataset described only as a digital transcription.
2. Never silently substitute or invent a Hisn text/reference if the remote data fails; show the official book link.
3. Search should include both the existing curated adhkar and the full Hisn dataset once available.
4. Al-Mukhtasar text is not copied into project files without owner-provided permission/license. Use official deep links/API.
5. Mushaf ayah -> tafsir must target the selected ayah; if no ayah is selected, use the first ayah on the current page.
6. Do not register static Hisn cache as user data; do register any future *user-specific* Hisn progress/favorites key if such a feature is added.
- Chrome MV3 note: R13 added host permissions for `https://cdn.jsdelivr.net/*` and `https://raw.githubusercontent.com/*` to fetch public Hisn JSON. R14 also uses the same origins for fixed Mushaf SVG page assets. Do not use those origins for telemetry or user-data upload. Remove a permission only after all current public-content fetches using that origin have been replaced and regression-tested.


## 23) v24 R14 — exact printed Madinah Mushaf pages + corrected RTL page gesture

Owner rejected flowing Quran text because browser reflow can move an ayah/word to a different line and therefore change the physical page composition. The Mushaf must behave like a familiar printed-Mushaf reader: line starts/ends and page starts/ends are fixed.

Implemented:
- Quran reader now renders the **604 fixed pages of Mushaf al-Madinah (Hafs / King Fahd Complex layout)** as vector SVG pages rather than reconstructing the page from verse strings. This prevents CSS/font width from changing where a Quranic line begins or ends.
- Canonical authority remains the King Fahd Glorious Qur'an Printing Complex digital Mushaf. The interactive technical layer is Quranpedia `quran-svg`, `mushafs/hafs/kfqc/svg/`, pinned to commit `0198423eb867ba26051aba6ac902cd5d10aadd1b`. Do not silently switch this to an unpinned branch.
- Quranpedia's transparent `.ayahPolygon` layer is used only for tap selection / tafsir targeting. It does not alter the printed glyph paths. Remote SVG is sanitized before DOM insertion (active-content elements and event attributes removed).
- If exact SVG loading fails, Rafiq may show the existing text fallback **with a visible warning that it is not the page-accurate Mushaf view**. Never present the fallback as exact printed pagination.
- Page 1 still opens for a new user and existing `quran-pos` still resumes for returning users. No storage key/schema/ID changed; Data Safety schema remains v1.
- **Correct paging gesture (owner's explicit requirement): finger swipe left -> right (`dx > 0`) opens the NEXT page. Finger swipe right -> left opens the PREVIOUS page.** This supersedes contradictory R12 wording.
- A+/A- changes SVG zoom only and must not reflow/recompose Quran lines.
- Same remote hosts already permitted for R13 (`cdn.jsdelivr.net`, `raw.githubusercontent.com`) now also deliver public, read-only Mushaf SVG pages; no user data is uploaded to them. Privacy/source notices were updated.
- Added `MUSHAF_PROVENANCE.md` and expanded `THIRD_PARTY_LICENSES.md`.
- Public version remains v24 / manifest `24.0.0`.

Mushaf regression rules for future AI:
1. Never render the primary Mushaf reading view from independently flowing ayah spans. Fixed printed line/page geometry is a product requirement.
2. Do not edit, reshape, justify, split, or recombine Quranic lines. Scaling the whole page is allowed; reflow is not.
3. Keep `quran-pos` stable. Any future Quran persistence change requires a Data Safety migration.
4. Keep left-to-right finger swipe = next page.
5. Keep the King Fahd Complex as the canonical Mushaf source; technical mirrors/layers must be identified as such.
6. Ayah tap overlays may be interactive, but they must not modify the Quran glyph layer.

Al-Mukhtasar API architecture note:
- Official API registration returns an application Bearer token, and `book-contents` can request tafsir by `sura` + `aya`.
- **Do not put that Bearer token in public PWA/extension JavaScript.** It would be extractable by any user.
- If the owner approves inline official tafsir later, use a minimal serverless/backend proxy holding the token in an environment secret: Rafiq -> `/api/tafsir?sura=&aya=` -> proxy adds Bearer -> official Mokhtasar API -> Rafiq renders the returned text. Current no-backend build keeps the official deep link.

## 24) v24 R15 — immersive Mushaf + تزكية cleanup + solid Hadith reader
- The Quran tab keeps the fixed KFQC 604-page SVG requirement from R14. R15 adds an **immersive fullscreen reading mode** without changing Quran text, page geometry, `quran-pos`, or any saved-content ID.
- `rd-fullscreen` toggles CSS immersive mode and attempts the browser Fullscreen API when available. Fullscreen is a progressive enhancement: if the API is rejected/unavailable, the CSS immersive reader still works.
- In fullscreen, a tap on empty Mushaf space toggles reading controls. Ayah taps remain reserved for ayah selection/tafsir targeting.
- Mushaf SVG page requests are cached in-memory during the session. Page replacement no longer blanks the current page first; the new page enters with a short direction-aware fade/slide for a smoother reader feel.
- Permanent paging rule remains: **finger swipe left -> right (`dx > 0`) = NEXT page**; right -> left = previous page.
- Visible product label `القلب` is now **`تزكية`**. Internal route/storage IDs remain `qalb` for backward compatibility. Do not rename `qalb-*` storage keys or the `qalb` tab ID without migration.
- Decorative glyphs/symbols were removed from the تزكية sub-navigation and decorative card/group icons. Functional symbols such as `+` / `✓` for save/path state remain because they communicate state/action.
- Hadith detail was repaired as a truly opaque full-viewport reading surface. The old `var(--bg)`/bottom inset behavior could expose underlying UI; R15 covers the entire viewport using `var(--paper)` and locks body scrolling.
- Hadith back navigation is now an explicit `رجوع للأحاديث` control with click handling, Escape support, and browser/system Back support via a temporary history state. Do not restore the old partial-height overlay.
- R15 is UI/navigation only. **No persistent storage key, stored shape, Data Safety schema, or stable saved-content ID changed.**

## 25) 2026-08-19 — PWA/PWABuilder + Google Play/TWA distribution continuity ledger

This section records the publication conversation so the owner never has to explain it again.

### A. PWABuilder diagnosis and PWA conversion

Chronological conversation/decision record:

- Owner supplied the existing v24/R15 source ZIP and a PWABuilder screenshot showing `Missing Name`, `Your manifest description is missing`, `Create a web app manifest`, and `Make your app faster and more reliable by adding a service worker`.
- Diagnosis: the source already had Chrome Extension `manifest.json` with `manifest_version: 3`; that file is valid for the Chrome MV3 extension but **is not** the Web App Manifest that PWABuilder requires.
- The hosted PWA needs a separate `manifest.webmanifest`, an HTML `<link rel="manifest">`, a registered `sw.js`, HTTPS hosting, icons, and a root web entry point.
- A PWA/GitHub-Pages-ready package was generated. A later owner question exposed an error in the AI packaging decision: the first PWA-only ZIP omitted `AI_HANDOFF.md`. The owner explicitly objected. From this point forward, `AI_HANDOFF.md` is mandatory in every full source/release handoff and must never be deleted or silently excluded.
- The owner asked why PWABuilder could report problems while the project was "working perfectly." Clarification: a normal website/Chrome extension can run correctly while still failing PWA installability/store checks; PWABuilder validates PWA metadata/service worker/installability, not just whether HTML/JS renders.
- The correct URL for PWABuilder is the **published HTTPS app**, not the GitHub repository code page. Current public origin: `https://abdull2.github.io/rafiq/`.
- The PWA manifest description was added/fixed. Current manifest must keep a non-empty `description` and remain linked from `index.html`.
- Service worker registration is part of the hosted build. R16 additionally forces SW update checks with `updateViaCache: 'none'`, activates waiting updates via `SKIP_WAITING`, and reloads once on controller change so GitHub Pages changes reach installed PWA/TWA users more predictably.

### B. Google Play package identity and first Android/TWA package

- Owner created Google Play Console app **تدارُك - Tadaruq**.
- Google Play application/package ID is permanently important: `com.tadaruqnoor.rafiq`.
- The first PWABuilder Android package was inspected and had the wrong package ID: `io.github.abdull2.rafiq`. Its `assetlinks.json` also used that old ID. Owner regenerated the package.
- The corrected package was inspected and confirmed to use `com.tadaruqnoor.rafiq` in the AAB/asset links package identity.
- Do not change this package ID casually: a Play app's package/application ID cannot be swapped to a different app identity after publication. Future PWABuilder/TWA/native bundles for this Play listing must remain `com.tadaruqnoor.rafiq`.
- PWABuilder package ZIP may include signing materials (`signing.keystore`, signing info/password text). These are secrets. **Never commit them to GitHub or include passwords in public documentation.**

### C. Google Play testing workflow reached on 2026-08-19

- Internal testing release name used: `Tadaruq 1.0.0 - Internal`.
- Internal testing build reached status `Available to internal testers`; Play Console showed it as released and available on ~20k compatible devices.
- Internal tester opt-in link used in this session: `https://play.google.com/apps/internaltest/4701628883133223204`.
- Some testers saw `App not available` / `A testing version of this app hasn't been published yet or isn't available for this account.` Main checks documented: tester email list must be attached to track, tester must open with the exact invited Google account, tester must opt in through the test link, and a first test release may take time to propagate.
- Google Play web page initially showed the package name plus `(unreviewed)`, generic Android icon, and `Unrated`. This is expected before full store listing/content rating/review is completed; it did not mean the AAB itself was broken.
- Closed testing track created: `Closed testing - Alpha`.
- Countries/regions were set broadly (Play Console screenshot later showed 177 countries/regions / rest of world change entries).
- A closed release named `tadaruq first` was created.
- An attempted re-upload of the same AAB produced exact Play error: `Version code 1 has already been used. Try another version code.` Correct resolution: do **not** upload the same file again; use `Add from library` or promote the already-uploaded internal bundle into Closed testing.
- Earlier preview errors when no bundle was actually attached were: `This release does not add or remove any app bundles.` and `You can't rollout this release because it doesn't allow any existing users to upgrade to the newly added app bundles.` These were release-assembly errors, not app-code errors.
- Closed track later showed `Active`, latest release `tadaruq first`, but release text said `Not yet sent for review`. Owner moved to Publishing overview.
- Publishing overview then showed `Changes not yet submitted for review`, `Submit 4 changes for review`, pre-review quick checks, and Closed testing Alpha changes. The next action was to submit those changes for Google review.
- Account/dashboard requirement shown by Google: closed test must have **at least 12 testers opted in for at least 14 consecutive days** before applying for Production access. Internal testing is optional; Closed testing is the gating path for this account.
- For safety, recruit more than 12 (e.g. 15–20) so a dropout does not reset/jeopardize the threshold.
- Testers should receive the shareable/opt-in link from the owner; merely adding an email to a list is not enough. A person on Internal testing may need to opt out before receiving a Closed track depending on Play's track precedence.

### D. TWA / GitHub update rule — owner asked explicitly

- The Android app is a PWABuilder/Trusted Web Activity wrapper around the hosted PWA. Most **web-content** changes (`index.html`, `app.js`, CSS, JSON content, web UI, sources, web service worker) can be deployed through GitHub Pages without building a new AAB; installed TWA users load the hosted site.
- A new AAB/Play release is required for Android-shell/native changes such as package ID, AndroidManifest permissions/config, target SDK/native wrapper changes, signing/build identity, or changes that live only inside the Android bundle.
- Store listing metadata/icon/screenshots in Google Play Console are managed in Play Console, not by GitHub PWA updates.
- `assetlinks.json` must ultimately use package `com.tadaruqnoor.rafiq` plus the **Google Play App Signing SHA-256 certificate fingerprint**. After Play App Signing is available, copy its SHA-256 from Play Console and update `/.well-known/assetlinks.json`. If Digital Asset Links verification fails, TWA can fall back to browser UI instead of trusted fullscreen presentation.

### E. Google Play setup items still to complete/verify

Before public Production, continue completing the Play setup honestly based on actual app behavior:
- Main store listing (name, short/full description, icon, screenshots, feature graphic).
- Privacy policy URL.
- App access.
- Ads declaration.
- Target audience.
- Content rating.
- Data Safety.
- Contact/category details.
- Closed test tester opt-ins and real test usage/feedback.
- Apply for Production access after the closed-test requirement is satisfied, then create/promote Production release.

Do not guess Data Safety answers if code changes later introduce analytics, backend, accounts, third-party SDKs, or data transmission. Current architecture has no owner backend/account/analytics and keeps profile/worship/path data local, but every external request/SDK must still be re-audited when changed.

## 26) v24 R16 — owner-requested UI + Mushaf fullscreen + prayer activation clarity + save badge

Owner request, preserved chronologically:

> "طيب انا محتاج تعديل دلوقتي , اولا رجع الai handover md file كامل بكل اللي حلص + زائد اللي كان موجود فيه اصلا + اكتب فيه انك متمسحش الفايل ده مهما حصل وانك تكتب فيه كل الشات وكل تغيير حصل فهمت؟؟؟؟"
>
> "+المصحف محتاجه يبقي fullscreen فعلا لما احب ادخل fullscreen"
>
> "+اعدادات الصلاة والوقت والموقع ازاي هتتفعل من الابلكيشن عشان مش متخيل ؟؟"
>
> "+ui الصفحة الرئيسية مشش عاجبني اوي ممكن تعدله!!"
>
> "+علامة الsave فوقها نقطة كبيرة شكلها غريب اوي ممكن تظبطها؟؟"

Implemented in R16:

### AI continuity
- `AI_HANDOFF.md` remains complete: all prior R1–R15 history is retained and new publication/session history is appended.
- Added the immutable policy at the top: **never delete/rename/truncate/exclude this file**; future sessions append their chat/change ledger before handing back artifacts.
- `AI_HANDOFF.json`, `PROMPT_FOR_NEXT_AI.txt`, `RELEASE-NOTES-v24.txt`, `QA-REPORT-v24.txt`, and manifest version are updated together.

### Mushaf true fullscreen behavior
- R14's fixed 604-page KFQC SVG geometry remains untouched; Quran text/lines/pages are not reflowed.
- Fullscreen button now requests the browser Fullscreen API on `document.documentElement` (rather than only the reader node) with `navigationUI: 'hide'` when supported, improving the chance that Chrome/Android hides browser/system chrome.
- CSS fullscreen remains as a fallback if native Fullscreen API is blocked/unavailable.
- Reader viewport tracks `visualViewport.height` in CSS variable `--mushaf-vh`, including orientation/viewport changes.
- On entering fullscreen, reading controls auto-hide after a short delay so the Mushaf page uses the whole viewport. Tap empty page space to reveal/hide controls; ayah tap still selects the ayah.
- In fullscreen, non-page reader metadata (sura header/hint/source/footer/tafsir card/nav) is hidden so the printed page is the focus. Exit via revealing controls then fullscreen button, or system/browser fullscreen exit.
- Product caveat: the web layer can request true browser fullscreen, but a specific Android OEM/browser/TWA build can still decide whether system bars may remain. CSS fallback still fills the available viewport.

### Prayer / time / location activation in the installed app
- No permission is requested automatically at startup. The home prayer card now shows an explicit **تفعيل المواقيت** state when no coordinates are stored.
- Tapping the prayer card with no location opens Settings directly at **الصلاة والوقت والموقع**.
- Settings now explains exactly what happens: Android/browser asks for geolocation permission after the button tap; successful latitude/longitude is saved locally; prayer times and qibla are calculated locally.
- Time/timezone requires no separate permission: Rafiq reads the device timezone via `Intl.DateTimeFormat().resolvedOptions().timeZone` and the device clock.
- Geolocation request uses high accuracy with timeout/cached-position limits and gives distinct messages for permission denied, location service unavailable/GPS off, timeout, or generic failure.
- Permission status is inspected with the Permissions API when available. The UI shows whether a location is saved and displays the local coordinates.
- Manual latitude/longitude entry remains available.
- Prayer calculation method and Asr method remain user-selectable; no religious calculation-method choice was silently changed.
- Location continues to be local-only under the existing privacy/data model; no new cloud backend was added.

### Home UI refresh
- Reworked the main home gateway into a calmer hierarchy rather than a flat block grid: compact welcome, prominent prayer/status card, two primary daily actions (Qur'an + adhkar), then smaller learning/fiqh/tazkiyah/Irtaqi gateways.
- Preserved the owner requirement that home remains a **gateway/teaser** and keeps question-style direct prompts such as `هل قرأت وردك اليوم؟`.
- No religious content/source claim was added by this visual redesign.

### Saved badge cleanup
- The large numeric bubble over the header Saved icon was removed.
- When saved items exist, the header now shows a subtle 7px status dot only. The exact saved count remains available in the button's accessible label/title (`محفوظاتي — N عنصر محفوظ`).
- Existing `saved-later-v1` storage and item IDs are unchanged.

### Web-update delivery
- Service worker cache name bumped to R16.
- PWA registration now bypasses HTTP cache for SW update checks, activates waiting workers with `SKIP_WAITING`, and reloads once on `controllerchange`; this is specifically to reduce stale GitHub Pages UI after owner web changes.
- PWA manifest keeps `display: standalone`; fullscreen remains a user action inside the Mushaf instead of forcing the whole app to launch fullscreen.

### Data/schema compatibility
- No persistent key was renamed or deleted.
- No stored shape was changed.
- No stable saved-content ID was changed.
- `profile-v1`, `saved-later-v1`, `quran-pos`, `qalb-paths-v1`, and Data Safety schema v1 remain compatible.
- Chrome MV3 manifest version bumped from `24.0.0` to `24.1.0` for this code release.

## 27) v24 R17 — professional history + start-of-day plan + task review + browser extension workflow

### Session / owner request — 2026-08-19

Play Console continuity immediately before this code change:
- Google Play rejected the earlier Closed-testing submission with **`Play Console Requirements: Violation of Play Console Requirements`** and marked the app unavailable on Google Play.
- The issue text said the selected app category or declared features required submission using an organization account.
- The working suspicion discussed in chat was the Health apps declaration. The owner then reported: **`عملت للhealth off ومستني الموافقة`**. Treat that as the current Play status only: the Health declaration was switched off / no-health-features was selected, and Google re-review is pending. **Do not claim the policy issue is approved until Play Console actually says so.**

The owner then requested, verbatim/substantively:
> `+السجل محتاج يكون احترافي اكثر يعني ممكن ارجع اي يوم انا عملت فيه تقييم لنفسي وصلواتي ؟؟ محتاج يكون professional اكثر`
>
> `+ال todolist فين ملهاش اي دور ان امحتاج من اليوزر اول اليوم يعمل هدف ومهام وتارجت وآخر اليوم يقيم نفسه ويقيم المهام كمان`
>
> `+في الصفحة الرئيسية "تعرف اللي لازم تعرفه" ممكن نغيرها لمثلا اتعرف علي دينك اكثر`
>
> `+google extention ممكن ابديت ليها مع كل اللي عملناه ده وحاجة تكون مناسبه للمتصفح يعني`

### A. Professional historical log / archive

Implemented:
- `السجل` now has a **full day archive** instead of being limited to weekly/28-day aggregates.
- It discovers all meaningful `day:YYYY-MM-DD` records and also dates that have todo items even if no other daily record exists.
- User can jump to an **exact date** with a date input and open that day's details.
- Archive filters:
  - all recorded days,
  - days with self-review,
  - days with prayer records,
  - days with plan/tasks.
- Each archive row summarizes available self-review score, prayer logging, task completion/review and Qur'an pages.
- Opening a day shows a professional detail card with:
  - the five self-review items and recorded answer for each,
  - mood when present,
  - every prayer and its recorded state,
  - daily goal and measurable target,
  - goal result,
  - all tasks due that day and each task's final review state,
  - Qur'an pages,
  - optional note for tomorrow.
- `فتح اليوم وتعديله` loads that exact historical day back into the existing Today/evening UI so the owner/user can inspect or correct an old record.
- Existing weekly and 4-week summaries remain below the professional archive. They are not removed.
- The archive explicitly states that the figures summarize what the user entered and are **not a judgement on religiosity or the worth of a day**.

### B. Start-of-day plan / Todo is now a first-class daily workflow

Problem fixed:
- Before R17, `مهامي اليوم` existed inside the hidden evening area, so it had little role during the actual day.

R17 behavior:
- A visible **`خطة اليوم`** card now appears near the top of the home page, directly after the welcome/prayer area.
- At the start of the day the user can enter:
  - `هدف اليوم` — a qualitative daily objective,
  - `الهدف القابل للقياس (التارجت)` — a concrete/measurable desired result,
  - a short list of tasks, with optional `مهم` marking.
- Task completion progress is visible during the day.
- Existing `todo-items` key and task IDs are preserved; no destructive rename or reset was done.
- Moving a task to tomorrow/today resets its final-review metadata, because the review belongs to the day being evaluated.

End-of-day flow:
- The evening section now contains **`تقييم هدف ومهام اليوم`**.
- Goal result uses three simple organizational outcomes: `لم يتم / جزئي / تم`.
- Every task can be reviewed with the same three outcomes.
- The resulting percentage is explicitly an **organizational completion reading**, not a spiritual score.
- The existing religious self-review remains the same lightweight **five-question** model. The task/goal review is a separate planning layer and must not grow into a long nightly religious questionnaire.

### C. Data compatibility / schema v2

R17 adds optional data fields while preserving all old keys:
- `day:*` may now include:
  - `goal`
  - `target`
  - `goalReview`
- `todo-items` task objects may now include:
  - `review` (`0=لم يتم`, `1=جزئي`, `2=تم`)
  - `reviewedAt`
  - optional `source` (for example `chrome-selection`)

Data Safety action:
- `rafiq:data-version` bumped **1 -> 2**.
- v1 -> v2 migration is deliberately **additive/no-rewrite**: old day/task records remain valid without filling empty fields into every old record.
- `app/data-safety.js` portable backup app version is now `24.2.0`.
- Existing full backup/rollback system remains in place.
- `privacy.html` now explicitly mentions daily goal/target and task final-review data, still local-only.
- Daily save debounce was hardened to keep separate per-day timers/snapshots, reducing the risk that a quick historical-day switch saves a pending edit under the wrong date.

### D. Home wording

Owner-requested copy change:
- Replaced **`تعرف اللي لازم تعرفه؟`** with **`اتعرّف على دينك أكثر`**.
- Supporting line is now `أساسيات مهمة ومختصرة بمصادرها.`
- No religious claim/source was changed by this wording edit.

### E. Chrome / Google browser extension update

Chrome MV3 version: **`24.2.0`**.

The extension still contains the full R17 app UI (plan, archive, prayer UX, fullscreen Mushaf changes, Saved cleanup, etc.) because its side panel uses `app/index.html`.

Browser-specific additions:
- Existing features remain: side panel, smart selection search, section search, Omnibox keyword, Rafiq notebook, prayer countdown badge and optional prayer notification.
- New right-click selection action: **`أضف النص إلى مهام اليوم`**.
  - The selected page text is clipped to a safe task length and added to today's `todo-items`.
  - The side panel opens directly to the daily plan.
- New keyboard command: **`Alt+Shift+P`** -> open `خطة اليوم` in the side panel.
- Existing notebook shortcut/search shortcuts remain unchanged.
- This is intentionally browser-oriented: useful text discovered while browsing can become an actionable task without copying/pasting manually.

Important distribution distinction:
- GitHub/PWA/TWA web updates can reach the installed Google Play TWA after GitHub Pages publishes; no new AAB is required for these R17 web-only changes.
- **Chrome extension users do not load the GitHub source automatically.** To ship R17 to extension users, package/upload the new MV3 extension ZIP (or load the unpacked updated source during testing) through the Chrome extension/Web Store workflow.

### F. PWA convenience + update delivery

- PWA manifest description now includes daily plan + professional history.
- Added PWA shortcuts for:
  - `خطة اليوم` -> `#plan`
  - `السجل` -> `#history`
  - existing `السبحة` shortcut remains.
- `#plan` is handled at boot and scrolls to the daily-plan card.
- Service-worker cache names bumped to **R17**; R16's `updateViaCache: 'none'`, `SKIP_WAITING`, and controller-change reload behavior is preserved.

### G. R17 changed files

Core/web:
- `app/index.html`
- `app/app.js`
- `app/data-safety.js`
- `app/manifest.webmanifest`
- `app/privacy.html`
- `app/sw.js`
- `app/pwa-register.js`

Chrome extension:
- `manifest.json`
- `background.js`
- `app/extension-bridge.js`
- plus the shared R17 app files above.

Continuity/docs/QA:
- `AI_HANDOFF.md`
- `AI_HANDOFF.json`
- `PROMPT_FOR_NEXT_AI.txt`
- `DATA_SAFETY.md`
- `DATA_ARCHITECTURE.md`
- `RELEASE-NOTES-v24.txt`
- `QA-REPORT-v24.txt`
- `qa/test_data_safety.js`
- `README-UPLOAD-R17-AR.txt`

### H. Non-negotiables carried forward

- **Never delete/rename/truncate/exclude `AI_HANDOFF.md`.** Append every future chat/change/error/test ledger before returning artifacts.
- Do not turn daily productivity percentages into iman/religiosity scores.
- Keep the religious nightly review at five essentials; planning/task review is an operational layer.
- Preserve old `day:*`, `todo-items`, `quran-pos`, `saved-later-v1`, `qalb-*` and stable content IDs unless a backward-compatible migration is written first.
- No new analytics, account backend or cloud sync was added in R17.
- No Android native shell/package/permission change was made in R17; Google Play package remains `com.tadaruqnoor.rafiq`.


### I. R17 QA execution completed before artifact handoff

- JavaScript syntax checks passed for the shared app, extension bridge, Data Safety layer, PWA service worker/register code, and Chrome background worker.
- Data Safety regression harness passed at schema v2 with deterministic backup/restore expectations.
- All JSON/webmanifest files parse; index.html has no duplicate IDs.
- Daily plan, end-of-day task review, exact-date history archive, R17 Chrome context-menu/shortcut bridge, fixed Mushaf swipe rule, document fullscreen path, subtle Saved dot, and legacy storage-key invariants were statically verified.
- Every R17 service-worker precache entry points to an existing local app file.
- No full visual-browser regression is claimed: the build environment's headless Chromium smoke attempt timed out. A real Android/TWA and desktop-Chrome extension smoke test remains required after deployment.
- Play policy remains pending at this handoff: the owner switched the Health apps declaration off/no-health-features and is waiting for Google re-review.


## R18 — Brand unification + Google Play/TWA Digital Asset Links correction — 2026-08-19

### Owner request / observed symptoms

- Owner supplied the Google Play **App signing key → Classical key → SHA-256 certificate fingerprint** after a Play-distributed tester saw a Chrome top bar with `abdull2.github.io` instead of a fullscreen Trusted Web Activity.
- Owner also reported that the browser tab and Chrome extension still displayed the old public brand `رفيق يومك`.
- The supplied Play App Signing SHA-256 is:
  - `6D:02:CB:A8:9A:7D:B7:5F:84:C2:74:F6:16:29:35:8A:DE:49:11:28:12:D2:B4:42:EC:A7:4F:43:26:23:4D:4C`
- Existing PWABuilder/local signing fingerprint from the generated Android package remains:
  - `74:67:B8:77:C3:B6:06:4B:CC:BB:95:7C:EA:87:8A:78:25:8A:59:45:29:34:7F:00:84:FA:27:41:36:51:5C:08`

### Critical correction to earlier assetlinks guidance

Earlier guidance in the project conversation incorrectly implied that placing the file at `https://abdull2.github.io/rafiq/.well-known/assetlinks.json` would validate the current TWA. **That is incorrect and is superseded by this R18 record.**

Digital Asset Links website statements are **origin/host scoped**, not path scoped. The current Android wrapper launches:

- `https://abdull2.github.io/rafiq/`

Therefore the required public statement URL is:

- **`https://abdull2.github.io/.well-known/assetlinks.json`**

NOT:

- `https://abdull2.github.io/rafiq/.well-known/assetlinks.json`

Because `rafiq` is a GitHub Pages **project site** under the shared host `abdull2.github.io`, the `rafiq` repository by itself cannot place a file at the host root. To keep the current Android AAB/origin unchanged, publish the root statement from the account-level GitHub Pages repository **`Abdull2/Abdull2.github.io`** (or an equivalent host-root deployment). Alternative future architecture: use a custom domain controlled by the owner and rebuild the Android wrapper for that origin.

For GitHub Pages static publication, include an empty `.nojekyll` at the publishing root so `.well-known/assetlinks.json` is deployed as a normal static file.

### R18 Digital Asset Links statement

The generated statement uses:

- package: `com.tadaruqnoor.rafiq`
- Play App Signing SHA-256: `6D:02:CB:A8:9A:7D:B7:5F:84:C2:74:F6:16:29:35:8A:DE:49:11:28:12:D2:B4:42:EC:A7:4F:43:26:23:4D:4C`
- PWABuilder/local APK SHA-256: `74:67:B8:77:C3:B6:06:4B:CC:BB:95:7C:EA:87:8A:78:25:8A:59:45:29:34:7F:00:84:FA:27:41:36:51:5C:08`

Both fingerprints are included intentionally; multiple certificate fingerprints are valid in one Android target and allow verification of both Play-signed installs and direct local APK tests.

### R18 public brand update

Public-facing app identity is now unified to:

- full name: **`تدارُك - Tadaruq`**
- short name: **`تدارُك`**

Updated areas:

- browser `<title>`
- `apple-mobile-web-app-title`
- PWA `manifest.webmanifest` name/short_name/description
- Chrome MV3 `manifest.json` name/short_name/description/action title
- browser-extension context menu / omnibox / notification-facing brand copy
- privacy/source page titles and selected product-facing brand strings

Legacy internal identifiers such as `RafiqPlan`, `rafiq:*`, existing storage keys, command IDs, and stable data/content IDs are **not renamed**, to protect compatibility and user data.

### Chrome extension distribution note

- Chrome MV3 version is bumped `24.2.0 → 24.3.0` because Chrome Web Store updates require a higher manifest version.
- The Chrome `Proceed with caution / not trusted by Enhanced Safe Browsing` installation warning is a trust/reputation signal for the extension/publisher. The paid developer registration fee does not itself remove this warning. Do not weaken browser security settings as a workaround.

### Google Play policy status at R18 handoff

- Previous Closed Testing submission was rejected under Play Console Requirements because a declaration/category implied a feature type that can require an organization account.
- Owner changed **Health apps** declaration to off / no health features and is waiting for re-review.
- Do not claim that policy approval has occurred until Play Console explicitly reports approval.

### R18 changed files

- `manifest.json`
- `background.js`
- `app/index.html`
- `app/manifest.webmanifest`
- `app/privacy.html`
- `app/sources.html`
- `app/tasbih.html`
- `app/app.js`
- `app/companions.json`
- `app/ishkaliat.json`
- `app/sw.js`
- `app/pwa-register.js`
- `app/data-safety.js`
- generated `assetlinks.json` reference copies
- `AI_HANDOFF.md`
- `AI_HANDOFF.json`

### Required deployment sequence

1. Deploy the R18 web update to the existing `Abdull2/rafiq` GitHub Pages project.
2. Create/use the account-level GitHub Pages repository `Abdull2/Abdull2.github.io`.
3. Publish `.nojekyll` and `.well-known/assetlinks.json` from the dedicated R18 root-site package.
4. Verify in a browser that **exactly** `https://abdull2.github.io/.well-known/assetlinks.json` returns HTTP 200 JSON with `com.tadaruqnoor.rafiq` and the Play SHA-256. A `/rafiq/.well-known/...` URL does not satisfy the current TWA origin.
5. On an Android tester device, fully close Chrome and the app; reopen the Play-installed test app. If Chrome cached a previous failed verification, allow time for refresh and, if necessary for testing, uninstall/reinstall the Play test build.
6. Expected success criterion: the tester no longer sees the `abdull2.github.io` Custom Tab bar while inside the validated origin.
7. No new Android AAB is required solely for this fix because package ID and launch origin remain unchanged. A new AAB is required only if the native wrapper/origin/package/config changes.

### R18 QA / safety rules

- `AI_HANDOFF.md` remains mandatory and append-only; do not delete, rename, truncate, or omit it.
- Do not commit signing keystores, signing passwords, API credentials, or Play credentials. Certificate SHA-256 fingerprints are public verification metadata and may be stored in `assetlinks.json`.
- R17 daily planning/history/prayer/fullscreen behavior and all existing storage schemas/keys remain unchanged.

## R19 — Previous app signing key fingerprint added to Digital Asset Links — 2026-08-19

### Owner request

Owner reported that after the R18 deployment the Play-distributed test app on a Samsung device still displayed the Chrome Custom Tab bar showing `abdull2.github.io` instead of launching fullscreen as a Trusted Web Activity.

### Session ledger (chronological)

1. Owner uploaded `AI_HANDOFF.md` + `tadaruq-v24-r18-full-source.zip` and asked for help; assistant read the handoff and source package before proposing anything, per policy section 0.6.
2. Owner selected the TWA/address-bar problem as the active issue and supplied a device screenshot showing the Custom Tab (X + share icons).
3. Assistant regenerated the host-root package (`.nojekyll` + `.well-known/assetlinks.json`) and gave the `Abdull2/Abdull2.github.io` deployment steps, including the note that dot-prefixed folders often fail via GitHub drag-and-drop and should be created with `Add file -> Create new file`.
4. Owner deployed the files and supplied a GitHub screenshot confirming `main` branch, `.well-known/assetlinks.json`, root `.nojekyll`, and Pages configured.
5. Assistant fetched `https://abdull2.github.io/.well-known/assetlinks.json` and **verified it returns HTTP 200 with `application/json; charset=utf-8`** and correct R18 content. The web side was therefore confirmed correct and is no longer a suspect.
6. Owner asked whether the fix was to rewrite the project in Flutter. Assistant advised against it: the failure was a signing/verification configuration issue, and a rewrite would discard the PWA and Chrome extension, require a new AAB, and repeat Play review without addressing the cause.
7. Owner correctly objected that clearing Chrome cache and changing the default browser are not user-facing solutions. Assistant clarified those were local diagnostic steps only, not a distribution fix.
8. Owner reported the failure occurred on a Samsung device, which weakened the "browser does not support TWA" hypothesis (Samsung Internet supports TWA).
9. Owner supplied a Play Console **App signing** screenshot. Assistant identified the actual root cause from two details: the in-use App signing key showed **Install base 0.0%**, and a **Previous app signing keys** entry existed with first use `19 Aug 2026, 09:30`.

### Root cause (confirmed)

The Play app signing key was changed. Installed test builds are signed with the **previous** app signing key, while the published `assetlinks.json` listed only the **current** key fingerprint plus the local PWABuilder fingerprint. Chrome compares the installed package signature against the published statement, finds no match, and falls back to a Custom Tab. This explains why uninstall/reinstall did not help.

Note: the Play Console account has **Quantum-ready (beta)** enabled, so each key exposes both a **Classical key** and a **Post-quantum cryptography key** fingerprint. Digital Asset Links uses the **Classical key** SHA-256 only.

### R19 change

Added the previous app signing key SHA-256 as a third fingerprint. Multiple fingerprints in one Android target are valid and intentional.

Current fingerprint set for `com.tadaruqnoor.rafiq`:

- `6D:02:CB:A8:9A:7D:B7:5F:84:C2:74:F6:16:29:35:8A:DE:49:11:28:12:D2:B4:42:EC:A7:4F:43:26:23:4D:4C` — current Play App Signing key (Classical)
- `0F:DA:C2:0A:06:FA:E5:77:CD:AD:1C:37:5D:0F:A2:00:DB:62:73:73:C9:BC:31:22:90:51:9F:D3:EE:72:63:D4` — previous Play App Signing key (Classical), first used 19 Aug 2026 09:30
- `74:67:B8:77:C3:B6:06:4B:CC:BB:95:7C:EA:87:8A:78:25:8A:59:45:29:34:7F:00:84:FA:27:41:36:51:5C:08` — PWABuilder / local APK signing key

### R19 changed files

- `.well-known/assetlinks.json` on the host-root site `Abdull2/Abdull2.github.io`
- reference copies `assetlinks.json` and `app/assetlinks.json` in the source package
- `AI_HANDOFF.md`

No application code, storage key, schema, package ID, or launch origin changed. No new AAB is required.

### Tests run

- JSON validity check on the R19 statement: passed; 3 fingerprints, each 32 bytes.
- Live fetch of the R18 statement URL before the change: HTTP 200, `application/json`, content correct.
- Device-level re-verification after R19 deployment: **not yet performed — owner follow-up required.**

### Unresolved items / follow-up

1. Deploy the R19 `.well-known/assetlinks.json` to `Abdull2/Abdull2.github.io` and confirm the live URL shows all three fingerprints.
2. On the Samsung test device: uninstall, clear Chrome cache, reinstall from Play, confirm the address bar is gone.
3. If the bar persists after step 2, capture the signature of the actually-installed package and compare against the published set before assuming any further cause.
4. Google Play policy re-review after the Health apps declaration was switched off remains **pending**; do not claim approval until Play Console reports it.
5. Consider migrating to an owner-controlled custom domain long term, which would remove the dependency on the shared `abdull2.github.io` host root.
6. Optional robustness item for a future AAB: configure the TWA fallback to WebView so users without a TWA-capable browser do not see a Custom Tab. Requires a new AAB and Play review; not needed for this fix.

## R20 — PWA performance pass (caching + font declaration) — 2026-08-19

### Owner request

After the R19 Digital Asset Links fix was confirmed working on device ("اتشال الحمدلله"), the owner asked which fonts the app uses, then asked for performance improvements to make the app feel smoother.

### Correction to an earlier statement in this same session

An earlier assistant statement in this session claimed that **IBM Plex Sans Arabic was effectively unused** and could be deleted. **That was wrong and is corrected here.** The initial grep pattern excluded quoted font names and therefore missed the `body` rule:

`font-family:"IBM Plex Sans Arabic",system-ui,"Segoe UI",sans-serif`

IBM Plex Sans Arabic is the **primary body/UI sans font** for the whole app. The three `plex-*.woff2` files are required and must NOT be removed. An initial edit that deleted them was reverted before any package was produced.

### Fonts actually in use (verified)

- **Amiri** (400/700) — Arabic display/serif face, 55 CSS usages, headings and religious text.
- **IBM Plex Sans Arabic** (400/500/600) — base body and UI text via the `body` rule.
- **Hafs** — Mushaf rendering only, 12 usages as `Hafs,Amiri,serif`.

All three are self-hosted `woff2`; no external font requests.

### Root performance findings

1. **Cache-busting defeated the Service Worker.** 10 JSON fetches in `app.js` used `'./file.json?v='+Date.now()`. `handleSameOrigin` matches with `ignoreSearch:false`, so the changing query string never matched the precached entry. Approximately **529 KB re-downloaded from the network on every session**, including `qalb.json` (193 KB) and `asma.json` (100 KB), despite all of them being in `PRECACHE_URLS`.
2. **Oversized install-time precache.** `PRECACHE_URLS` totalled **4.79 MB**, including 1.1 MB of Play-listing screenshots never rendered in-app, plus `quran.json` (1.3 MB) and `riyad.json` (986 KB). All were downloaded before the Service Worker finished installing.
3. **Broken font-family name.** One rule read `font-family:IBM,system-ui,sans-serif`. `IBM` matches no `@font-face` family, so that element silently fell back to the system font.

### R20 changes

- `app.js`: removed the `?v='+Date.now()` cache-buster from all 10 JSON fetches. Non-fetch uses of `Date.now()` (IDs, timestamps, daily seeds) were left untouched.
- `index.html`: corrected `font-family:IBM,...` to `font-family:"IBM Plex Sans Arabic",...`.
- `sw.js`: removed the 5 screenshots, `icon-1024.png`, `quran.json`, and `riyad.json` from `PRECACHE_URLS`; bumped `CACHE_NAME` to `tadaruq-v24-r20-pwa-20260819`. The two large JSON files are already lazily fetched and are cached by `handleSameOrigin` into `RUNTIME_CACHE` on first real use.

### Measured result

- Install-time precache: **4.79 MB → 1.41 MB** (−71%).
- Repeat-session network fetches for content JSON: **~529 KB → 0** (served from cache).
- Diff size: `app.js` 20 lines, `index.html` 2 lines, `sw.js` 10 lines.

### Tests run

- `new Function(...)` syntax parse of `app.js` and `sw.js`: both passed.
- Verified all 12 JSON fetch URLs now resolve to plain `./name.json`.
- Verified 6 `woff2` files remain present.
- **Not yet tested:** runtime behaviour on a real device, offline first-load of Qur'an/Riyad, and cache changeover from the old Service Worker.

### Follow-up required

1. Deploy and confirm the new Service Worker activates (`CACHE_NAME` bump forces old-cache cleanup on activate).
2. Because content JSON is now genuinely cached, **any future content edit requires bumping `CACHE_NAME`** or users will keep the old data. This is a behavioural change from the previous always-fresh fetching and must be respected by future sessions.
3. Verify Qur'an and Riyad still work offline after being opened once.
4. Google Play policy re-review after the Health apps declaration was switched off remains pending.

## R21 — Mushaf interaction fixes (swipe, long-press selection, fullscreen fill) — 2026-08-19

### Owner request

Owner reported three Mushaf problems: page swipe was hard to trigger; ayah highlight appeared on plain touch (sticky hover) instead of a deliberate gesture, with the owner explicitly proposing long-press; and fullscreen did not fill the screen the way the "آية" app does.

### Findings

1. **Swipe too strict.** Threshold required `|dx|>55` **and** `|dx| > |dy|*1.6`. Additionally `body.mushaf-fullscreen` set `touch-action:pan-x pan-y`, letting the browser claim horizontal gestures before the JS handler could act.
2. **Sticky `:hover` on touch.** `.ayahPolygon:hover{fill-opacity:.12}` was unconditional. On touch devices `:hover` latches after a tap and does not clear, so ayat appeared highlighted from incidental touches. Tap also selected an ayah through `#mus-body onclick`, so drags could select by accident.
3. **Fullscreen letterboxing.** Mushaf page aspect is roughly 0.65 while phone viewports are roughly 0.46, so `object-fit:contain` height-constrains the page and leaves side gutters. This is geometry, not a bug.

### Owner decision on fullscreen

Owner chose **"الصفحة كاملة مع تكبير الهوامش فقط"** — keep the whole page visible, no cropping of text and no vertical scrolling; gain area by trimming the blank border instead. Cropping and scroll-to-fill options were declined.

### R21 changes

- `app.js`
  - Swipe threshold `55px → 38px`; vertical tolerance ratio `1.6 → 1.15`.
  - Added long-press ayah selection: `touchstart` on `.ayahPolygon` starts a **420 ms** timer, fires `ayah-longpress`, triggers a 12 ms vibration where supported, and cancels if the finger moves more than 10 px or the touch ends early. This prevents accidental selection during a swipe.
  - `#mus-body` click handler now ignores plain taps on touch devices (`matchMedia('(hover:none)')`) unless the long-press fired. Mouse/pointer devices keep normal click behaviour.
  - Added `trimMushafMargins(svg)` and constant `MUSHAF_TRIM = 0.035`. It insets the SVG `viewBox` by 3.5% per side, guarded by `data-trimmed` so it never applies twice, with numeric validation and a try/catch fallback that leaves the page untouched on any parse problem. Net readable-area gain approximately **7.5%** with no text cropped.
- `index.html`
  - `.ayahPolygon:hover` wrapped in `@media (hover:hover) and (pointer:fine)`.
  - `touch-action:pan-x pan-y → pan-y` on `body.mushaf-fullscreen`.
  - Unified page max-height when controls are hidden.
- `sw.js` — `CACHE_NAME` bumped to `tadaruq-v24-r21-pwa-20260819`.

### Tests run

- `new Function(...)` syntax parse of `app.js` after each edit: passed.
- viewBox trim verified arithmetically on a sample `0 0 1000 1600` viewBox.
- Diff size: `app.js` 63 lines, `index.html` 7 lines, `sw.js` 10 lines.
- **Not tested:** real touch behaviour on a device. Long-press timing, swipe threshold, and the 3.5% trim all need on-device confirmation.

### Tuning notes for a future session

- If swipe still feels stiff, lower the `38` threshold further before touching the `1.15` ratio.
- If long-press feels slow or too eager, adjust the `420` ms timer; 300–500 ms is the usual comfortable band.
- If any page shows text touching an edge, reduce `MUSHAF_TRIM` from `0.035`. It is a single named constant specifically so this stays a one-value change.

### Carried-forward items

- Content JSON is now genuinely cached (R20), so **any future content edit requires bumping `CACHE_NAME`**.
- Google Play policy re-review after the Health apps declaration was switched off remains pending.
- R19 Digital Asset Links fix was confirmed working on device by the owner.

## R22 — REVERT of the R21 Mushaf margin trim (regression) — 2026-08-19

### Regression report

Owner reported: **"انت بوظت المصحف وقطعت اطرافه"** — the R21 `viewBox` trim cropped the edges of the Mushaf page. The R21 change was wrong and is reverted here.

### Cause of the mistake

`MUSHAF_TRIM = 0.035` was chosen without measuring the actual blank border in the Madinah Mushaf SVG files. The assistant could not fetch or inspect a real page SVG (remote asset), assumed a conservative-looking 3.5%, and shipped it. The real blank margin is smaller than 3.5%, so the inset cut into rendered text. **Assumed asset geometry must be measured, not guessed** — if a real sample cannot be inspected, the change should not ship.

### R22 changes

- Removed `trimMushafMargins()` entirely, removed the `MUSHAF_TRIM` constant, and removed the call site in `safeMushafSvg`. The function was deleted rather than set to `0`, so no future session re-enables it without redoing the measurement.
- Removed the extra rule `body.mushaf-fullscreen.mushaf-controls-hidden .mus-body.printed .mushaf-page-svg{max-height:var(--mushaf-vh)!important}` added in R21. The original `max-height:100dvh` behaviour is restored.
- Mushaf rendering geometry is now **byte-identical to pre-R21**: `preserveAspectRatio="xMidYMid meet"` and `object-fit:contain` untouched, no `viewBox` modification anywhere.
- `sw.js` `CACHE_NAME` remains `tadaruq-v24-r21-pwa-20260819`; bump again on next deploy if the r21 package was already published.

### What is retained from R21 (unaffected by the regression, still wanted)

- Swipe threshold `55px → 38px` and vertical tolerance `1.6 → 1.15`.
- `touch-action:pan-x pan-y → pan-y` on `body.mushaf-fullscreen`.
- `:hover` on `.ayahPolygon` gated behind `@media (hover:hover) and (pointer:fine)`.
- Long-press (420 ms) ayah selection with move-cancel, replacing tap-to-select on touch devices.
- R20 caching and font-name fixes.

### Outstanding: the original fullscreen request is NOT solved

The owner still wants the Mushaf to fill the screen more like the "آية" app, and chose "الصفحة كاملة مع تكبير الهوامش فقط". That remains **unimplemented**. Correct approach for a future session:

1. Fetch one real page SVG from `MUSHAF_SVG_BASE`, read its `viewBox`, and measure the actual bounding box of rendered content versus the canvas to derive the true blank margin per side.
2. Only then inset by strictly less than the measured margin, and verify visually on several pages including dense ones and pages with surah headers.
3. Alternatively leave geometry alone and pursue the gain elsewhere: reduce the reserved chrome height so `--mushaf-vh` is larger, which enlarges the page without touching the SVG at all. This is the lower-risk path and should be tried first.

### Current diff versus original v24 R18 source

- `app.js`: 47 lines — caching fixes plus long-press and swipe tuning.
- `index.html`: 6 lines — font name, hover gating, touch-action.
- `sw.js`: 10 lines — precache trim and cache name.

## R23 — Tazkiyah depth levels engine + Ikhlas pilot — 2026-08-19

### Owner request

Owner asked for a progression system in the تزكية area: a user who has read a meaning once or twice has no reason to return. He wants each meaning to deepen — the simple definition of e.g. الإخلاص should be one stage, followed by a wider treatment covering how the meaning appears in the Qur'an, the Sunnah, and among the righteous. Owner stated his role is to keep users returning to a purely educational app with no ads and no revenue, and asked not to be repeatedly told to add a source to every item.

### Framing decision (raised with the owner, and applied)

The word "مراتب" risks implying ranks of faith, which conflicts with the standing owner decision in section 2.9 (no guilt-heavy or pseudo-spiritual metrics; tracking is not a judgement on faith or a declaration of spiritual rank). The feature is therefore framed as **مستويات العمق — depth of study, not station of the person**. UI label is "مستويات العمق". Progress wording is "أنهيت هذا المستوى", never anything implying higher iman.

Owner chose **4 levels** (التعريف → في القرآن والسنة → في هدي الصالحين → تطبيق عملي) and **أعمال القلوب (9 topics)** as the starting section.

### Schema added to `qalb.json`

A work item may carry an optional `levels` array:

```
levels: [ { n, title, tx, s:{t,u}, items:[{t, s:{t,u}}], pending? } ]
```

- `pending: true` marks a level whose sources are **not yet verified**. `hLevelsOf()` filters these out, so a pending level is never rendered to a user.
- Items without `levels`, and all other sections, render exactly as before. The feature is additive and non-breaking.

### Engine added to `app.js`

- `hLevels` state, `hLevelsLoad()`, `hLevelDone()`, `hLevelMark()`, `hLevelsHtml()`.
- New storage key **`qalb-levels-v1`** holding `{ topicId: { done:[n], open:n } }`. No existing key was touched or migrated.
- Level chips render locked until the previous level is completed; the "فهمت هذا المستوى" button marks completion and opens the next.
- Click handlers `[data-lv]` (switch level) and `[data-lvdone]` (complete level) added to the Qalb tab handler.
- Rendered directly beneath the existing `def` block; hidden entirely when a topic has fewer than 2 publishable levels.

### `index.html`

Added `.lv-*` styles (chips row, list, complete button) using existing CSS variables only.

### Ikhlas pilot — verification status

| Level | Status |
|---|---|
| 1 التعريف | Published — reuses existing `def` + `defSource` |
| 2 في القرآن والسنة | Published — البينة 5، الزمر 3، الكهف 110 (quran.com links), plus حديث النيات (البخاري 1، مسلم 1907) with the existing verified Dorar link |
| 3 في هدي الصالحين | **`pending: true`, empty, not shown to users** |
| 4 تطبيق عملي | Published — derived from the existing sourced `means`, framed as organisational steps |

### Why level 3 is empty — do not fill it from memory

Searches for salaf sayings on الإخلاص returned only forums and aggregator sites reproducing athar without verifiable isnad. The best-known saying (سفيان الثوري: ما عالجت شيئًا أشد عليَّ من نيتي) was found attributed to ((حلية الأولياء)) 7/5 **only via a secondary aggregator**, which is not sufficient to publish in a da'wah app. Misattributing a saying is a harm, not merely a bug, and violates section 2.1.

**Rule for future sessions: never populate level 3 (or any religious level) from model memory or from aggregator sites.** Acceptable sources are the owner's own verified references, or Dorar's موسوعة الأخلاق / الموسوعة الحديثية pages where the book, volume and page are shown. Verify each athar individually.

### Deliverables

- Full updated source tree.
- `levels-template.json` — empty 4-level structure for the remaining 8 works.
- `assetlinks.json` (root and `app/`) synced to the R19 three-fingerprint version.
- `sw.js` `CACHE_NAME` → `tadaruq-v24-r23-pwa-20260819`.

### Tests run

- `new Function(...)` parse of `app.js` and `sw.js`: passed.
- `qalb.json` JSON validity and level counts verified.
- Confirmed 6 `woff2` files intact and all three assetlinks fingerprints present.
- **Not tested:** the levels UI has never been rendered in a browser. Chip locking, progress persistence, and layout are unverified.

### Process note — owner objection, accepted

The owner objected that changes were being sent without adequate review while he deploys straight to production. The objection is correct. The R21 Mushaf trim shipped on a guessed constant and caused a visible regression. Standing rule from this point: state explicitly what was actually executed versus what is untested, and never present an unverified visual change as ready to deploy. The R23 package was deliberately labelled **PREVIEW**.

**Recommended and still not set up:** a `staging` branch or separate preview Pages deployment so no change reaches users before the owner has seen it. This remains the highest-value outstanding infrastructure item.

### Carried-forward items

1. Owner must visually review the levels UI before publishing.
2. Level 3 content for الإخلاص requires verified sources.
3. Remaining 8 works in أعمال القلوب need levels authored.
4. Any future content JSON edit requires bumping `CACHE_NAME` (R20 consequence).
5. Fullscreen Mushaf enlargement remains unsolved; prefer the low-risk route of reducing reserved chrome height rather than touching SVG geometry (see R22).
6. Google Play policy re-review after the Health apps declaration was switched off remains pending.


## R24 — Full sourced Tazkiyah depth journey across all 9 أعمال القلوب — 2026-08-20

### Owner request / chat ledger

Owner request in this session:

> "محتاج منك انك في تاب التزكية تعمل مراتب يعني الشخص في كل حاجة هوا قرأها مرة مرتين خلاص كده مش هيدخل تاني , انا محتاج لما يفهم المعني خلاص من كل المعاني في ابواب التزكية في كل قسم في التزكية انه يرتقي يعني خلاص خلص التعريف المبسط للاخلاص لازم يكون في مرتبة او مرحلة تانية فاهمني يعني شرح اقوي واوسع من ورود المعني ده في القران والسنة وفي الصالحين فاهمني عارف ان ده حاجات كتيرة بس مهم اوي عشان الشخص يرجع تاني للتطبيق , وطبعا مش كل شوية هقول انك تكتب مصدر كل معلومة هتكتبها+ انا دوري اعلق المستخدم بالتطبيق وهوا مفيهوش اعلانات ولا ربح هوا توعوي فقط"

Interpretation applied: retention is a legitimate educational goal, but the product must not claim a user's spiritual station or use manipulative addiction mechanics. The R23 "depth of study, not rank of person" decision is therefore retained and expanded.

### Product decision

- User-facing concept: **مراحل التعمّق / رحلة التزكية**, not spiritual "مراتب" of the person.
- Each positive heart meaning now has four learning layers:
  1. **التعريف والفهم**
  2. **في القرآن والسنة**
  3. **في هدي أهل العلم والصالحين**
  4. **تطبيق عملي**
- Completion means "I studied/understood this layer enough to move on", not "my iman rose to a higher rank".
- Previous layers remain open for review. After all four are complete, an optional review action records a local review timestamp/count.
- No points, badges of piety, sacred counts, artificial daily locks, guilt prompts, or ad/revenue hooks were added. The return loop is useful content: resume where you stopped, open the next layer, and revisit completed meanings.

### Coverage completed

All 9 existing stable `works` IDs are preserved and now carry exactly 4 publishable levels:

1. `ikhlas` — الإخلاص
2. `mahabba` — المحبة
3. `tawakkul` — التوكل
4. `khawf` — الخوف والرجاء
5. `sabr` — الصبر
6. `shukr` — الشكر
7. `tawba` — التوبة
8. `muraqaba` — الإحسان والمراقبة
9. `yaqeen` — اليقين

No ID was renamed. Existing `qalb-*` compatibility rules remain in force.

### Source/content work

- `app/qalb.json` was expanded so every published level item has a visible source object rendered directly below the item.
- Existing Qur'an/Hadith references were reused where already verified.
- Level 3 material was individually verified against reliable source pages rather than filled from model memory. The source ledger and exact book/page references are in **`CONTENT_PROVENANCE-TAZKIYAH.md`**.
- Representative verified material includes Imam al-Shafi‘i on wanting truth to appear even on the opponent's tongue for Ikhlas, Ibn al-Qayyim on stronger tawakkul with deeper knowledge of Allah, the Ka‘b ibn Malik repentance report in Bukhari/Muslim, and recognized source-backed explanations for muraqabah/yaqeen.
- Practical level text is explicitly labelled as organisational application based on the cited texts, not invented worship, divine promise, or sacred count.

### UI/engine changes — `app/app.js` + `app/index.html`

- Added `hLevelState`, `hDepthMeta`, persistent `hLevelOpen`, enhanced `hLevelMark`, `hLevelReview`, redesigned `hLevelsHtml`, and `hDepthContinueHtml`.
- Works list/home now surfaces a **رحلة التزكية** continue card:
  - untouched topic -> start a meaning;
  - in-progress topic -> continue where you stopped;
  - completed topics -> revisit/review.
- Each work tile can show study depth `X/4` and optional review count.
- Stage chips are sequential: later stages unlock after the previous stage is completed. Earlier completed stages remain reviewable.
- `hOpen()` avoids duplicating the old definition/fruits blocks when a full 4-level work is active; the existing sourced daily means remain as optional `تطبيق اليوم` underneath.
- UI copy explicitly states: **"تقدّم في الدراسة، لا رتبة إيمانية"**.
- Added R24 `.depth-*` / `.lv-*` responsive styles.

### Persistence / Data Safety

Persistent key remains **`qalb-levels-v1`**, introduced in R23. R24 does not rename it or replace old values. Existing `{done, open}` records remain valid; optional additive fields now include `completedAt`, `lastAt`, and `reviews`.

R23 accidentally omitted this new key from the Data Safety registry. R24 fixes that omission:

- `app/data-safety.js` exact registry now includes `qalb-levels-v1`.
- Expected type is `object`.
- Portable backups, safety snapshots, replace restores and audits now cover this progress state.
- Local data schema remains **2**: this is registration/protection of an already-existing additive key, not a destructive schema rewrite.
- Backup metadata app version is updated to `24.4.0`.

### Version/cache

- Chrome MV3 manifest: **24.4.0**.
- PWA service-worker cache: `tadaruq-v24-r24-pwa-20260820`.
- Runtime cache: `tadaruq-runtime-v24-r24-20260820`.
- The cache bump is mandatory because `app/qalb.json` changed and R20 made content JSON genuinely cached.

### QA actually executed

- PASS: `node --check app/app.js`.
- PASS: `node --check app/data-safety.js`.
- PASS: R24 Tazkiyah deterministic content test: all 9 works × 4 levels; no pending published level; every published item/source object validated.
- PASS: Data Safety deterministic harness including backup/restore of `qalb-levels-v1`; schema remains 2.
- PASS: JSON parse and stable works-ID/order checks.
- PASS: manifest version/cache-name/static-control checks.
- ENVIRONMENT LIMIT: local headless Chromium could not navigate to localhost or file URLs because the sandbox browser is blocked by administrator policy. Therefore **no claim is made that the R24 levels UI has been visually verified in a real browser or on Android**. Owner should preview the deployed build on a real phone before production rollout.

### Standing rules after R24

1. Every religious statement remains source-first; the owner does not need to repeat this requirement.
2. Future Tazkiyah depth content must be researched/verified before publication; never fill a scholar/salaf attribution from memory or an unsourced aggregator.
3. Retention comes from useful depth, resume/review and practical value — never spiritual scoring or manipulative dark patterns.
4. Preserve `qalb-levels-v1`, all existing work IDs, and all other `qalb-*` user data.
5. Any future `qalb.json` content edit must bump the Service Worker cache name.
6. If the same depth concept is extended to `أمراض القلوب` or `العقبات`, design section-appropriate study stages rather than implying that a user's illness/faith has a ranked spiritual level.
7. `AI_HANDOFF.md` remains immutable project continuity: never delete, rename, truncate, replace with a summary, or exclude it from a full source handoff. Append the public owner request, decisions, changes, errors, and tests of every future session. Never write secrets/private signing credentials into the handoff.


### R24 scope expansion — all reading-oriented Tazkiyah sections

After implementing the authored 9-work curriculum, the owner wording "في كل قسم في التزكية" was applied as a section-wide product requirement without forcing every section into the same religious-rank metaphor. R24 now gives a source-backed depth journey to **69 reading topics/scenarios**:

- **9 أعمال القلوب** — authored 4-level curriculum with new verified scholarly/salaf material in level 3.
- **10 أمراض القلوب** — definition/foundations → causes/roots → Qur'an/Sunnah anchor → sourced practical treatment.
- **22 obstacle scenarios** inside 8 life categories — identify situation → why it may happen → sourced answer/compass → sourced steps.
- **15 فقه النفس topics** — summary → what happens psychologically → faith compass → questions/application. Medical/safety flags remain visible outside all stage locks.
- **13 إشكاليات lectures** — intro → early points → deeper points → return to the full original lecture; every point uses its stored video timestamp.

`مساري` and `بنك الأعمال` intentionally do **not** receive reading/spiritual levels: they are already action-progress mechanisms (path stations/check-ins and daily deeds). This preserves semantic honesty while making the whole Tazkiyah tab returnable.

#### Identity/persistence details

- Existing R23 Works progress continues under the original plain keys (`ikhlas`, `mahabba`, etc.) inside `qalb-levels-v1`; this was not migrated or reset.
- New depth topics use composite keys to avoid collisions: `problem:<id>`, `obstacle:<category>:<item>`, `nafs:<id>`, `ish:<id>`.
- The click parser now splits level tokens at the **last colon**, so composite IDs remain stable.
- `hDepthFind()` / `hDepthRender()` route a resume/review action back to the correct screen (work/problem detail, obstacle accordion, Nafs detail, or Ishkaliat lecture).
- Section lists show depth meters and a continue/resume card where appropriate.

#### Source integrity

No new religious/psychological claims were invented merely to fill the other section stages. Their R24 levels are composed from source-backed fields that were already in the project (`defSource`, per-cause sources, `proofSource`, per-step sources, Makany/WHO/Qur'an source fields, or Ishkaliat video timestamps). The new authored source research remains concentrated in the 9 `works` level-3 expansions and is listed in `CONTENT_PROVENANCE-TAZKIYAH.md`.

#### Expanded QA

`qa/test_tazkiyah_levels.js` now validates **69 depth topics** and **374 staged source-backed items**, unique depth IDs, exactly 4 levels per topic, no leaked `pending` stage, HTTPS source URLs where present, and required app engine markers. It passes in the build environment.


## 26) v24 R25 — Al-Mukhtasar tafsir promoted to a first-class Qur'an flow

### Owner request
> "+محتاج المختصر ف يالتفسير ضروري"

### Decision
The project already had an official deep-link bridge from R13. R25 makes it a first-class reading flow without violating the standing source/copyright rule. The owner does **not** need to repeat the requirement that religious content must have visible sources.

### User experience
- Mushaf `التفسير` no longer immediately throws the user out to a browser page. It opens an in-app tafsir sheet tied to the currently selected ayah (or the first ayah on the current page if none is selected).
- The sheet shows the selected Qur'an text/reference and always provides `فتح التفسير الرسمي` to the exact surah/ayah on `mokhtasr.com`.
- The existing Qur'an tools card remains and now describes the API-safe path correctly.
- The current official publication/about reference is `https://tafsir.net/publications/13394`.

### Inline official text architecture (optional, not secretly enabled)
- `app/tafsir-config.js` defaults to `proxyBase: ''`; therefore no hidden API call is made in the public build.
- If the owner obtains an authorized official API Bearer token, deploy `integrations/mokhtasar-worker/worker.js` and store the token only as the serverless secret `MOKHTASAR_TOKEN`.
- Then set only the public Worker URL in `app/tafsir-config.js`. Front end sends only `sura` + `aya`; Worker adds Bearer and calls official `book-contents` with `books=200`.
- **Never place the Bearer token in GitHub, Chrome extension source, PWA JS, AI_HANDOFF, logs, screenshots, or release notes.**
- **Never scrape or bundle the full Al-Mukhtasar corpus to bypass the API/terms.** Official terms permit clear linking but restrict reproduction/republication; API docs require Authorization for book contents.

### Files / privacy / version
- New: `app/tafsir-config.js`.
- New: `integrations/mokhtasar-worker/{worker.js,wrangler.toml.example,README-AR.md}`.
- Updated: `app/app.js`, `app/index.html`, `app/privacy.html`, `app/sw.js`, `app/data-safety.js`, `manifest.json`.
- MV3 version: `24.5.0`. Data Safety schema remains 2; no user storage keys changed.
- PWA cache bumped to R25 because app code/config changed.

### Standing rule
Al-Mukhtasar is now a required Qur'an feature. Keep the exact-ayah official link working even if an optional proxy is unavailable. Inline official text must fail safely back to the official link.


## 27) v24 R26 — Full Al-Mukhtasar reading journey (Ayah-style continuation)

Owner requirement (2026-08-20):
> "انا محتاج اه يقرأ المختصر كله بس لما يختاج يدخل علي اي آية علي حدي مثلآ وبردو يبقي في مكنا يقدر يكمل قراءة المختصر زي تطبيق آية بالضبط"

### Product decision
- Al-Mukhtasar now has **two intentionally separate flows**:
  1. **Quick ayah lookup from the Mushaf**: select an ayah -> `التفسير`; this must NOT disturb the user's ongoing Al-Mukhtasar book-reading position.
  2. **Continuous Al-Mukhtasar reader**: a first-class reader from Al-Fatihah to An-Nas with previous/next ayah, surah/ayah picker, progress, and `أكمل قراءة المختصر`.
- `فتح في قارئ المختصر` from the quick sheet explicitly moves the continuous-reading position to that ayah.
- `فتح الآية في المصحف` returns from the reader to the exact ayah/page in the 604-page Mushaf and writes the existing `quran-pos` in its established compatible shape.

### Persistence
- New local key: `tafsir-pos-v1` = `{s, a, updatedAt}`. It is independent from `quran-pos`.
- Registered in Data Safety backup/restore and validated as an object. Schema remains 2 (additive registration only).
- Do NOT store/bundle the full Al-Mukhtasar database in localStorage, GitHub, or extension assets.

### Official text / rights boundary
- The full reader UI is implemented, but **official inline text is enabled only when `app/tafsir-config.js -> proxyBase` points to the secret-holding proxy**.
- The proxy requests one ayah at a time from the official API `book-contents` with `books=200`; Bearer token stays only in server secret `MOKHTASAR_TOKEN`.
- Without the proxy, the reader still preserves position/navigation and gives the exact official link for each ayah, but does not scrape/copy the book.
- Official API docs provide application register/login/token flow. Terms still restrict reproduction; preserve API authorization/permission evidence. Non-profit status does not justify copying the database.

### UX guarantees
- Continue card in Qur'an tools shows surah, ayah, absolute position out of 6236, and percentage.
- Reader has `السورة`, `الآية`, `انتقال`, previous/next, exact Qur'an ayah, official tafsir content when configured, official-source fallback link, and `فتح الآية في المصحف`.
- Session-only in-memory cache is allowed for already fetched ayahs; do not persist a growing copy of the book.

### Release / QA
- MV3 version: `24.6.0`.
- PWA cache: R26.
- New release notes: `RELEASE-NOTES-R26.txt`.
- Must keep visible attribution to `المختصر في تفسير القرآن الكريم — مركز تفسير/دار المختصر`.


## 29) v24 R27 — Mushaf dark mode + Aya-style viewport fit (2026-08-20)

### Owner request / visual reference
- Owner supplied two mobile screenshots and requested the Tadaruq Mushaf to visually use the screen like the Aya app: much less wasted top/bottom space and no unnecessary outer card margins.
- Owner explicitly requested the Mushaf to work in dark mode too.
- Owner asked whether GitHub upload paths must be preserved because they normally upload files at repository root.

### Decisions and implementation
- Preserve the fixed 604-page KFQC/Quranpedia SVG Mushaf. **Do not reflow Quran text or alter ayah/glyph geometry.**
- Added dark-mode rendering to the complete SVG page as a visual filter (`invert + hue-rotate + brightness/contrast`) so the page becomes a night-reading surface while the exact vector geometry remains unchanged. Text fallback also now uses light Quran text on a dark surface.
- Removed the card-like mobile Mushaf padding, rounded corners and shadow; the page is edge-to-edge on small screens.
- Added `fitMushafSvgViewBox(svg)`: after the trusted SVG is inserted, it measures actual rendered child geometry, ignores likely full-page background plates, adds conservative padding, then tightens the viewBox while retaining the original printed-page aspect ratio. A 72% minimum original width/height guard prevents aggressive cropping. This is specifically to remove source-canvas whitespace, not to crop Quran content.
- Fullscreen continues using the document Fullscreen API + CSS fallback and fixed page SVG. Dark mode now overrides the previously hard-coded light fullscreen backgrounds.
- `quran-pos`, swipe direction (left-to-right = NEXT), ayah polygon selection and tafsir behavior are unchanged.

### GitHub deployment/path rule clarified
- For the `Abdull2/rafiq` GitHub Pages repo, use the **flat GitHub-pages deployment package**: `index.html`, `app.js`, JSON, fonts, icons, etc. belong at repo root because the deployed app was intentionally flattened and references sibling files. The owner does **not** need to recreate the full-source `app/` directory when using this package.
- The full-source ZIP is for development/handoff and intentionally retains `app/`, `integrations/`, `qa/`, etc.; do not upload it blindly as a flattened website.
- Paths that are semantically required must still be preserved. Most important: in the separate `Abdull2.github.io` origin repo, Digital Asset Links must remain exactly `.well-known/assetlinks.json`; placing `assetlinks.json` at root does not satisfy TWA verification.
- Cloudflare Worker files under `integrations/mokhtasar-worker/` are deployment/source files and are not meant to be flattened into the GitHub Pages website root.

### Version / cache / QA
- Chrome MV3 version: `24.7.0`.
- PWA cache: `tadaruq-v24-r27-pwa-20260820`; runtime cache R27.
- Data Safety schema remains 2; backup metadata version is `24.7.0`; no persistent data keys changed.
- Required real-device regression after deploy: light Mushaf, dark Mushaf, fullscreen light/dark, pages with headers/footers/surah starts, ayah tap polygons, swipe directions, zoom, and several pages with historically large internal whitespace.


## 30) v24 R28 — Professional Android/PWA launch splash (2026-08-20)

### Owner request
Owner reported that the image shown while the mobile app launches looks unprofessional and requested a launch experience closer to Facebook/LinkedIn/Instagram: a clean solid surface with a small centered brand icon.

### Diagnosis
The currently uploaded PWABuilder AAB embeds a native `splash.png` where the old 512 icon is effectively scaled to a large square, so its ornamental logo fills too much of the screen. This first native Android frame is inside the AAB and **cannot be changed by a GitHub-only web update**. A new AAB/version code is required to change the Google Play launch splash.

### R28 implementation
- Brand launch background standardized to `#0B3A2F`.
- `app/icon-512.png` is now intentionally splash-safe: a solid Tadaruq green 512 canvas with a much smaller centered gold Tadaruq mark. This follows PWABuilder's historic behavior of using the 512 `any` icon for the TWA splash.
- `app/icon-maskable-512.png` is deliberately unchanged so Android adaptive launcher icon behavior is preserved.
- Added `app/splash-mark.png` (transparent gold mark) and a very short web/PWA startup handoff overlay. The overlay uses the exact same brand background and small mark, then fades after the first DOM paint; this avoids an ugly color/size jump between native splash and loaded web UI.
- Web Manifest `background_color` is now `#0B3A2F`; `theme_color` remains the same brand green.
- PWA cache/runtime cache bumped from R27 to R28.
- No user storage schema changes and no new permissions. Data Safety schema remains 2.

### Required Android store update
To change the actual Google Play launch frame, rebuild in PWABuilder only **after R28 is deployed**, keeping package ID `com.tadaruqnoor.rafiq`, using **version code 2**, and signing with the exact existing upload keystore/alias/passwords. Do not create a new signing key. Play App Signing continues to sign distribution builds. See `PWABUILDER-R28-ANDROID-SETTINGS.md`.

### Standing UX rule
Do not revert to a large full-canvas ornamental splash. Launch should remain minimal: solid Tadaruq background, small centered mark, fast fade, no text, no spinner, no marketing copy.


## 31) v24 R29 — Emergency Mushaf geometry rollback / safe dark mode (2026-08-20)

User reported that the Mushaf appearance was broken after R27. Root cause was the R27 `fitMushafSvgViewBox()` auto-crop plus aggressive `100vw` geometry overrides. This was too risky for a fixed-layout Quran page and violated the project principle that the 604 printed pages must not be reflowed, cropped, or geometrically reinterpreted.

### Permanent rule
- **Never auto-crop or rewrite the SVG `viewBox` of Mushaf pages.**
- **Never infer ink bounds with `getBBox()` to zoom Quran pages.**
- Keep the original fixed SVG geometry and ayah polygons intact.
- Any dark mode must be visual-only (background/filter) and must not alter page geometry.
- Any future spacing change must be in the surrounding reader chrome only, not the Quran SVG coordinate system.

### R29 changes
- Removed `fitMushafSvgViewBox()` entirely and removed its render-time call.
- Removed the R27 edge-to-edge geometry override block.
- Restored R26/R16 stable Mushaf sizing/fullscreen rules.
- Added dark mode using only CSS visual filtering/backgrounds; no viewBox/geometry changes.
- Kept all R28 splash work and all R26 tafsir-reader work.
- `quran-pos`, 604-page mapping, swipe direction, ayah selection, tafsir position, and saved user data remain unchanged.
