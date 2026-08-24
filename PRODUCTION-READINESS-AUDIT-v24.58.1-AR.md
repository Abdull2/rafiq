# تدارُك — Production Readiness Audit
## v24.58.1 / R58 Production Hardening

**تاريخ المراجعة:** 2026-08-24  
**النطاق:** الحزمة المرفوعة + البنية الحالية للمشروع + مراجعة repository/public deployment بقدر ما تسمح به البيئة.  
**منهجية الحكم:** فحص كود وبنية، اختبارات static/regression، مراجعة PWA/security/accessibility/RTL، وتعديلات production-safe. لا توجد أرقام Core Web Vitals حقيقية من جهاز هاتف لأن بيئة التنفيذ تمنع رحلة localhost بالمتصفح.

---

# Executive Summary

النسخة بعد hardening مناسبة كـ**Release Candidate قوي**، ولا يوجد حاليًا عيب Critical معروف في الفحص الثابت بعد الإصلاحات. أكبر مشكلتين فعليتين تم العثور عليهما وإصلاحهما كانتا في استيراد/عرض بيانات السبحة: Stored/Imported XSS وإمكانية أن يكتب ملف backup مفاتيح خارج نطاق السبحة. كذلك تم إصلاح نقطة أداء كبيرة في Service Worker كانت تجعل التثبيت يسحب معظم مكتبة المحتوى مقدمًا.

الحكم النهائي ليس “Production-verified” بعد، لأن بوابة المتصفح الحقيقي لم تُنفذ في هذه البيئة. المطلوب قبل النشر النهائي: نجاح E2E في GitHub Actions، smoke test على iPhone وAndroid حقيقيين، وقياس LCP/INP/CLS على النسخة المنشورة.

| المحور | الدرجة /100 | ملخص |
|---|---:|---|
| Functionality | 90 | تغطية وظيفية واسعة واختبارات static جيدة؛ E2E الحقيقي ما زال بوابة إصدار. |
| Mobile UX | 89 | Mobile-first واضح، touch targets جيدة، وتحسينات iOS/dialogs تمت. |
| Visual Design | 89 | هوية متماسكة ومكونات واضحة؛ tablet/desktop ما زال محافظًا جدًا على عرض الهاتف. |
| Performance | 86 | R58 حسن البحث والبداية، وهذا الإصدار خفّض كلفة تثبيت PWA؛ ما زال app/index كبيرين نسبيًا. |
| PWA Quality | 92 | manifest وoffline/update قويان؛ يلزم تحقق تثبيت/تحديث على أجهزة حقيقية. |
| Accessibility | 87 | labels/dialog semantics/focus تحسنت؛ VoiceOver/TalkBack اليدوي غير منفذ. |
| Security | 91 | تم إغلاق مساري XSS/import poisoning وتشديد CSP؛ يلزم استمرار منع إدخال HTML غير موثوق. |
| Native-App Feel | 86 | local-first، offline، bottom navigation، sheets جيدة؛ transitions/install discovery تحتاج صقلًا. |
| Reliability | 89 | data safety وregressions قوية؛ CI/browser/device gate ما زالت ضرورية. |

**النتيجة الإجمالية التقريبية: 89/100.**

---

# 1. فهم التطبيق — Feature Inventory

## التنقل والشاشات الأساسية
- «يومي»: ملخص اليوم والمهام/التقدم والعودة من حيث توقفت.
- «العلم»: محتوى علمي/معرفي ومسارات قراءة.
- «المصحف»: قراءة، بحث/تنقل، حفظ موضع، ختمة، ومحتوى offline.
- «الذكر»: أذكار، أسماء، دعاء، حصن المسلم، والسبحة.
- «تزكية»: مسارات تزكية، اليوميات/الخبيئة، ومتابعة التقدم.
- «السجل»: مراجعة التقدم التاريخي.
- «محفوظاتي»: عناصر محفوظة من أكثر من قسم.
- «البحث الشامل»: فهرس موحد للمحتوى.
- «الملف الشخصي» و«الإعدادات» و«النسخ الاحتياطي» و«التشخيص» و«الملاحظات».

