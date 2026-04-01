# دليل البدء السريع - Admin Panel Quick Start

## ما تم إنشاؤه

تم إنشاء لوحة تحكم كاملة لإدارة المقالات مع المميزات التالية:

### 📁 الملفات والمجلدات الجديدة

#### API Routes
- `app/api/admin/articles/route.ts` - إنشاء وعرض جميع المقالات
- `app/api/admin/articles/[id]/route.ts` - تعديل وحذف مقالة واحدة
- `app/api/admin/categories/route.ts` - عرض الفئات

#### Admin Pages
- `app/admin/layout.tsx` - تصميم لوحة التحكم
- `app/admin/page.tsx` - لوحة التحكم الرئيسية (إحصائيات)
- `app/admin/articles/page.tsx` - قائمة المقالات
- `app/admin/articles/new/page.tsx` - إنشاء مقالة جديدة
- `app/admin/articles/[id]/edit/page.tsx` - تعديل مقالة

#### Components
- `components/article-form.tsx` - نموذج إنشاء/تعديل المقالات

#### Documentation
- `ADMIN_PANEL.md` - التوثيق الكامل
- `QUICK_START.md` - هذا الملف

---

## الخطوات للبدء

### 1. التأكد من البيئة
```bash
# التأكد من وجود اتصال بقاعدة البيانات
# تأكد من أن متغيرات البيئة مضبوطة في .env

# يجب أن تحتوي على:
DATABASE_URL="postgresql://user:password@localhost:5432/almu3dl_blog"
```

### 2. تشغيل الخادم
```bash
# تثبيت المتطلبات (إن لم تكن مثبتة)
npm install

# تشغيل خادم التطوير
npm run dev
```

### 3. الوصول إلى لوحة التحكم
```
http://localhost:3000/admin
```

---

## الروابط الرئيسية

| الصفحة | الرابط | الوصف |
|-------|--------|-------|
| لوحة التحكم | `/admin` | عرض الإحصائيات |
| المقالات | `/admin/articles` | قائمة جميع المقالات |
| مقالة جديدة | `/admin/articles/new` | إنشاء مقالة |
| تعديل مقالة | `/admin/articles/[id]/edit` | تحديث مقالة موجودة |

---

## مثال عملي: إنشاء مقالة

### الخطوة 1: اذهب للصفحة
انتقل إلى `http://localhost:3000/admin/articles/new`

### الخطوة 2: ملء النموذج

**المعلومات الأساسية:**
- العنوان: "نصائح تغذية رياضية فعّالة"
- الملخص: "اكتشف أفضل الممارسات الغذائية..."
- الفئة: اختر "تغذية رياضية"
- صورة الغلاف: أضف رابط الصورة

**معلومات SEO:**
- عنوان SEO: "نصائح التغذية الرياضية - المعضّل"
- وصف SEO: "دليل شامل لأفضل ممارسات التغذية للرياضيين"

**المحتوى:**
- أضف أقسام متعددة لمحتوى المقالة

**النشر:**
- اختر "نشر المقالة الآن" للنشر الفوري

### الخطوة 3: انقر حفظ

✅ تم إنشاء المقالة بنجاح!

---

## API Examples

### إنشاء مقالة برمجياً

```javascript
const response = await fetch('/api/admin/articles', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'عنوان المقالة',
    excerpt: 'ملخص المقالة',
    categoryId: 1,
    seoTitle: 'SEO Title',
    seoDescription: 'SEO Description',
    sections: [
      {
        heading: 'المقدمة',
        anchor: 'introduction',
        content: 'محتوى المقدمة...',
        sortOrder: 0
      }
    ],
    publishNow: true
  })
});
```

### الحصول على جميع المقالات

```javascript
const response = await fetch('/api/admin/articles');
const articles = await response.json();
```

### تحديث مقالة

```javascript
const response = await fetch('/api/admin/articles/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ /* updated data */ })
});
```

### حذف مقالة

```javascript
const response = await fetch('/api/admin/articles/1', {
  method: 'DELETE'
});
```

---

## نصائح مهمة

1. **تحديث الصور**: الأفضل استخدام CDN خارجي لرفع الصور
2. **المراسي (Anchors)**: استخدم أسماء بسيطة وفريدة
3. **SEO**: استخدم كلمات مفتاحية ذات صلة
4. **التدرج**: ابدأ بمقالات قليلة ثم طور النظام

---

## استكشاف الأخطاء

### المقالة لا تُحفظ
- تحقق من إدخال العنوان والفئة
- تأكد من اتصال قاعدة البيانات

### لا تظهر المقالات
- اطلب تحديث الصفحة (F5)
- تحقق من لوحة المتصفح (Console) للأخطاء

### مشاكل مع الصور
- استخدم روابط مطلقة (https://...)
- تأكد من أن الصورة متاحة على الإنترنت

---

## الخطوات التالية

### الإضافات المقترحة:
1. ✅ نظام المصادقة (Authentication)
2. ✅ رفع الصور مباشرة
3. ✅ محرر نصوص غني (Rich Text Editor)
4. ✅ جدولة النشر
5. ✅ إحصائيات المشاهدات

---

## التواصل والدعم

للمساعدة في تطوير النظام أو إضافة مميزات جديدة، يمكنك التواصل مع فريق التطوير.

---

**تم إنشاؤه**: أبريل 2026
**الإصدار**: 1.0.0
