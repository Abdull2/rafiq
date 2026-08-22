# CONTENT PROVENANCE / UX — R50

## Scope
R50 is a readability, source-placement, hierarchy, Aqeedah-depth, and interaction-consistency release. It does not change the religious sourcing rule; it changes how repeated common references are presented so the source remains visible without visually interrupting every card.

## Aqeedah — beginner explanation backbone
Primary beginner source:
- **العقيدة الميسرة من الكتاب العزيز والسنة المطهرة** — د. أحمد بن عبد الرحمن القاضي.
- Public Arabic source: https://islamhouse.com/ar/books/2774057/
- The source describes the book as an easy presentation of Islamic creed arranged on the six pillars of faith from Hadith Jibril and grounded in Qur'an and Sunnah.

Expansion / reference source:
- **الموسوعة العقدية — الدرر السنية**: https://dorar.net/aqeeda?l=1
- Used as a deeper structured reference for topic boundaries and expanded verification.

Tadaruq's R50 text is an original educational synthesis for lay readers. It is not presented as a verbatim quotation from either source. It may explain, connect, and simplify, but must not invent a new creed claim or turn a general educational section into a judgement on a named person.

## Source placement rule — owner decision
1. A section/book's common primary reference is shown **once at the beginning of that section**.
2. The same common source is not repeated below every card/item merely because each item came from the same book/encyclopedia.
3. An item-level source remains visible when it is genuinely different/additional to the section source, or when the item requires a specific proof/takhrij/timestamp/reference that should not be confused with the section's general bibliography.
4. Qur'an/hadith evidence that is part of the item's actual evidence may remain visible as evidence; it is not treated as a redundant generic source card.
5. Existing strict-source policy is preserved in data/provenance even when the UI de-duplicates repeated display.

## Knowledge hierarchy rule
The outer Knowledge map and every nested category must follow the same mental model: category -> vertically ordered doors -> content. Do not make users discover major inner chapters through a horizontal strip. Horizontal chips may still be appropriate for lightweight filters/search facets, but not as the only navigation between major chapters.

## Interaction audit corrections
- Adhkar: the entire card is no longer a hidden count target; only the visible `قرأت` control changes the count.
- Printed Mushaf: normal tap/click on an ayah opens its explicit action sheet. Long-press remains an optional alternative. Swipe movement cancels tap selection.
- Mobile ghost-click guard: the synthetic click that some browsers dispatch after the touch that created the ayah sheet is ignored briefly so one tap cannot open and immediately close the sheet.
- Major nested Knowledge navigation is explicit and vertical.

## Readability rule
Supporting/explanatory religious text must not collapse into microcopy. R50 raises the key explanatory/body layers while keeping source labels secondary to the teaching text.
