# رفع رفيق يومك على PWABuilder

## لماذا النسخة القديمة لم تُكتشف؟

الملف `manifest.json` الموجود في حزمة الإضافة هو Manifest خاص بإضافة Chrome Manifest V3، وليس Web App Manifest خاصًا بتطبيق PWA. كما أن صفحة `index.html` لم تكن تربط Web Manifest، وملف `sw.js` لم يكن موجودًا؛ لذلك ظهر في PWABuilder: Missing Name / Create a web app manifest / Add a service worker.

## هذه الحزمة

هذه الحزمة هي نسخة الويب/PWA فقط. الملفات موجودة مباشرة في الجذر حتى تعمل على GitHub Pages داخل المسار `/rafiq/`، وتحتوي على:

- `manifest.webmanifest`
- `sw.js`
- تسجيل Service Worker من `pwa-register.js`
- الأيقونات ولقطات الشاشة المطلوبة
- `index.html` في جذر الموقع

## النشر على GitHub Pages

1. فك ضغط الملف.
2. ارفع **محتويات المجلد نفسها** إلى جذر مستودع GitHub الخاص بالموقع، وليس المجلد الخارجي كطبقة إضافية.
3. من GitHub: Settings → Pages → Deploy from a branch → اختر `main` و`/(root)`.
4. بعد اكتمال النشر افتح رابط الموقع، مثال: `https://USERNAME.github.io/rafiq/`.
5. تأكد أن الروابط التالية تفتح بلا 404:
   - `https://USERNAME.github.io/rafiq/manifest.webmanifest`
   - `https://USERNAME.github.io/rafiq/sw.js`
6. ضع رابط الموقع نفسه في PWABuilder واضغط Start، ثم أعد الاختبار.

## مهم

- لا ترفع ملف ZIP داخل PWABuilder؛ PWABuilder يحلل رابط موقع HTTPS منشور.
- لا تستخدم `manifest.json` الخاص بإضافة Chrome كـ Web Manifest.
- عند تحديث ملفات التطبيق لاحقًا غيّر اسم `CACHE_NAME` داخل `sw.js` حتى يصل التحديث للمستخدمين فورًا.
- إذا ظل PWABuilder يعرض النتيجة القديمة، افتح الموقع في نافذة خاصة أو امسح بيانات الموقع/Service Worker ثم أعد التحليل.
