تدارُك R27 — رفع GitHub Pages

هذا الملف مخصص مباشرة لمستودع Abdull2/rafiq.

1) فك الضغط.
2) ارفع محتويات هذا المجلد كلها إلى جذر المستودع main (نفس المكان الموجود فيه index.html الآن).
3) وافق على Replace للملفات القديمة.
4) لا تنشئ مجلد app/ عند استخدام هذه الحزمة: ملفات الويب هنا مُسطّحة عمدًا وتعمل من الجذر.
5) لا تنقل ملف Digital Asset Links إلى هذا المستودع. الملف الخاص بالـTWA يجب أن يظل في المستودع المنفصل Abdull2.github.io بالمسار حرفيًا:
   .well-known/assetlinks.json
   ليظهر على https://abdull2.github.io/.well-known/assetlinks.json
6) مجلد integrations/mokhtasar-worker موجود في Full Source فقط، وليس مطلوبًا لرفع GitHub Pages؛ هو مصدر Cloudflare Worker عند تفعيل API المختصر.

R27: وضع ليلي للمصحف + تقليل الفراغات الداخلية والمارجن مع الحفاظ على صفحات KFQC الثابتة.
