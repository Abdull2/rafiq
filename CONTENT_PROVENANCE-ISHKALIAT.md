# Content provenance — إشكاليات

**Release introduced:** 1.7.0  
**Owner request:** add an optional advanced track for committed Muslims / people actively pursuing istiqamah, based on a set of Dr. Ahmed Abdelmonem YouTube lectures.

## Important provenance rule

The source material supplied to this development session was **not a verified verbatim transcript**. It was a Markdown export of a conversation in which Gemini summarized a series of YouTube lectures and attached timestamps/links. Therefore:

- Rafiq must **not** present the app wording as a verbatim quotation from Dr. Ahmed Abdelmonem.
- App copy is labelled as **تلخيص تعليمي / صياغة رفيق**.
- Every displayed idea in this track links back to the **original YouTube video and the relevant timestamp**.
- If an actual transcript or official written version becomes available later, use it to verify/refine the summaries.
- If a future AI finds a mismatch between the summary and the original lecture, the original lecture wins.
- Do not convert lecture commentary into a formal fatwa or universal ruling merely because it appears in the summary.

## UX / audience decision

Do **not** ask the user “هل أنت متدين؟” or score religiosity. Instead store a local-only opt-in content preference:

`profile-v1.advancedIssues = true|false`

UI wording: **إظهار «إشكاليات» — المسار المتقدم**.

This keeps the advanced track hidden by default unless the user chooses it, while avoiding a judgement or classification of the user's religiosity.

## Original video set

1. إشكاليات البناء المعرفي  
   https://www.youtube.com/watch?v=O0P4zEgaLvs
2. إشكاليات اختيار الثغر  
   https://www.youtube.com/watch?v=hQS528QM8z0
3. الحور بعد الكور  
   https://www.youtube.com/watch?v=XxQuHzfZgow
4. الحور بعد الكور (2): الثبات في وقت الفتن  
   https://www.youtube.com/watch?v=qaL_DRSzC6Y
5. أنماط التدين المعاصر (1)  
   https://www.youtube.com/watch?v=5_X4LkoS8TE
6. أنماط التدين المعاصر (2)  
   https://www.youtube.com/watch?v=GVfT1FD0IRw
7. القرار الثاني  
   https://www.youtube.com/watch?v=E22X3uxunNE
8. إشكالية التفكير الهندسي  
   https://www.youtube.com/watch?v=4OdO5hhEUZ0
9. إعادة ضبط  
   https://www.youtube.com/watch?v=xW95gdjHo1M
10. إعادة ضبط (2): مفاهيم الاستضعاف من خواتيم سورة هود  
    https://www.youtube.com/watch?v=PXDF7HJ4WW0
11. إشكالية اختلاف النخب  
    https://www.youtube.com/watch?v=c577DhHsm4U
12. إشكالية اليأس والإحباط وترك العمل  
    https://www.youtube.com/watch?v=IIbrgo6ivY8
13. جوابات إشكاليات الإشكاليات  
    https://www.youtube.com/watch?v=WLaENY1FJaE

Playlist supplied in the URLs:  
https://www.youtube.com/playlist?list=PLnpYU8_AiEPeOynF9Q35m_3QgRq-yFtaC

## Implementation

- Data: `app/ishkaliat.json`
- UI: `app/app.js` → `hIshkaliat()` / `hIshkaliatList()`
- Track is rendered inside **القلب** after opt-in.
- Search + theme chips are provided.
- Each lecture card includes:
  - concise educational intro,
  - 5 key ideas,
  - source link under intro,
  - source link + timestamp under every key idea,
  - full-video link,
  - `＋` save-for-later support.
- Global source list also appears in `app/sources.html`.
- Raw owner-supplied notes are retained at `references/raw-user-ishkaliat-notes.md` for future verification, but they are not authoritative.

## Future content rule

When more lectures are supplied:

1. identify the original lecture URL;
2. distinguish exact quote vs paraphrase;
3. prefer a short problem-oriented card rather than copying a long lecture;
4. attach the original timestamp to every paraphrased idea;
5. add primary Qur'an/hadith references separately when the app itself states a religious ruling or quotes revelation;
6. keep the lecture link as attribution/context, not as a replacement for primary evidence when primary evidence is necessary.