## الحوارات/Bottom sheets المهمة
- البحث الشامل.
- onboarding.
- إعدادات/ملف شخصي/محفوظات.
- تفاصيل الحديث/القصة/التفسير.
- feedback/share.
- إضافة ذكر مخصص في السبحة.

## أهم رحلات المستخدم
1. أول دخول → onboarding/الإعدادات → «يومي».
2. فتح قسم معرفي مباشرة من رابط/تنقل داخلي.
3. البحث الشامل → فتح نتيجة → الرجوع للحالة السابقة.
4. قراءة المصحف → حفظ موضع → «أكمل من حيث توقفت».
5. تنزيل محتوى للمصحف/الحديث → Offline → الرجوع Online.
6. إضافة/إكمال مهمة يومية → السجل.
7. إنشاء ذكر مخصص في السبحة → عدّ → إحصاءات → backup/import.
8. تعديل التفضيلات/الملف الشخصي → استمرارها بعد refresh/reopen.
9. backup/restore لبيانات المستخدم.
10. تثبيت PWA → فتح standalone → تحديث Service Worker.

## عناصر لا تنطبق على المنتج الحالي
لا توجد في البنية الحالية رحلة login/logout/password recovery/payment أو backend account session تقليدية؛ التطبيق Static/Local-first. لذلك تُقيّم هذه البنود كـN/A بدل اختلاق مشكلات غير موجودة.

---

# 2. Critical Issues

## C-01 — Stored / Imported XSS في السبحة — **FIXED**
- **المشكلة:** نص الذكر المخصص أو البيانات القادمة من backup كانت تصل إلى قوالب `innerHTML` بدون escaping كافٍ.
- **المكان:** `tasbih.html` / منطق القائمة والإحصاءات والمصدر.
- **الأثر:** ملف import خبيث أو نص مخصص يمكن أن ينفذ HTML/JavaScript في origin التطبيق.
- **الحل المنفذ:** نقل المنطق إلى `tasbih.js`، escaping للنصوص، تقييد الروابط إلى `http/https`، normalization وحدود أطوال.
- **الصعوبة:** Medium.
- **تأثير المستخدم:** High.
- **الحالة:** مغلق + regression check.

## C-02 — Backup namespace poisoning في السبحة — **FIXED**
- **المشكلة:** الاستيراد كان يكتب مفاتيح من الملف إلى storage بصورة عامة، ما يسمح لملف خبيث بالتأثير على مفاتيح تطبيق غير خاصة بالسبحة.
- **المكان:** مسار import في السبحة.
- **الأثر:** فساد/تغيير إعدادات أو حالة محلية خارج وظيفة الاستيراد المقصودة.
- **الحل المنفذ:** قبول `tas:cfg` و`tas:custom` ومفاتيح التاريخ `tas:YYYY-MM-DD` فقط، مع حد ملف 2 MiB وnormalization.
- **الصعوبة:** Easy–Medium.
- **تأثير المستخدم:** High.
- **الحالة:** مغلق + regression check.

---

# 3. High Priority

## H-01 — Service Worker كان يحمّل مكتبة المحتوى أثناء install — **FIXED**
- **المشكلة:** مسار install كان ينتظر precache للملفات الاختيارية، بما فيها غالبية JSON corpus.
- **المكان:** `sw.js` / `pwa-register.js`.
- **الأثر:** تنزيل أولي أكبر، اتصالات كثيرة، وكلفة تثبيت محسوسة خصوصًا على هاتف متوسط أو شبكة محدودة.
- **الحل المنفذ:** critical shell فقط أثناء install، ثم warming اختياري للنسخة المثبتة في idle؛ concurrency=4؛ لا warming على Save-Data أو 2g/slow-2g.
- **الصعوبة:** Medium.
- **تأثير المستخدم:** High.
- **الحالة:** مغلق.

### القياس البنيوي
| القياس | قبل | بعد | التغيير |
|---|---:|---:|---:|
| PWA immediate install cache | ~6.28 MiB | ~1.35 MiB | ~78.5% أقل فورًا |
| محتوى اختياري مؤجل | — | ~4.94 MiB | يُحمّل تدريجيًا عند الملاءمة |

