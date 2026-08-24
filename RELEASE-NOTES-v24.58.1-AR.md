# تدارُك — Release Notes v24.58.1 / R58 Production Hardening

تاريخ البناء: 2026-08-24

## ما تغيّر

### الأمان
- إزالة `unsafe-inline` من `script-src` في صفحات التطبيق وتشغيل السكربتات من ملفات مستقلة.
- إضافة `script-src-attr 'none'` و`worker-src 'self'` حيث يلزم.
- إصلاح Stored/Imported XSS في السبحة عبر escaping صارم للنصوص وروابط http/https فقط.
- تقييد استيراد نسخة السبحة الاحتياطية إلى مفاتيح `tas:` المعروفة، بدل السماح بكتابة مفاتيح تخزين عامة.
- حد أقصى 2 MiB لملف استيراد السبحة، مع normalization للنصوص والأهداف.

### PWA والأداء
- تقليل الـimmediate install shell من نحو 6.28 MiB إلى 1.35 MiB، أي تأجيل نحو 78.5% من التنزيل غير الضروري لبدء التطبيق.
- المحتوى الاختياري يُدفّأ تدريجيًا في النسخة المثبتة فقط، بأربع عمليات متوازية كحد أقصى.
- احترام `Save-Data` و`slow-2g/2g` وعدم التسخين التلقائي عليها.
- `cacheVersion` أصبح `20260824-r58-prod1`.

### Mobile UX والوصولية
- ضمان 16px على حقول الإدخال الرئيسية في العرض المحمول لتجنب iOS focus zoom.
- إضافة accessible names لعناصر تحكم كانت ناقصة.
- تعريف الحوارات المهمة بـ`role="dialog"` و`aria-modal` وربط عناوينها.
- إضافة focus containment/return للحوارات بدون تغيير سلوك التنقل الأساسي.
- تحسين زر الرجوع في «حصن المسلم» لاتجاه RTL.
- إضافة مؤشر لطيف لحالة Offline/Reconnected.

### الخصوصية
- تصحيح وصف «الرقم السري» إلى «رمز فتح محلي» وتوضيح أنه ليس تشفيرًا للبيانات.
- توضيح أن محتوى اليوميات يُحفظ محليًا ولا يُرسل إلى خادم تدارُك بدل وعد غير قابل للإثبات بأنه «لن يراه أحد غيرك».

### الجودة والاختبارات
- إضافة `tests/production_readiness_static.py`.
- إدخال اختبارات first-entry وperformance وproduction-readiness في GitHub Actions.
- إضافة budgets للملفات الجديدة ولـPWA immediate install shell.
- آخر تحقق محلي ثابت: PASS لكل اختبارات JS/static/budgets/first-entry/search/production-readiness، و0 warnings.

## تنبيه إصدار

اختبار المتصفح E2E لم يتمكن من فتح localhost داخل بيئة المراجعة بسبب سياسة `ERR_BLOCKED_BY_ADMINISTRATOR`. يجب أن يكون نجاح E2E في GitHub Actions + smoke test على هاتف حقيقي شرط النشر النهائي.
