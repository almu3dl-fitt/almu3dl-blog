"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSlug } from "@/lib/slug";
import { getCategoryDefinitionByName } from "@/lib/site";

interface Category {
  id: number;
  name: string;
}

interface ArticleTemplate {
  id: number;
  title: string;
  categoryId: number;
  sections?: Section[];
}

export interface Section {
  heading: string;
  anchor: string;
  content: string;
  sortOrder: number;
}

export interface ArticleFormInitialData {
  title: string;
  excerpt?: string;
  categoryId: number;
  coverImageUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  status?: string;
  publishedAt?: string;
  sections?: Section[];
}

interface ArticleFormProps {
  articleId?: number;
  initialData?: ArticleFormInitialData;
}

export default function ArticleForm({
  articleId,
  initialData,
}: ArticleFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [articleTemplates, setArticleTemplates] = useState<ArticleTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fieldClassName =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500";

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    excerpt: initialData?.excerpt || "",
    categoryId: initialData?.categoryId || "",
    coverImageUrl: initialData?.coverImageUrl || "",
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    status: initialData?.status || "draft", // draft, pending_approval, published
    sections: initialData?.sections || [
      { heading: "", anchor: "", content: "", sortOrder: 0 },
    ],
  });

  useEffect(() => {
    if (!initialData) return;

    setFormData({
      title: initialData.title || "",
      excerpt: initialData.excerpt || "",
      categoryId: initialData.categoryId || "",
      coverImageUrl: initialData.coverImageUrl || "",
      seoTitle: initialData.seoTitle || "",
      seoDescription: initialData.seoDescription || "",
      status: initialData.status || "draft",
      sections: initialData.sections?.length
        ? initialData.sections
        : [{ heading: "", anchor: "", content: "", sortOrder: 0 }],
    });
  }, [initialData]);

  useEffect(() => {
    async function fetchFormOptions() {
      try {
        const requests = [fetch("/api/admin/categories")];

        if (!articleId) {
          requests.push(fetch("/api/admin/articles?status=published"));
        }

        const responses = await Promise.all(requests);
        const [categoriesResponse, templatesResponse] = responses;

        if (!categoriesResponse.ok) {
          throw new Error("Failed to fetch categories");
        }

        const categoryData = (await categoriesResponse.json()) as Category[];
        setCategories(categoryData);

        if (templatesResponse) {
          if (!templatesResponse.ok) {
            throw new Error("Failed to fetch article templates");
          }

          const templateData = (await templatesResponse.json()) as ArticleTemplate[];
          setArticleTemplates(templateData);
        }
      } catch (err) {
        setError("فشل تحميل بيانات النموذج");
        console.error(err);
      }
    }

    void fetchFormOptions();
  }, [articleId]);

  function handleInputChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  function handleSectionChange(
    index: number,
    field: keyof Section,
    value: string | number
  ) {
    const newSections = [...formData.sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setFormData((prev) => ({ ...prev, sections: newSections }));
  }

  function handleSectionHeadingBlur(index: number) {
    const currentSection = formData.sections[index];

    if (!currentSection || currentSection.anchor.trim()) {
      return;
    }

    const nextAnchor = createSlug(currentSection.heading.trim());
    if (!nextAnchor) {
      return;
    }

    handleSectionChange(index, "anchor", nextAnchor);
  }

  function addSection() {
    setFormData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          heading: "",
          anchor: "",
          content: "",
          sortOrder: prev.sections.length,
        },
      ],
    }));
  }

  function removeSection(index: number) {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  }

  function applyArticleTemplate() {
    const template = articleTemplates.find(
      (articleTemplate) => String(articleTemplate.id) === selectedTemplateId,
    );

    if (!template) {
      setError("اختر مقالاً موجوداً لنسخ تنظيمه أولاً");
      return;
    }

    const nextSections =
      template.sections?.length
        ? template.sections.map((section, index) => ({
            heading: section.heading,
            anchor: createSlug(section.heading) || `section-${index + 1}`,
            content: "",
            sortOrder: index + 1,
          }))
        : [{ heading: "المقدمة", anchor: "introduction", content: "", sortOrder: 1 }];

    setFormData((prev) => ({
      ...prev,
      categoryId: String(template.categoryId),
      sections: nextSections,
    }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!formData.title.trim()) {
        setError("العنوان مطلوب");
        setLoading(false);
        return;
      }

      if (!formData.categoryId) {
        setError("الفئة مطلوبة");
        setLoading(false);
        return;
      }

      const url = articleId
        ? `/api/admin/articles/${articleId}`
        : "/api/admin/articles";
      const method = articleId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "فشل حفظ المقالة");
      }

      await res.json();
      router.push("/admin/articles");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "فشل حفظ المقالة"
      );
    } finally {
      setLoading(false);
    }
  }

  const selectedCategoryName =
    categories.find((category) => String(category.id) === String(formData.categoryId))?.name ?? "";
  const coverPreviewSrc =
    formData.coverImageUrl.trim() ||
    (selectedCategoryName
      ? getCategoryDefinitionByName(selectedCategoryName).imagePath
      : "");

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-6">المعلومات الأساسية</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العنوان *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="أدخل عنوان المقالة"
              maxLength={200}
              className={fieldClassName}
              required
            />
            <p className="text-gray-500 text-xs mt-1">
              {formData.title.length}/200
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الملخص
            </label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              placeholder="ملخص قصير للمقالة"
              rows={3}
              maxLength={500}
              className={fieldClassName}
            />
            <p className="text-gray-500 text-xs mt-1">
              {formData.excerpt.length}/500
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الفئة *
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className={fieldClassName}
                required
              >
                <option value="">اختر فئة</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                صورة الغلاف (رابط)
              </label>
              <input
                type="text"
                name="coverImageUrl"
                value={formData.coverImageUrl}
                onChange={handleInputChange}
                placeholder="/articles/example-cover.png أو https://example.com/image.jpg"
                className={fieldClassName}
              />
              <p className="text-gray-500 text-xs mt-1">
                استخدم صورة محلية من `public/` أو رابط صورة خارجي مباشر بصيغة PNG أو JPG.
              </p>
              {coverPreviewSrc && (
                <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
                  <Image
                    src={coverPreviewSrc}
                    alt="معاينة صورة الغلاف"
                    width={1200}
                    height={640}
                    className="h-40 w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SEO Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-6">معلومات SEO</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عنوان SEO
            </label>
            <input
              type="text"
              name="seoTitle"
              value={formData.seoTitle}
              onChange={handleInputChange}
              placeholder="العنوان المستخدم في محركات البحث"
              maxLength={60}
              className={fieldClassName}
            />
            <p className="text-gray-500 text-xs mt-1">
              {formData.seoTitle.length}/60
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وصف SEO
            </label>
            <textarea
              name="seoDescription"
              value={formData.seoDescription}
              onChange={handleInputChange}
              placeholder="الوصف المستخدم في محركات البحث"
              rows={2}
              maxLength={160}
              className={fieldClassName}
            />
            <p className="text-gray-500 text-xs mt-1">
              {formData.seoDescription.length}/160
            </p>
          </div>
        </div>
      </div>

      {!articleId && articleTemplates.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4">البدء من مقال قديم</h2>
          <p className="text-sm leading-7 text-gray-600 mb-4">
            اختر مقالاً منشوراً لنسخ نفس تنظيم الأقسام وترتيبها في المقالة الجديدة.
          </p>
          <div className="flex flex-col gap-4 md:flex-row">
            <select
              value={selectedTemplateId}
              onChange={(event) => setSelectedTemplateId(event.target.value)}
              className={fieldClassName}
            >
              <option value="">اختر مقالاً قديماً</option>
              {articleTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={applyArticleTemplate}
              className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
            >
              نسخ تنظيم المقال
            </button>
          </div>
        </div>
      )}

      {/* Content Sections */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">محتوى المقالة</h2>
          <button
            type="button"
            onClick={addSection}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
          >
            + قسم جديد
          </button>
        </div>

        <div className="space-y-6">
          {formData.sections.map((section, index) => (
            <div
              key={index}
              className="p-4 border border-gray-300 rounded-lg space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-900">القسم {index + 1}</h3>
                {formData.sections.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSection(index)}
                    className="text-red-600 hover:text-red-800 font-medium text-sm"
                  >
                    حذف
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder="عنوان القسم"
                value={section.heading}
                onChange={(e) =>
                  handleSectionChange(index, "heading", e.target.value)
                }
                onBlur={() => handleSectionHeadingBlur(index)}
                className={fieldClassName}
              />

              <input
                type="text"
                placeholder="المرساة (anchor) - ستُنشأ تلقائياً إن تُركت فارغة"
                value={section.anchor}
                onChange={(e) =>
                  handleSectionChange(index, "anchor", e.target.value)
                }
                className={fieldClassName}
              />

              <textarea
                placeholder="محتوى القسم"
                value={section.content}
                onChange={(e) =>
                  handleSectionChange(index, "content", e.target.value)
                }
                rows={6}
                className={fieldClassName}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ترتيب الظهور
                </label>
                <input
                  type="number"
                  value={section.sortOrder}
                  onChange={(e) =>
                    handleSectionChange(
                      index,
                      "sortOrder",
                      parseInt(e.target.value)
                    )
                  }
                  className={fieldClassName}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Publishing Options */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-6">حالة النشر</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              حالة المقالة
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className={fieldClassName}
            >
              <option value="draft">مسودة (لم تُحفظ)</option>
              <option value="pending_approval">قيد الانتظار (تحتاج موافقة)</option>
              <option value="published">منشورة</option>
            </select>
            <p className="text-gray-500 text-sm mt-2">
              {formData.status === "draft" && "المقالة محفوظة محلياً فقط - لن تظهر للزوار"}
              {formData.status === "pending_approval" && "المقالة بانتظار موافقة المشرف - لن تظهر للزوار حتى الموافقة"}
              {formData.status === "published" && "المقالة ستكون متاحة للزوار فوراً"}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              💡 <strong>نصيحة:</strong> استخدم حالة الانتظار إذا أردت أن يراجع
              المشرف المقالة قبل النشر
            </p>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg transition-colors"
        >
          {loading ? "جاري الحفظ..." : articleId ? "حفظ التغييرات" : "إنشاء المقالة"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}