## H-02 — iOS input focus zoom — **FIXED**
- **المشكلة:** حقول نصية أصغر من 16px على الهاتف يمكن أن تسبب auto-zoom في Safari iPhone.
- **المكان:** inputs/selects/textarea في `index.html`.
- **الأثر:** شعور “موقع ويب”، قفز viewport وتجربة إدخال ضعيفة.
- **الحل المنفذ:** 16px minimum في mobile breakpoint مع الحفاظ على user text scale.
- **الصعوبة:** Easy.
- **تأثير المستخدم:** Medium–High.
- **الحالة:** مغلق.

## H-03 — CSP يسمح inline executable scripts — **FIXED**
- **المشكلة:** `script-src 'unsafe-inline'` يقلل قيمة CSP ضد XSS.
- **المكان:** `index.html` وصفحات الدعم/السبحة.
- **الأثر:** حماية أقل في حالة إدخال HTML خبيث.
- **الحل المنفذ:** استخراج boot/tasbih scripts إلى ملفات، `script-src 'self'`, `script-src-attr 'none'`, `worker-src 'self'`.
- **الصعوبة:** Medium.
- **تأثير المستخدم:** High أمنيًا.
- **الحالة:** مغلق.

## H-04 — Accessible dialogs/focus — **FIXED STATICALLY**
- **المشكلة:** بعض الحوارات المهمة لم يكن لها تعريف dialog/name/focus containment موحد.
- **المكان:** Saved/Profile/Settings وغيرها.
- **الأثر:** تنقل أقل وضوحًا للوحة المفاتيح/قارئ الشاشة.
- **الحل المنفذ:** `role=dialog`, `aria-modal`, `aria-labelledby`، وhelper لإدارة التركيز والرجوع.
- **الصعوبة:** Medium.
- **تأثير المستخدم:** Medium–High.
- **الحالة:** مغلق في static audit؛ يحتاج VoiceOver/TalkBack يدوي.

## H-05 — Regression checks المهمة لم تكن كلها في CI — **FIXED**
- **المشكلة:** اختبارات first-entry/performance موجودة لكن لم تكن كلها جزءًا من workflow الإجباري.
- **المكان:** `.github/workflows/quality.yml`.
- **الأثر:** إمكانية مرور regression في commit جديد رغم وجود اختبار محلي يكشفه.
- **الحل المنفذ:** ربط first-entry، performance، وproduction-readiness بالـCI.
- **الصعوبة:** Easy.
- **تأثير المستخدم:** High على الاعتمادية.
- **الحالة:** مغلق.

## H-R01 — Browser E2E الحقيقي لم يُنفذ داخل بيئة المراجعة — **OPEN RELEASE GATE**
- **المشكلة:** المتصفح في البيئة الحالية يمنع localhost ويعيد `ERR_BLOCKED_BY_ADMINISTRATOR`.
- **المكان:** `tests/e2e_smoke.py` / بيئة التشغيل وليس كود التطبيق.
- **الأثر:** لا يمكن إثبات التفاعلات الفعلية والتخطيط والـfocus/navigation end-to-end هنا.
- **الحل المطلوب:** GitHub Actions + هاتفان حقيقيان على الأقل قبل اعتبار الإصدار Production-verified.
- **الصعوبة:** Easy تشغيليًا.
- **تأثير المستخدم:** High كشرط إصدار.
- **الحالة:** مفتوح كـrelease gate، وليس bug مثبتًا في التطبيق.

## H-R02 — لا توجد أرقام LCP/INP/CLS حقيقية — **OPEN**
- **المشكلة:** الأداء مثبت بنيويًا/budgets، لا بقياسات field أو جهاز فعلي.
- **المكان:** النسخة المنشورة على الهاتف.
- **الأثر:** قد تبقى long tasks أو rendering costs غير ظاهرة في static analysis.
- **الحل المطلوب:** Lighthouse/WebPageTest + Chrome Performance على Android متوسط، وقياسات Web Vitals على GitHub Pages.
- **الصعوبة:** Easy–Medium.
- **تأثير المستخدم:** High.

