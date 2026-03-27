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
