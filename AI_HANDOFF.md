# NEXT AI — READ THIS FIRST

**Project:** رفيق يومك (Rafiq Yomak)  
**State ID:** `RAFIQ-HANDOFF-1.6.0-2026-08-18`  
**Current artifact type:** Chrome Manifest V3 side-panel extension  
**Current release:** `1.6.0`

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
- **القلب** — أمراض القلوب + أعمال القلوب + العقبات + بنك الأعمال + فقه النفس
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

### v1.6 (CURRENT)
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

### Medical boundary
Reference examples:
- WHO depression fact sheet: `https://www.who.int/news-room/fact-sheets/detail/depression`
- NHS depression diagnosis: `https://www.nhs.uk/mental-health/conditions/depression-in-adults/diagnosis/`
- Rule: ordinary worry/sadness can be discussed educationally. Persistent symptoms, significant impairment in work/study/relationships, diagnosed disorders, or self-harm risk must not be treated as “just spiritual weakness”; recommend qualified professional care while preserving religious support.

## 6) Personalization rules

Storage key: `profile-v1` with `{age, gender}` where gender is `male` or `female`.

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

## 9) Known technical files

- `manifest.json` — MV3 manifest/version/permissions.
- `background.js` — side panel/context menu/background behavior.
- `app/index.html` — layout/CSS/markup/onboarding/settings/panels.
- `app/app.js` — main UI/application logic.
- `app/qalb.json` — heart diseases/works/obstacles/Fiqh al-Nafs/bank deeds.
- `app/knowledge.json` — essentials + fiqh data and general references.
- `app/azkar.json`, `app/adiya.json`, `app/riyad.json`, `app/quran.json`, `app/asma.json`, `app/irtaqi.json` — content data.
- `app/sources.html` — public scientific/source methodology page.
- `app/privacy.html` — privacy disclosures.

## 10) Testing gates before each release

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
   - adhkar/du'a/heart/Qur'an/hadith source labels remain visible.
6. Verify `＋` does not accidentally open a heart tile (event-propagation regression).
7. Test onboarding/profile for male + female and at least teen + adult ages.
8. Test dark/light, narrow side-panel width, scrolling segmented navigation, search, saved list, and settings.
9. If permissions or data use change, update `privacy.html` and Chrome Web Store disclosures before upload.

## 11) Near-term roadmap

Priority order:
1. Reliability + source integrity.
2. Exact-item deep linking from `محفوظاتي`.
3. More real-life obstacle cases with careful source mapping (family, boundaries, friendship, marriage, loneliness, pornography/sexual temptation, debt/money, job stress, study failure, social media, comparison, grief) — no sensationalism.
4. More precise age/sex personalization where genuinely needed.
5. Licensed/authorized **human audio** for adhkar if a trustworthy audio source/licence is secured; do not scrape random recitations.
6. Continued UX cleanup in large content areas.
7. Full regression/accessibility test before store release.

## 12) Instructions to the next AI

- Read this file before proposing changes.
- Treat the current ZIP/source as source of truth over memories of earlier versions.
- Preserve the product philosophy and non-negotiables above.
- When adding Islamic content, verify sources on the web where necessary and write the source into the app data/UI, not only in chat.
- If a source cannot be verified, say so and omit/rewrite the claim rather than filling the gap confidently.
- When adding psychological content, maintain the medical boundary and do not make diagnostic claims.
- Keep the owner's interaction cost low: make a reasonable implementation, test it, then report exactly what changed and any decisions still genuinely needed.