## H-R03 — كتلة أولية كبيرة نسبيًا — **OPEN / R59**
- **المشكلة:** `app.js` ~351 KiB و`index.html` ~275 KiB، والـcritical code shell ~663 KiB uncompressed.
- **المكان:** architecture/initial JS+HTML.
- **الأثر:** parsing/compile/main-thread أعلى من تطبيق مقسم حسب الميزات.
- **الحل المطلوب:** تقسيم feature modules تدريجيًا (Quran/Tazkiyah/Sunnah/Search/Settings) وتحميلها عند فتح القسم، بدون إعادة كتابة شاملة.
- **الصعوبة:** Hard.
- **تأثير المستخدم:** High على الأجهزة الأبطأ.

---

# 4. Medium Priority

## M-01 — لا توجد إشارة عامة Offline/Reconnected — **FIXED**
- **الحل:** `network-status.js` يعرض حالة غير معطلة، `aria-live`, مع رسالة رجوع اتصال مؤقتة.

## M-02 — صياغة الخصوصية كانت توحي بضمان أقوى من الواقع — **FIXED**
- **الحل:** توضيح أن رمز الخبيئة حماية واجهة محلية وليس تشفيرًا، وأن البيانات المحلية لا تُرسل لخادم تدارُك بدل وعد مطلق بشأن من يمكنه رؤيتها.

## M-03 — سهم رجوع غير متسق مع RTL — **FIXED**
- **الحل:** توحيد اتجاه سهم «فهرس حصن المسلم» مع لغة التنقل العربية.

## M-R01 — صحة الروابط الخارجية غير مراقبة تلقائيًا — **OPEN**
- **الملاحظة:** الفحص الثابت وجد نحو 745 URL خارجيًا فريدًا عبر عشرات النطاقات، ولا توجد خطوة CI دورية لاختبار 404/redirect/dead links.
- **الحل:** weekly link checker محترم للـrate limits، مع allowlist للموارد التي تمنع HEAD.
- **الصعوبة:** Medium.
- **تأثير المستخدم:** Medium.

## M-R02 — قارئات الشاشة لم تُختبر فعليًا — **OPEN**
- **الحل:** VoiceOver iPhone/Safari + TalkBack Android/Chrome + keyboard-only desktop، مع سيناريوهات الحوارات والبحث والسبحة والنسخ الاحتياطي.
- **الصعوبة:** Medium.
- **تأثير المستخدم:** Medium–High.

## M-R03 — اكتشاف تثبيت PWA ضعيف — **OPEN**
- **الملاحظة:** لا يوجد prompt عدواني وهذا جيد، لكن لا توجد لحظة contextual واضحة لتعليم المستخدم التثبيت.
- **الحل:** CTA خفيف بعد value moment، مثل ثاني/ثالث عودة أو بعد استخدام offline download، مع إرشاد منفصل لـiOS.
- **الصعوبة:** Medium.
- **تأثير المستخدم:** Medium.

## M-R04 — Tablet/Desktop ما زال أقرب إلى هاتف في المنتصف — **OPEN**
- **الملاحظة:** الـshell الرئيسي محافظ على عرض mobile ضيق تقريبًا بدل الاستفادة من المساحة في بعض الشاشات.
- **الحل:** widening انتقائي فقط للشاشات التي تستفيد (search/results/history/knowledge), وليس تكبير كل شيء.
- **الصعوبة:** Medium.
- **تأثير المستخدم:** Medium.

## M-R05 — Warming المكتبة الاختيارية غير مرئي للمستخدم — **OPEN POLISH**
- **الحل:** إن كان المنتج يريد “المكتبة كاملة offline”، أضف status/setting واضحًا لحجم التنزيل وجاهزيته بدل اعتماد warming الصامت وحده.
- **الصعوبة:** Medium.
- **تأثير المستخدم:** Medium.

---

# 5. Low Priority

## L-01 — إضافة wide screenshot للـmanifest
الموجود يغطي لقطات narrow بشكل جيد. إضافة wide screenshot تحسن تجربة install UI على desktop/Chromebook حيث تدعمها المنصة.

## L-02 — توحيد مزيد من motion tokens
استخدم durations/easings محددة مركزيًا للحركات الجديدة، مع `prefers-reduced-motion` دائمًا. لا تضف animation للزينة.

## L-03 — تقليل CSS/HTML الكبير تدريجيًا
نقل أقسام CSS/feature templates إلى وحدات منظمة سيحسن الصيانة أكثر من الأداء الفوري؛ يُنفذ مع R59 modularization.

---

# 6. PWA Audit

