# Hassana Web

واجهة ومتجر بيطري مبني على Next.js App Router مع MongoDB ولوحة تحكم محمية ومسارات API للنشر على Vercel.

## التشغيل المحلي

```bash
npm install
npm run dev
```

## النشر على Vercel

المشروع ينفع يشتغل على Vercel مع مسارات السيرفر والـ API routes، مع هذه الملاحظات:

1. القراءة والكتابة على قاعدة البيانات تعتمد على MongoDB Atlas أو أي MongoDB متاح خارجيًا.
2. رفع الصور على Vercel يحتاج `Vercel Blob` لأن نظام الملفات المحلي في Functions غير دائم.
3. حماية لوحة التحكم تعمل الآن عبر `proxy.ts` المتوافق مع Next.js 16.

### Environment Variables

أضف هذه المتغيرات داخل Project Settings في Vercel:

```bash
DASHBOARD_PASSWORD=...
DASHBOARD_SECRET=...
MONGODB_URI=...
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_WHATSAPP_CONTACTS=الرقم الأول:966502343985,الرقم الثاني:966505298914
BLOB_READ_WRITE_TOKEN=...
```

### خطوات النشر

1. ارفع المشروع إلى GitHub.
2. اعمل Import للمستودع داخل Vercel.
3. أضف Environment Variables.
4. إذا كنت تحتاج رفع صور من لوحة التحكم، فعّل Vercel Blob وخذ `BLOB_READ_WRITE_TOKEN`.
5. نفّذ أول Seed بعد النشر إذا كانت قاعدة البيانات فارغة.

### Sitemap و Robots

بعد تشغيل `npm run build` سيتم توليد `sitemap.xml` و `robots.txt` تلقائيًا بواسطة `next-sitemap`.

- الرابط الرئيسي الذي ترفعه في Google Search Console هو: `/sitemap.xml`
- الدومين الافتراضي الحالي للإنتاج هو: `https://www.hassana-ksa.com`
- إذا احتجت تغييره لاحقًا، استخدم `NEXT_PUBLIC_SITE_URL` قبل الـ production build

### ملاحظات مهمة

1. لو لم تضف `BLOB_READ_WRITE_TOKEN` على Vercel، رفع الصور من `/api/upload` سيرجع رسالة خطأ واضحة بدل نجاح وهمي.
2. لو MongoDB بطيئة، القراءة العامة ما زالت تملك fallback للبيانات الثابتة، لكن عمليات الإدارة تحتاج اتصال Mongo صالح.
3. روابط واتساب المتعددة تعتمد على `NEXT_PUBLIC_WHATSAPP_CONTACTS`.
