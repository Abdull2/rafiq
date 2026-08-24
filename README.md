# تدارُك — Tadaruq

تطبيق ويب تقدّمي (PWA) عربي، Mobile-first وLocal-first، يجمع اليوميات التعبدية، المصحف، الأذكار، العلم، التزكية، البحث، الحفظ، والنسخ الاحتياطي في تجربة واحدة قابلة للتثبيت والعمل دون اتصال في نطاق واسع.

## النسخة الحالية

- App version: `24.58.1`
- Release: `R58`
- Data schema: `3`
- Backup version: `2`
- Cache version: `20260824-r58-prod1`
- Build date: `2026-08-24`

## رابط التطبيق

https://abdull2.github.io/rafiq/

## أهم ما في R58 / v24.58.1

- فهرس بحث مسبق `search-index.json` بدل تحميل عشرات ملفات JSON عند أول بحث.
- تحسين مسار بدء التطبيق وتقليل القراءات المتسلسلة من التخزين.
- تقليل حمل تثبيت الـPWA الفوري؛ المحتوى الكبير غير الضروري لبدء التطبيق يُخزَّن تدريجيًا بعد الاستقرار في النسخة المثبتة، مع احترام Data Saver والشبكات البطيئة.
- تشديد Content Security Policy وإزالة JavaScript التنفيذي inline من الصفحات.
- إصلاح مسار XSS في الأذكار المخصصة/استيراد السبحة وتقييد مفاتيح الاستيراد إلى نطاق `tas:` فقط.
- تحسين تسميات عناصر التحكم، إدارة التركيز في الحوارات، وأحجام حقول الإدخال على iPhone.
- حالة واضحة للاتصال/انقطاع الشبكة بدون تعطيل تجربة local-first.
- إضافة regression checks خاصة بالجاهزية للإنتاج وربطها بـGitHub Actions.

## البنية

المشروع Static PWA بدون build framework إلزامي:

- `index.html` — الواجهة الرئيسية والأنماط الأساسية.
- `app.js` — منطق التطبيق الرئيسي.
- `storage.js` — طبقة التخزين المحلية.
- `data-safety.js` — النسخ الاحتياطي/الاستيراد وسلامة البيانات.
- `sw.js` — Service Worker واستراتيجيات الـcache/offline.
- `pwa-register.js` — تسجيل وتحديث الـService Worker وتسخين المحتوى الاختياري.
- `search-index.json` — فهرس البحث الجاهز.
- `data/` — المحتوى المحلي.
- `tests/` و`tools/` — اختبارات وتحقيقات الإصدار.

## الخصوصية

البيانات الشخصية الأساسية تُحفظ محليًا في المتصفح/الجهاز. رمز الفتح المحلي هو طبقة واجهة محلية وليس تشفيرًا لبيانات الجهاز. راجع `privacy.html` و`DATA_SAFETY.md` قبل أي تغيير في التخزين أو الاستيراد.

## التحقق قبل النشر

شغّل من جذر المشروع:

```bash
bash tools/check_js.sh
python3 tools/validate_project.py
python3 tools/check_budgets.py
python3 tests/knowledge_first_render_static.py
python3 tests/performance_static.py
python3 tests/production_readiness_static.py
```

ثم شغّل اختبار المتصفح E2E في بيئة تسمح بفتح localhost، أو اترك GitHub Actions ينفذه:

```bash
python3 tests/e2e_smoke.py
```

## بوابة الإصدار

لا تعتبر النسخة Production-verified إلا بعد:

1. نجاح GitHub Actions بالكامل، بما فيه E2E.
2. Smoke test على iPhone/Safari وجهاز Android متوسط/Chrome.
3. تجربة Online → Offline → Online بعد تثبيت الـPWA.
4. تجربة تحديث Service Worker من النسخة السابقة إلى الحالية.
5. قياس LCP / INP / CLS على النسخة المنشورة بدل الاعتماد على القياسات البنيوية فقط.

## النشر على GitHub Pages

المشروع مصمم ليعمل من المسار `/rafiq/`. ارفع ملفات الحزمة إلى فرع النشر المعتاد ثم راقب GitHub Actions، وبعد النشر نفّذ Hard Refresh أو أعد فتح النسخة المثبتة للتأكد من انتقال الـcache إلى `20260824-r58-prod1`.

## تقارير الإصدار

- `PRODUCTION-READINESS-AUDIT-v24.58.1-AR.md`
- `RELEASE-NOTES-v24.58.1-AR.md`
- `AI_HANDOFF_TADARUQ_R58.md`
