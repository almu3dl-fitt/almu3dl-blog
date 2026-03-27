# المعضّل - Almu3dl

مدونة عربية احترافية مبنية بـ Next.js 16 وTypeScript وTailwind CSS وPrisma، موجهة لمحتوى اللياقة والتغذية الرياضية وخسارة الدهون وبناء العضلات والمكملات والصحة العامة.

## التقنية المستخدمة

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma + `@prisma/adapter-pg`
- PostgreSQL / Supabase

## بنية المشروع

- `app/`
  - المسارات الأساسية: `/`, `/articles`, `/articles/[slug]`, `/about`, `/contact`, `/privacy`
- `components/`
  - مكونات الواجهة المشتركة مثل الهيدر والفوتر وبطاقات المقال
- `lib/`
  - طبقة البيانات ومساعدات الـ slug والتصنيفات
- `prisma/`
  - `schema.prisma`, migrations, و`seed.ts`
- `public/articles/categories/`
  - صور SVG تصنيفية محلية تستخدم كحل بصري ثابت وfallback للأغلفة

## التشغيل المحلي

1. ثبّت الاعتماديات:

```bash
npm install
```

2. جهّز متغيرات البيئة في `.env`:

```bash
DATABASE_URL=...
```

3. شغّل المشروع:

```bash
npm run dev
```

4. افتح:

```text
http://localhost:3000
```

## أوامر مهمة

```bash
npm run dev
npm run lint
npm run build
npm run db:seed
```

## جاهزية النشر والاستضافة

- المتغير الإلزامي الوحيد لتشغيل التطبيق هو:
  - `DATABASE_URL`
- المتغير الموصى به للإنتاج:
  - `NEXT_PUBLIC_SITE_URL`
- الحد الأدنى المطلوب لـ Node.js هو:
  - `20.9.0+`
- ملف `.env.example` موجود ليكون مرجعًا سريعًا للإعداد.

### خطوات نشر موصى بها

1. اضبط متغيرات البيئة على منصة الاستضافة:

```bash
DATABASE_URL=...
NEXT_PUBLIC_SITE_URL=https://almu3dl.com
```

2. تأكد أن البناء ينجح محليًا:

```bash
npm run lint
npm run build
```

3. في أي deploy جديد، سيتم تشغيل:

```bash
prisma generate
```

وذلك عبر `postinstall` لضمان جاهزية Prisma Client في بيئات مثل Vercel.

4. إذا أضفت migrations جديدة مستقبلًا، نفّذها بشكل واعٍ قبل أو أثناء الإطلاق:

```bash
npx prisma migrate deploy
```

ولا يُنصح بجعلها خطوة تلقائية داخل كل build ما لم تكن لديك pipeline واضحة لذلك.

### ملاحظات إنتاجية مهمة

- الصفحة الرئيسية الآن تعيد التحقق دوريًا بدل أن تتجمد على لحظة build واحدة.
- تم إضافة `app/robots.ts` و`app/sitemap.ts` لتجهيز الفهرسة.
- إذا كانت الاستضافة على Vercel، يمكن للتطبيق استخدام `NEXT_PUBLIC_SITE_URL` أو متغيرات Vercel النظامية كمرجع لعنوان الموقع.
- أسرار البيئة غير متتبعة داخل Git بسبب تجاهل `.env*`.

## ملاحظات البيانات

- الـ seed الحالي يحتوي 81 مقالًا.
- توجد slugs percent-encoded في جزء من المحتوى، ولذلك طبقة البيانات تتعامل مع:
  - `slug` الخام
  - `decodeURIComponent`
  - المطابقة المطبعة normalized matching
- صور المقالات الأصلية ليست معتمدة كأساس تشغيلي، والواجهة تستخدم fallback محليًا حسب التصنيف عند الحاجة.

## ملاحظات الدمج

- الفرع الحالي يمثل بناء Next.js الحقيقي للمشروع.
- قبل دمجه إلى `main` يجب الانتباه إلى أن `origin/main` الحالي يملك تاريخًا مختلفًا وغير متصل بهذه الشجرة، لذلك الدمج يحتاج قرارًا واعيًا حول:
  - الاستبدال الكامل
  - أو توحيد التاريخين
  - أو اعتماد هذا الفرع كأساس جديد
