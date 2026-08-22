تدارُك v24.58.0 — R58 Stability Foundation
حزمة جاهزة لـ GitHub Pages

طريقة الرفع:
1) فك ضغط الحزمة.
2) ارفع محتويات المجلد كلها إلى جذر المستودع، بحيث يكون index.html في الجذر.
3) لا ترفع ملف ZIP نفسه بدل المحتويات.

ما الجديد في R58:
- لم نغيّر المحتوى العلمي الموسّع في R57؛ هذا إصدار ثبات وهندسة.
- مصدر واحد لرقم الإصدار: version.js.
- طبقة تخزين مستقلة: IndexedDB أساسي مع مرآة توافق localStorage وحماية لبيانات النسخ القديمة.
- ترقية مخطط البيانات من 2 إلى 3 بدون إعادة كتابة مدمرة للبيانات القديمة.
- Backup جديد باسم tadaruq-backup مع SHA-256 عند توفر Web Crypto، مع استمرار قبول النسخ القديمة.
- Service Worker أكثر أمانًا: لا يجبر المستخدم على Reload، والكاش الحرج منفصل عن الملفات الاختيارية، وحدود للكاش التشغيلي.
- تحديثات PWA اختيارية: يظهر تنبيه «تحديث الآن» بدل التحديث المفاجئ.
- Content Security Policy أساسية وتقليل سطح الاتصال الخارجي.
- شاشة تشخيص محلية داخل الإعدادات.
- احترام prefers-reduced-motion.
- Quality Gate على GitHub Actions: JSON + روابط محلية + JS syntax + ميزانية أحجام + اختبارات متصفح Desktop/Mobile/Offline.

الاختبارات قبل التسليم:
- 32 ملف JSON/manifest (منها release-manifest؛ و31 ملف بيانات/manifest للتطبيق) تم تحليله بنجاح.
- 2940 موضع URL مصدر/مرجع تم فحص بنيته واستخدام HTTPS.
- فحص IDs داخل القوائم وIDs في HTML.
- JavaScript syntax لجميع ملفات التشغيل.
- اختبارات متصفح حقيقية على Desktop وMobile.
- اختبار الثيمات الثمانية.
- اختبار ترحيل بيانات v2 -> v3 مع بقاء البيانات.
- اختبار Backup/Restore وسلامة checksum.
- اختبار Service Worker وإعادة فتح التطبيق Offline.
- اختبار الصفحات المساندة: السبحة، الخصوصية، المصادر.

ملفات مهمة للمطور/المراجعة:
- STABILITY-AUDIT-R58-AR.md
- SOURCE-AUDIT-R57-AR.md
- DATA_SAFETY.md
- tools/validate_project.py
- tools/check_budgets.py
- tests/e2e_smoke.py
- .github/workflows/quality.yml

- release-manifest.json: بصمات SHA-256 وأحجام ملفات التشغيل للتحقق من سلامة الحزمة.
