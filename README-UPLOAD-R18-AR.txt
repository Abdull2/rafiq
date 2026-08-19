تدارُك - Tadaruq — تحديث R18

1) تحديث تطبيق GitHub Pages:
   ارفع ملفات حزمة tadaruq-v24-r18-github-update.zip إلى مستودع Abdull2/rafiq واستبدل الملفات المناظرة.

2) إصلاح ظهور abdull2.github.io أعلى تطبيق Google Play (TWA):
   مهم: Digital Asset Links لا يعمل من /rafiq/.well-known/.
   يجب أن يكون الملف متاحًا على الرابط بالضبط:
   https://abdull2.github.io/.well-known/assetlinks.json

   لذلك أنشئ أو استخدم مستودع GitHub باسم:
   Abdull2/Abdull2.github.io

   ثم ارفع محتويات حزمة tadaruq-assetlinks-abdull2-github-io.zip إليه كما هي:
   .nojekyll
   .well-known/assetlinks.json

   لا تمسح أي موقع شخصي موجود في هذا المستودع إن كان موجودًا؛ أضف/استبدل الملفين المطلوبين فقط.

3) بعد نشر GitHub Pages، افتح الرابط التالي بنفسك:
   https://abdull2.github.io/.well-known/assetlinks.json
   لازم يظهر JSON ويحتوي على:
   package_name = com.tadaruqnoor.rafiq
   SHA-256 يبدأ بـ 6D:02:CB:A8...

4) بعدها اقفل تطبيق الاختبار وChrome بالكامل وافتح التطبيق من جديد. لو ظل شريط Chrome ظاهرًا، انتظر قليلًا بسبب الكاش ثم جرّب إعادة تثبيت نسخة الاختبار من Google Play.

5) لا تحتاج AAB جديد لهذا الإصلاح طالما رابط TWA والـpackage لم يتغيرا.
