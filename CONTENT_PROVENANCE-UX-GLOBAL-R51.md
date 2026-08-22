# CONTENT PROVENANCE / GLOBAL UX — R51

## Scope
R51 is an application-wide readability, source-placement, hierarchy-consistency, and interaction-audit release. It does not introduce a new religious corpus or change the underlying source hierarchy. Its purpose is to make the existing sourced material easier to read and less visually noisy across the whole application, not only inside the newer Knowledge screens.

## Owner-wide display rule
1. Supporting and explanatory text must be comfortably readable on a phone. Ordinary explanatory copy targets roughly 14–16px; true metadata may remain smaller when it is still legible.
2. A book, encyclopedia, or section-level primary source is shown once near the beginning of the relevant section.
3. The same common source is not repeated below every item merely because every item belongs to the same source family.
4. Per-item evidence remains visible when it is genuinely item-specific or different from the section source: Qur'an verse, exact hadith/takhrij/location, genuinely additional scholarly source, original lecture/video timestamp, or case-specific reference.
5. Source de-duplication is a presentation change only. Provenance/source metadata is not deleted merely because the UI displays a shared reference once.
6. The section-start source area should show actual principal source names/links visibly. Secondary references may be collapsed.

## R51 sections audited
### Adhkar
- The set's common source is shown once at the set beginning.
- Repeated item source UI is suppressed when it belongs to the same source family as the set.
- Search results may still show the item's source because the result is detached from the surrounding set context.
- A genuinely different item source is labelled as an additional source.

### Riyad al-Salihin and Forty Nawawi
- General text/commentary sources appear at the section beginning.
- List/day cards do not repeat the same general source.
- A hadith detail view has one compact source panel near the beginning containing the text/commentary boundary and exact hadith location.
- Specific takhrij/reference material remains when genuinely tied to that hadith.

### Manazil al-Sa'irin
- The general source appears once in the section introduction.
- Individual station cards no longer repeat the same general source.

### Tazkiyah / Qalb / Fiqh al-Nafs / personal paths
- Each detail/problem topic has one visible source panel before its teaching/action content.
- Repeated sources inside definition, step, proof, question, flag, and path-stop blocks are suppressed.
- Fiqh al-Nafs consolidates its methodology source and general medical-boundary source into a single section-start source panel.
- Specific evidence is preserved when genuinely different or necessary.

### Irtaqi
- One source panel is displayed near the beginning of the journey.
- Daily reason/principle/task/framework blocks do not repeat the same source list.

### Fiqh Busola
- The track has one source panel near the beginning.
- Lesson cards do not repeat the same source list.
- Lesson details have one source panel before lesson stages.
- Lab cases show their case references once near the beginning rather than at the bottom.

### Work / benefit routes
- Route-specific sources are genuinely different between routes, so they remain.
- They are moved into a compact source panel immediately after the route title, before explanatory steps.

## Intentional item-level exceptions
- Dua: direct Qur'an/hadith evidence for each dua.
- Hisn/adhkar entries with exact item-specific hadith/takhrij references.
- Bank of deeds: evidence differs by deed.
- Ishkaliat: every point retains the original video/timestamp boundary.
- Lulu/Marjan / reviewed hadith: exact-hadith catalog/verification links remain.
- Allah's Names: general references once; direct verse/hadith evidence for a particular Name may remain.
- Structured Knowledge: a genuinely additional item source remains when different from the section's primary source.

## Global readability audit
R51 adds a final application-wide CSS layer after legacy release styles. It covers supporting/explanatory text across Today/home, Qur'an tools/Tafsir controls, Adhkar/Dua/Hisn/Asma, Knowledge, hadith detail, Tazkiyah/Manazil/Fiqh al-Nafs/paths/deeds/Ishkaliat, Irtaqi, history, Saved Later, onboarding, profile/settings/privacy explanation, feedback, and other secondary copy.

The Mushaf itself remains a fixed KFQC SVG page system; R51 does not substitute CSS font sizing for Qur'anic glyph geometry.

## Interaction audit continuity
R51 preserves the R50 interaction corrections: only the visible Adhkar “قرأت” control increments; normal Mushaf tap opens ayah actions; swipe/drag is separated from ayah tap; the mobile ghost-click opening guard remains active; major Knowledge chapters use explicit vertical hierarchy.

## Data / privacy boundary
R51 changes presentation and navigation behavior only. It adds no personal persistent key, no analytics, no backend upload, and no migration. Data schema remains 2.