## Manifest
الحالة جيدة: اسم/short name/id/start_url/scope/display standalone/orientation/colors/lang/dir/icons/maskable/screenshots/shortcuts موجودة في البنية الحالية.

## Service Worker
**نقاط قوية:**
- versioned cache.
- offline shell.
- فصل critical shell عن المحتوى الاختياري بعد هذا الإصدار.
- on-demand caching للمحتوى.
- قيود واضحة للمصادر الخارجية المستخدمة في التخزين.
- update path موجود في التطبيق.

**اختبارات إلزامية على جهاز حقيقي:**
1. Fresh install.
2. Launch standalone.
3. Online → Offline أثناء التنقل.
4. Offline → Online.
5. Update من cache قديم إلى `20260824-r58-prod1` والتطبيق مفتوح.
6. Clear site data ثم إعادة التثبيت.
7. Save-Data/شبكة بطيئة: التأكد أن optional warming لا يبدأ.

---

# 7. Loading & Perceived Performance

## ما أصبح جيدًا
- R58 يفصل البحث إلى index صغير نسبيًا بدل قراءة corpus كامل عند أول فتح.
- بدء «يومي» لا يرسم الأذكار قبل الحاجة.
- قراءات متعددة من التخزين أصبحت parallel حيث يمكن.
- الـPWA لا يحول install إلى تنزيل مكتبة كاملة.

## الأرقام الثابتة الحالية
- `index.html`: ~275.3 KiB.
- `app.js`: ~351.2 KiB.
- critical code shell: ~663.1 KiB.
- local JSON corpus: ~4.95 MiB.
- `search-index.json`: ~429.2 KiB، 1422 entry.
- PWA immediate install shell: ~1.35 MiB.

## الخطوة التالية
قسّم `app.js` حسب feature boundaries قبل إضافة مزيد من وظائف كبيرة. لا تستخدم preload عشوائيًا؛ استخدم dynamic import عند أول intent/فتح للقسم.

---

# 8. Mobile UX / iPhone / Android

## Mobile
- bottom navigation والتفاعل touch-first مناسبين للبنية الحالية.
- R58 يحتوي أساسًا على touch target token قريب من 44px للأزرار الحرجة؛ لم نضاعف قواعده.
- تم علاج input focus zoom على iPhone.
- safe-area handling موجود في الواجهة، ويجب إعادة اختباره في standalone.

## iPhone
اختبر خصوصًا:
- Home indicator + bottom navigation.
- keyboard مع settings/search/custom dhikr.
- focus/close في dialogs.
- standalone launch بعد update.
- back navigation/scroll restoration.

## Android
اختبر خصوصًا:
- hardware/system back مع dialogs/subviews.
- mid-range CPU عند أول فتح search/Quran/Tazkiyah.
- touch feedback.
- install/update/offline transitions.

---

# 9. Accessibility

## تم تحسينه
- accessible names للحقول/الأزرار الناقصة.
- dialog semantics.
- focus containment + return.
- network status كـlive region.
- mobile font sizing للحقول.

## لم يُثبت بعد
- نطق عربي صحيح في VoiceOver/TalkBack لكل section/button.
- ترتيب focus عبر جميع الشاشات.
- contrast في كل الحالات/الثيمات على جهاز فعلي.
- large text ودوران landscape على iOS.

**Release gate المقترح:** لا يوجد keyboard trap، كل dialog له اسم واضح، وكل action icon-only له accessible name.

---

# 10. Security Review

## تم إغلاقه
- Stored/imported XSS في السبحة.
- cross-namespace storage writes في import.
- inline executable JavaScript في الصفحات التي تمت مراجعتها.
- CSP script policy أصبحت أكثر صرامة.

## ضوابط مستمرة
- لا تسمح لأي user/import/remote string بالمرور إلى `innerHTML` بدون sanitizer/escaping.
- أي backup format جديد يجب أن يستخدم allowlist للمفاتيح + schema/version + limits.
- لا تضف secrets إلى frontend أو GitHub Pages.
- GitHub Pages يعطي HTTPS، لكن response headers المتقدمة محدودة مقارنة بخادم تتحكم فيه؛ إذا انتقل الاستضافة لاحقًا، فعّل headers مثل Permissions-Policy وغيرها على مستوى HTTP.

