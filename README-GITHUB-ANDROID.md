# رفيق يومك — GitHub Android CI

هذا المجلد يضيف Build/Test تلقائي لتطبيق Android TWA بدون تغيير ملفات موقعك الحالية.

## 1) ارفع الملفات إلى نفس Repository الخاص بالموقع

ارفع هذه العناصر في جذر الريبو:

- `.github/workflows/android-build.yml`
- `android/twa-manifest.json`
- `scripts/`
- `.gitignore` (ادمج محتواه مع ملفك الحالي إن كان موجودًا)

لا ترفع `signing.keystore` إلى GitHub أبدًا.

## 2) أضف GitHub Secrets

من Repository > Settings > Secrets and variables > Actions > New repository secret.

أضف 3 Secrets:

- `ANDROID_KEYSTORE_BASE64`: محتوى ملف `signing.keystore` بعد تحويله إلى Base64.
- `ANDROID_KEYSTORE_PASSWORD`: كلمة مرور الـ keystore من ملف `signing-key-info.txt` الموجود في باكدج PWABuilder القديم.
- `ANDROID_KEY_PASSWORD`: كلمة مرور المفتاح من نفس الملف.

### تحويل signing.keystore إلى Base64

Windows PowerShell:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("signing.keystore")) | Set-Clipboard
```

macOS:

```bash
base64 < signing.keystore | pbcopy
```

Linux:

```bash
base64 -w 0 signing.keystore
```

الصق الناتج كقيمة `ANDROID_KEYSTORE_BASE64` فقط داخل GitHub Secret.

## 3) شغل البناء

من GitHub:

Actions > **Build & Test Rafiq Android** > Run workflow

اكتب مثلًا `1.0.0` في Version name ثم Run.

الـ workflow يقوم تلقائيًا بـ:

1. تثبيت Package ID على `io.github.abdull2.rafiq`.
2. استخدام Bubblewrap `1.25.0`.
3. التأكد من `targetSdkVersion 36` قبل البناء.
4. بناء APK وAAB موقعين بالمفتاح الخاص بك.
5. قراءة Package ID من الـAAB نفسه بواسطة bundletool والتأكد أنه `io.github.abdull2.rafiq`.
6. فحص توقيع الـAAB.
7. تشغيل APK داخل Android Emulator والتأكد من أنه قابل للتثبيت والتشغيل.
8. رفع Screenshot من اختبار الـEmulator.

## 4) تنزيل النتيجة

بعد نجاح الـWorkflow ستجد في Artifacts:

- `rafiq-release.aab` — الملف الذي يرفع إلى Google Play.
- `rafiq-release.apk` — للتجربة على Android.
- `assetlinks.json` — Digital Asset Links.
- `twa-manifest-built.json` — إعدادات النسخة التي تم بناؤها.
- `SHA256SUMS.txt` — بصمات الملفات.

## 5) مهم جدًا: assetlinks.json

لأن التطبيق يفتح:

`https://abdull2.github.io/rafiq/`

فـ Android يتحقق من Digital Asset Links على أصل الـhost:

`https://abdull2.github.io/.well-known/assetlinks.json`

وليس داخل:

`https://abdull2.github.io/rafiq/.well-known/assetlinks.json`

الملف `.well-known/assetlinks.json` الموجود في هذا الباكدج جاهز بالـPackage ID الجديد وبصمة مفتاح الرفع الحالي. يجب نشره على جذر `abdull2.github.io`.

بعد تفعيل **Google Play App Signing**، أضف SHA-256 الخاص بـ **App signing certificate** من Play Console إلى نفس مصفوفة `sha256_cert_fingerprints` مع إبقاء بصمة مفتاحك الحالي.

## 6) الإصدارات القادمة

لا تعدّل `appVersionCode` يدويًا. الـWorkflow يستخدم `github.run_number` كـVersion Code لكي يزيد تلقائيًا في كل Build.

غيّر فقط Version name عند تشغيل الـWorkflow مثل:

- `1.0.0`
- `1.0.1`
- `1.1.0`

## حدود اختبار الـEmulator

اختبار GitHub يتأكد أن APK يثبت وأن Package ID صحيح وأن Launcher يعمل. التحقق النهائي من أن الـTWA تفتح Full Screen بلا شريط متصفح يعتمد أيضًا على نشر `assetlinks.json` الصحيح، لذلك بعد نشره جرّب APK على موبايل Android حقيقي مرة واحدة قبل Play Production.
