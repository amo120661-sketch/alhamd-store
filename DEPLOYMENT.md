# النشر على GitHub Pages — المتجر

الرابط: https://amo120661-sketch.github.io/alhamd-store/

المجلد `docs/` يحتوي النسخة الثابتة الجاهزة (GitHub Pages يقرأ من `/docs` على الفرع `main`).

## مهم
GitHub Pages يقدّم ملفات ثابتة فقط، لذلك الواجهة تعمل للتصفح والسلة، لكن الطلبات التي تحتاج سيرفر (`/api/orders`, `/api/auth/*`, `/api/chat`, `/api/support`, لوحة الإدارة) لن تعمل إلا بعد نشر `server.ts` على استضافة تدعم Node.js وضبط متغير `VITE_API_BASE` عند البناء.

## إعادة البناء
```bash
npm install --legacy-peer-deps
npx vite build --base /alhamd-store/
# ثم انسخ محتويات dist/ إلى docs/ واسخ src/assets/images إلى docs/src/assets/images
```
لربط سيرفر خلفي:
```bash
VITE_API_BASE=https://your-backend.example npx vite build --base /alhamd-store/
```
ثم أضف نطاق `amo120661-sketch.github.io` إلى Authorized Domains فيFirebase Auth if Google sign-in is used.