---

# 11. Forms / RTL / Error Handling

## Forms
- labels/aria-labels تحسنت.
- حقول الهاتف 16px على mobile.
- السبحة تستخدم limits واضحة للمدخلات/الملفات.

## RTL
- التطبيق عربي RTL فعليًا وليس مجرد قلب عام لكل شيء.
- تم إصلاح سهم حصن المسلم غير المتسق.
- يجب اختبار strings المختلطة (URL/أرقام/تواريخ/إنجليزي) على أجهزة فعلية.

## Errors
- التطبيق local-first يقلل حالات API server التقليدية.
- يجب أن تبقى رسائل network/download/import باللغة البشرية، بدون stack traces أو أخطاء خام.
- retry يجب أن يكون bounded ولا يتحول إلى loop دائم.

---

# 12. App State / Data Safety

الحالة المحلية وbackup/restore من نقاط قوة المنتج. الاختبارات الحرجة التي يجب الحفاظ عليها:
- refresh/reopen لا يفقد إعدادات المستخدم.
- update للـService Worker لا يغير `dataSchema` أو يمسح بيانات.
- import فاسد يفشل بأمان.
- أي migration مستقبلية قابلة للرجوع أو التحقق قبل commit.
- «أكمل من حيث توقفت» يحتفظ بأولوية الاختيار الحالية.

---

# 13. Automated Testing Strategy

## Unit / pure logic
- sanitizers/escapers.
- backup key allowlists.
- version/schema parsing.
- route/view selection.
- date/history calculations.

## Static regression
موجود حاليًا ويجب أن يبقى blocking:
- syntax.
- project validation.
- performance budgets.
- first-entry content.
- search-index consistency.
- production-readiness security/PWA/a11y invariants.

## E2E عالي القيمة
1. first load → onboarding → today.
2. direct subpage → content appears first entry.
3. global search → result → back.
4. Quran read/save/resume.
5. offline download → airplane/offline → reopen standalone.
6. add custom tasbih → count → reload → stats.
7. malicious-ish import fixtures لا تنفذ HTML ولا تكتب خارج `tas:`.
8. settings/profile persist after reload.
9. backup → mutate → restore.
10. SW update while app open.

لا تحاول snapshot كل pixel؛ اختبر business-critical behavior ثم استخدم visual regression على 5–8 شاشات مرجعية فقط.

---

# 14. QA Device Matrix

| الجهاز | المتصفح/الوضع | الأولوية | السيناريوهات |
|---|---|---:|---|
| iPhone حديث | Safari + Installed PWA | P0 | install, safe area, keyboard, dialogs, offline/update |
| iPhone صغير | Safari | P0 | 320–375px, wrapping, bottom nav, input zoom |
| Pixel حديث | Chrome + Installed PWA | P0 | back button, offline, update, performance |
| Samsung/Redmi متوسط | Chrome | P0 | CPU/main-thread, scrolling, search, Quran |
| iPad | Safari portrait/landscape | P1 | dialogs, width, rotation, keyboard |
| Android tablet | Chrome | P1 | responsive width/navigation |
| Desktop | Chrome | P1 | keyboard/focus, storage, install support |
| macOS | Safari | P1 | WebKit behavior, keyboard, layout |

Viewport smoke: 320, 360, 375, 390, 412, 430, 768, 1024, 1440+، مع portrait/landscape حيث ينطبق.

---

# 15. Product UX / Design Consistency

## هل يفهم المستخدم التطبيق سريعًا؟
نعم نسبيًا بسبب bottom navigation والعناوين العربية المباشرة، لكن كثرة المحتوى تجعل “الهدف الأول” مختلفًا حسب المستخدم. «يومي» يجب أن يظل نقطة الدخول البسيطة بدل تحويل الشاشة الأولى إلى فهرس شامل.

## Design system
المشروع يستخدم بالفعل tokens/قواعد مشتركة للألوان/المسافات/اللمس. الخطوة التالية ليست redesign؛ بل استخراج tokens ومكونات reusable أكثر وضوحًا أثناء modularization، خصوصًا dialogs/buttons/loading/error states.

## Loading
لا تضف full-screen spinner لكل شيء. الأفضل المحافظة على المحتوى المحلي فورًا، واستخدام skeleton/progress فقط للموارد التي تُنزّل فعليًا.

