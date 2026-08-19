# ربط «المختصر في التفسير» داخل تدارُك

النسخة R25 تعمل فورًا بدون خادم: اختيار آية ثم «التفسير» يفتح لوحة داخل تدارُك وبها الآية ورابط مباشر لنفس الآية في النسخة الرسمية.

لعرض **النص الرسمي نفسه داخل تدارُك** يلزم Token مصرح به من API الرسمي للمختصر. لا يجوز وضع الـToken داخل `app.js` أو `tafsir-config.js` لأن GitHub Pages عام.

## الخطوات بعد الحصول على Token رسمي
1. أنشئ Cloudflare Worker من `worker.js`.
2. خزّن الـToken كـSecret باسم `MOKHTASAR_TOKEN` (لا تضعه في GitHub).
3. انشر الـWorker.
4. افتح `app/tafsir-config.js` وضع رابط الـWorker في `proxyBase`، مثل `https://tadaruq-mokhtasar.<account>.workers.dev`.
5. ارفع التحديث إلى GitHub Pages.

الواجهة ترسل فقط `sura` و`aya`. الـWorker يضيف الـBearer Token من السر، يطلب `book-contents` للكتاب رقم 200، ثم يعيد نص الآية فقط للواجهة.

المراجع الرسمية:
- API docs: https://mokhtasr.com/ar/api-doc
- القارئ الرسمي: https://mokhtasr.com/ar/books/200
- شروط الاستخدام: https://mokhtasr.com/ar/pages/terms-and-conditions

لا تنسخ قاعدة بيانات الكتاب أو النص الكامل داخل المستودع من دون إذن/ترخيص صريح.
