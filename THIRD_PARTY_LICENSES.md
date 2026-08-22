# Third-party notices used by Rafiq v24 R14

## HisnElMuslim digital dataset
Repository: https://github.com/asellam/HisnElMuslim
Purpose in Rafiq: on-demand digital transcription/findex for the complete `حصن المسلم` reader.
Canonical religious/book reference in Rafiq remains the official Risala al-Haramain publication of `حصن المسلم من أذكار الكتاب والسنة` by Sa'id ibn Ali ibn Wahf al-Qahtani.

MIT License

Copyright (c) 2021 Abdellah SELLAM

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## R14 Mushaf al-Madinah SVG / Quranpedia interactive layer
Canonical digital Mushaf authority: King Fahd Glorious Qur'an Printing Complex
Official digital resource: https://dm.qurancomplex.gov.sa/
Official usage-rights page: https://dm.qurancomplex.gov.sa/rights/

Technical repository: https://github.com/quranpedia/quran-svg
Rafiq folder used: `mushafs/hafs/kfqc/svg/`
Pinned revision: `0198423eb867ba26051aba6ac902cd5d10aadd1b`

Purpose in Rafiq: render the fixed 604-page Hafs/KFQC Madinah Mushaf layout without browser text reflow and provide transparent ayah hit regions for selection.

The Quranpedia repository states that its own ayah-polygon overlay, JSON metadata, and repository tooling are released under CC0 1.0. The underlying KFQC digital Mushaf page artwork remains subject to the King Fahd Complex digital-Mushaf usage terms. Rafiq does not claim ownership of the Mushaf artwork, does not alter the Quranic page composition, and identifies the Complex as the canonical source.

## R42 Al-Lulu wal-Marjan digital transport layer
Canonical religious/book reference: **اللؤلؤ والمرجان فيما اتفق عليه الشيخان** by Muhammad Fuad Abd al-Baqi.
Canonical reference page used by Tadaruq: https://islamhouse.com/ar/books/409667/
Independent collection cross-check: https://hadithunlocked.com/lulu-marjan

Technical transport repository: https://github.com/HsnSaboor/hadith-api-toon
Purpose in Tadaruq R42: lazy, chapter-by-chapter delivery of the Arabic Al-Lulu wal-Marjan corpus. Tadaruq verifies that the remote index identifies the collection as Al-Lulu wal-Marjan and reports exactly 1,906 hadiths before treating it as the complete corpus. The 12 in-app simplified explanations remain separately hand-reviewed editorial overlays; no automated religious commentary is generated for the remaining corpus.

The repository describes itself as a format conversion of upstream hadith datasets and declares the same license as the original project: **Unlicense / public domain dedication**. Tadaruq does not claim authorship or ownership of the hadith texts.