---

# 16. Prioritized Roadmap

## Phase 1 — Critical release gate
1. تشغيل GitHub Actions بالكامل وتثبيت نجاح E2E.
2. iPhone + Android smoke الحقيقي.
3. فحص update من cache سابق إلى `20260824-r58-prod1`.
4. قياس LCP/INP/CLS على GitHub Pages.
5. لا نشر إذا ظهر regression في data restore/offline/direct-entry.

## Phase 2 — Quick UX wins
1. contextual install education بدون prompt عدواني.
2. إظهار حالة تنزيل/جاهزية “المكتبة offline” إن كانت ميزة معلنة.
3. VoiceOver/TalkBack pass وإغلاق أي focus/label gaps.
4. تحسين tablet widths للشاشات التي تستفيد فقط.

## Phase 3 — Performance
1. تقسيم `app.js` حسب feature.
2. dynamic import لميزات نادرة الفتح.
3. تقليل HTML/CSS الأولي تدريجيًا.
4. performance traces على Android متوسط.
5. CI budget منفصل للـinitial executed JS، لا الحجم وحده.

## Phase 4 — Native App Experience
1. transitions قصيرة مرتبطة بتغيير الحالة/المكان فقط.
2. scroll-position restoration شامل.
3. optimistic feedback لكل فعل local بسيط.
4. bottom sheets/context menus حيث تقلل خطوات فعلًا.
5. haptic-like visual feedback بدون إسراف في animation.

## Phase 5 — Polish
1. link health scheduled check.
2. wide PWA screenshot.
3. desktop/tablet refinements.
4. visual regression محدود.
5. توثيق release checklist في PR template.

---

# 17. التحدي النهائي — ما الذي سيجعله يبدو “موقعًا” أمام تطبيق Native ممتاز؟

| # | الفرق | خطة الإزالة |
|---:|---|---|
| 1 | كتلة JS/HTML كبيرة في البداية | Feature modules + dynamic import + budget للـexecuted JS. |
| 2 | انتقالات الشاشات أقل اتساقًا من native | Motion tokens + transitions مكانية قصيرة مع reduced-motion. |
| 3 | اكتشاف التثبيت يعتمد على المتصفح | Contextual install education بعد لحظة قيمة، وشرح iOS خاص. |
| 4 | جاهزية المحتوى offline غير مرئية | Download/readiness center بسيط مع الحجم والحالة والإزالة. |
| 5 | بعض عروض tablet/desktop تبدو “هاتفًا مكبرًا” | Layouts أوسع انتقائيًا دون كسر هوية mobile-first. |
| 6 | لا يوجد device-farm gate دائم | Playwright + جهازين حقيقيين لكل release مهم، ثم cloud devices عند الحاجة. |
| 7 | form controls تتأثر باختلافات المتصفح | توحيد wrappers/feedback مع الحفاظ على native inputs عندما تكون أفضل. |
| 8 | بعض القوائم/المحتوى الطويل قد يضغط main thread | progressive rendering/windowing فقط حيث traces تثبت الحاجة. |
| 9 | لا توجد قياسات أداء ميدانية ثابتة | synthetic CI + قياس privacy-conscious Web Vitals بدون تحويل المنتج إلى tracking-heavy app. |
| 10 | الاستضافة static تحد من headers/edge behavior | ابقَ على Pages طالما مناسب؛ انتقل لاستضافة قابلة لضبط headers فقط إذا ظهر احتياج حقيقي. |

---

# 18. Final Verdict

**الحزمة الحالية: GitHub-ready Release Candidate.**  
**المشكلات Critical المعروفة من الفحص الحالي: 0 مفتوحة بعد الإصلاح.**  
**الشرط الوحيد قبل وصفها Production-verified:** نجاح browser E2E خارج هذه البيئة + smoke على iPhone/Android + قياسات Core Web Vitals على النسخة المنشورة.

لا أنصح بإعادة تصميم أو rewrite الآن. أفضل عائد للإصدار التالي هو modularization تدريجي لـ`app.js`، قياسات أداء فعلية، واختبارات أجهزة حقيقية، مع الحفاظ على هوية وتجربة R58 الحالية.
