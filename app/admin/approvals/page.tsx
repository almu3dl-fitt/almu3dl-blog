"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getCategoryDefinitionByName } from "@/lib/site";

type ApprovalItemSource = "database" | "draft";

interface PendingArticle {
  id: string;
  source: ApprovalItemSource;
  title: string;
  excerpt: string;
  category: { name: string };
  submittedAt: string | null;
  status: string;
  reviewHref: string | null;
  fileName: string | null;
}

interface ApprovalReviewSection {
  id: string;
  heading: string;
  anchor: string;
  content: string;
  sortOrder: number;
}

interface StoreRecommendation {
  href: string;
  title: string;
  description: string;
  ctaLabel: string;
}

interface ApprovalReview {
  id: string;
  source: ApprovalItemSource;
  title: string;
  slug: string;
  excerpt: string;
  category: { name: string };
  submittedAt: string | null;
  status: string;
  fileName: string | null;
  readingTime: string | null;
  coverImageUrl: string;
  sourceUrl: string | null;
  originalityNote: string;
  storeRecommendation: StoreRecommendation | null;
  editHref: string | null;
  seoTitle: string;
  seoDescription: string;
  sections: ApprovalReviewSection[];
}

interface DraftReviewForm {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  coverImageUrl: string;
  seoTitle: string;
  seoDescription: string;
  sourceUrl: string;
  sections: {
    heading: string;
    content: string;
  }[];
}

function buildDatabaseEditHref(id: string) {
  const articleId = id.replace(/^db:/, "").trim();
  return articleId ? `/admin/articles/${articleId}/edit` : null;
}

function toPendingArticle(review: ApprovalReview): PendingArticle {
  return {
    id: review.id,
    source: review.source,
    title: review.title,
    excerpt: review.excerpt,
    category: review.category,
    submittedAt: review.submittedAt,
    status: review.status,
    reviewHref: null,
    fileName: review.fileName,
  };
}

function toDraftReviewForm(review: ApprovalReview): DraftReviewForm {
  return {
    title: review.title,
    slug: review.slug,
    excerpt: review.excerpt,
    category: review.category.name,
    coverImageUrl: review.coverImageUrl,
    seoTitle: review.seoTitle,
    seoDescription: review.seoDescription,
    sourceUrl: review.sourceUrl ?? "",
    sections:
      review.sections.length > 0
        ? review.sections.map((section) => ({
            heading: section.heading,
            content: section.content,
          }))
        : [{ heading: "", content: "" }],
  };
}

export default function ApprovalsPage() {
  const searchParams = useSearchParams();
  const [articles, setArticles] = useState<PendingArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [review, setReview] = useState<ApprovalReview | null>(null);
  const [reviewLoadingId, setReviewLoadingId] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState("");
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [draftForm, setDraftForm] = useState<DraftReviewForm | null>(null);
  const [draftSaveError, setDraftSaveError] = useState("");
  const [savingDraft, setSavingDraft] = useState(false);
  const draftEditorFieldClassName =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400";

  async function fetchPendingArticles() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/approvals");
      if (!res.ok) throw new Error("Failed to fetch pending articles");

      const data = (await res.json()) as PendingArticle[];
      setArticles(data);
      setReview((currentReview) =>
        currentReview && !data.some((article) => article.id === currentReview.id)
          ? null
          : currentReview,
      );
      setError("");
    } catch (err) {
      setError("فشل تحميل المقالات المعلقة");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchPendingArticles();
  }, []);

  async function loadReview(article: PendingArticle) {
    try {
      setReviewError("");
      setReviewLoadingId(article.id);
      setIsEditingDraft(false);
      setDraftSaveError("");

      const params = new URLSearchParams({
        source: article.source,
        id: article.id,
      });
      const res = await fetch(`/api/admin/approvals?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch approval review");

      const data = (await res.json()) as ApprovalReview;
      setReview(data);
      setDraftForm(data.source === "draft" ? toDraftReviewForm(data) : null);
      return data;
    } catch (err) {
      setReviewError("فشل تحميل معاينة المقالة");
      console.error(err);
      return null;
    } finally {
      setReviewLoadingId(null);
    }
  }

  useEffect(() => {
    const reviewSource = searchParams.get("reviewSource");
    const reviewId = searchParams.get("reviewId");

    if (
      reviewSource &&
      reviewId &&
      (reviewSource === "database" || reviewSource === "draft")
    ) {
      void loadReview({
        id: reviewId,
        source: reviewSource,
        title: "",
        excerpt: "",
        category: { name: "" },
        submittedAt: null,
        status: "",
        reviewHref: null,
        fileName: null,
      });
    }
  }, [searchParams]);

  async function approveArticle(article: PendingArticle) {
    if (!confirm("هل تريد نشر هذه المقالة؟")) return;

    try {
      setActioningId(article.id);
      const res = await fetch("/api/admin/approvals/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: article.id,
          source: article.source,
        }),
      });
      if (!res.ok) throw new Error("Failed to approve article");

      setArticles((currentArticles) =>
        currentArticles.filter((currentArticle) => currentArticle.id !== article.id),
      );

      if (review?.id === article.id) {
        setReview(null);
        setDraftForm(null);
        setIsEditingDraft(false);
      }
    } catch (err) {
      alert("فشل نشر المقالة");
      console.error(err);
    } finally {
      setActioningId(null);
    }
  }

  async function rejectArticle(article: PendingArticle) {
    const reason = prompt("أدخل سبب الرفض (اختياري):");
    if (reason === null) return;

    try {
      setActioningId(article.id);
      const res = await fetch("/api/admin/approvals/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: article.id,
          source: article.source,
          reason: reason || "",
        }),
      });
      if (!res.ok) throw new Error("Failed to reject article");

      setArticles((currentArticles) =>
        currentArticles.filter((currentArticle) => currentArticle.id !== article.id),
      );

      if (review?.id === article.id) {
        setReview(null);
        setDraftForm(null);
        setIsEditingDraft(false);
      }
    } catch (err) {
      alert("فشل رفض المقالة");
      console.error(err);
    } finally {
      setActioningId(null);
    }
  }

  async function openDraftEditor(article: PendingArticle) {
    const loadedReview = await loadReview(article);

    if (loadedReview?.source === "draft") {
      setDraftForm(toDraftReviewForm(loadedReview));
      setIsEditingDraft(true);
    }
  }

  function startDraftEdit() {
    if (review?.source !== "draft") return;

    setDraftForm(toDraftReviewForm(review));
    setDraftSaveError("");
    setIsEditingDraft(true);
  }

  function cancelDraftEdit() {
    if (review?.source !== "draft") return;

    setDraftForm(toDraftReviewForm(review));
    setDraftSaveError("");
    setIsEditingDraft(false);
  }

  function updateDraftField(field: keyof Omit<DraftReviewForm, "sections">, value: string) {
    setDraftForm((current) => (current ? { ...current, [field]: value } : current));
  }

  function updateDraftSection(
    index: number,
    field: keyof DraftReviewForm["sections"][number],
    value: string,
  ) {
    setDraftForm((current) => {
      if (!current) return current;

      const nextSections = [...current.sections];
      nextSections[index] = {
        ...nextSections[index],
        [field]: value,
      };

      return {
        ...current,
        sections: nextSections,
      };
    });
  }

  function addDraftSection() {
    setDraftForm((current) =>
      current
        ? {
            ...current,
            sections: [...current.sections, { heading: "", content: "" }],
          }
        : current,
    );
  }

  function removeDraftSection(index: number) {
    setDraftForm((current) => {
      if (!current || current.sections.length === 1) return current;

      return {
        ...current,
        sections: current.sections.filter((_, sectionIndex) => sectionIndex !== index),
      };
    });
  }

  async function saveDraftChanges() {
    if (review?.source !== "draft" || !draftForm) return;

    if (!draftForm.title.trim() || !draftForm.slug.trim() || !draftForm.category.trim()) {
      setDraftSaveError("العنوان والرابط والتصنيف مطلوبة");
      return;
    }

    const normalizedSections = draftForm.sections
      .map((section, index) => ({
        heading: section.heading.trim() || `القسم ${index + 1}`,
        content: section.content.trim(),
      }))
      .filter((section) => section.heading.length > 0 || section.content.length > 0)
      .filter((section) => section.content.length > 0);

    try {
      setSavingDraft(true);
      setDraftSaveError("");

      const res = await fetch("/api/admin/approvals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: review.id,
          source: review.source,
          data: {
            ...draftForm,
            title: draftForm.title.trim(),
            slug: draftForm.slug.trim(),
            excerpt: draftForm.excerpt.trim(),
            category: draftForm.category.trim(),
            coverImageUrl: draftForm.coverImageUrl.trim(),
            seoTitle: draftForm.seoTitle.trim(),
            seoDescription: draftForm.seoDescription.trim(),
            sourceUrl: draftForm.sourceUrl.trim(),
            sections: normalizedSections,
          },
        }),
      });

      if (!res.ok) {
        const payload = (await res.json()) as { error?: string };
        throw new Error(payload.error || "Failed to update draft");
      }

      const updatedReview = (await res.json()) as ApprovalReview;
      setReview(updatedReview);
      setDraftForm(toDraftReviewForm(updatedReview));
      setIsEditingDraft(false);
      setArticles((currentArticles) =>
        currentArticles.map((article) =>
          article.id === updatedReview.id
            ? {
                ...article,
                title: updatedReview.title,
                excerpt: updatedReview.excerpt,
                category: updatedReview.category,
                fileName: updatedReview.fileName,
              }
            : article,
        ),
      );
    } catch (err) {
      setDraftSaveError(err instanceof Error ? err.message : "فشل حفظ تعديلات المسودة");
    } finally {
      setSavingDraft(false);
    }
  }

  const selectedArticle = review ? toPendingArticle(review) : null;
  const databaseEditHref = review?.source === "database" ? review.editHref : null;
  const draftCoverPreviewSrc = draftForm
    ? draftForm.coverImageUrl.trim() || getCategoryDefinitionByName(draftForm.category).imagePath
    : "";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          المقالات المعلقة {articles.length > 0 && `(${articles.length})`}
        </h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-600 mb-4">لا توجد مقالات معلقة للموافقة عليها</p>
          <Link
            href="/admin/articles"
            className="inline-block text-blue-600 hover:text-blue-700 font-medium"
          >
            العودة للمقالات
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-yellow-50 border-b-2 border-yellow-300">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    العنوان
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    الفئة
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    تاريخ الإرسال
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {articles.map((article) => (
                  <tr
                    key={article.id}
                    className={review?.id === article.id ? "bg-yellow-50" : "hover:bg-yellow-50"}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <p className="font-medium">{article.title}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {article.source === "draft"
                            ? `مسودة محلية: ${article.fileName ?? "ملف غير معروف"}`
                            : "مقالة محفوظة في لوحة التحكم"}
                        </p>
                        {article.excerpt && (
                          <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                            {article.excerpt}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {article.category.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {article.submittedAt
                        ? new Date(article.submittedAt).toLocaleDateString("ar-SA")
                        : "غير متوفر"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => void loadReview(article)}
                          disabled={reviewLoadingId === article.id}
                          className="text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400"
                        >
                          {reviewLoadingId === article.id ? "جاري التحميل..." : "عرض"}
                        </button>
                        {article.source === "draft" ? (
                          <button
                            type="button"
                            onClick={() => void openDraftEditor(article)}
                            disabled={reviewLoadingId === article.id}
                            className="text-slate-700 hover:text-slate-900 font-medium disabled:text-gray-400"
                          >
                            تعديل
                          </button>
                        ) : (
                          <Link
                            href={buildDatabaseEditHref(article.id) ?? "/admin/articles"}
                            className="text-slate-700 hover:text-slate-900 font-medium"
                          >
                            تعديل
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => void approveArticle(article)}
                          disabled={actioningId === article.id}
                          className="text-green-600 hover:text-green-800 font-medium disabled:text-gray-400"
                        >
                          نشر
                        </button>
                        <button
                          type="button"
                          onClick={() => void rejectArticle(article)}
                          disabled={actioningId === article.id}
                          className="text-red-600 hover:text-red-800 font-medium disabled:text-gray-400"
                        >
                          رفض
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-gray-900">معاينة المقالة</h2>
              {review && selectedArticle && (
                <div className="flex flex-wrap gap-3">
                  {review.source === "draft" ? (
                    isEditingDraft ? (
                      <>
                        <button
                          type="button"
                          onClick={() => void saveDraftChanges()}
                          disabled={savingDraft}
                          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:bg-gray-400"
                        >
                          {savingDraft ? "جاري الحفظ..." : "حفظ التعديلات"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelDraftEdit}
                          disabled={savingDraft}
                          className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 disabled:bg-gray-100"
                        >
                          إلغاء التعديل
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={startDraftEdit}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                      >
                        تعديل المسودة
                      </button>
                    )
                  ) : databaseEditHref ? (
                    <Link
                      href={databaseEditHref}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                    >
                      تعديل المقالة
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void approveArticle(selectedArticle)}
                    disabled={actioningId === review.id}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-gray-400"
                  >
                    اعتماد ونشر
                  </button>
                  <button
                    type="button"
                    onClick={() => void rejectArticle(selectedArticle)}
                    disabled={actioningId === review.id}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:bg-gray-400"
                  >
                    رفض
                  </button>
                </div>
              )}
            </div>

            {reviewError && (
              <div className="rounded border border-red-300 bg-red-50 px-4 py-3 text-red-700">
                {reviewError}
              </div>
            )}

            {!review && !reviewError && (
              <div className="rounded-lg bg-white p-8 text-center shadow">
                <p className="text-gray-600">
                  اختر مقالة من الأعلى لعرضها ومراجعة جميع تفاصيلها قبل الموافقة.
                </p>
              </div>
            )}

            {review && isEditingDraft && draftForm ? (
              <div className="space-y-6">
                {draftSaveError && (
                  <div className="rounded border border-red-300 bg-red-50 px-4 py-3 text-red-700">
                    {draftSaveError}
                  </div>
                )}

                <section className="rounded-[28px] bg-white p-6 shadow md:p-8">
                  <div className="mb-6 text-xl font-bold text-gray-900">تحرير بيانات المسودة</div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        العنوان
                      </label>
                      <input
                        type="text"
                        value={draftForm.title}
                        onChange={(event) => updateDraftField("title", event.target.value)}
                        className={draftEditorFieldClassName}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الرابط
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={draftForm.slug}
                        onChange={(event) => updateDraftField("slug", event.target.value)}
                        className={draftEditorFieldClassName}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        التصنيف
                      </label>
                      <input
                        type="text"
                        value={draftForm.category}
                        onChange={(event) => updateDraftField("category", event.target.value)}
                        className={draftEditorFieldClassName}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الملخص
                      </label>
                      <textarea
                        value={draftForm.excerpt}
                        onChange={(event) => updateDraftField("excerpt", event.target.value)}
                        rows={4}
                        className={draftEditorFieldClassName}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        صورة الغلاف
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={draftForm.coverImageUrl}
                        onChange={(event) =>
                          updateDraftField("coverImageUrl", event.target.value)
                        }
                        className={draftEditorFieldClassName}
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        يمكن استخدام مسار محلي مثل `/articles/example-cover.svg` أو رابط صورة مباشر.
                      </p>
                      {draftCoverPreviewSrc && (
                        <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
                          <Image
                            src={draftCoverPreviewSrc}
                            alt="معاينة صورة الغلاف"
                            width={1200}
                            height={640}
                            className="h-44 w-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رابط المصدر
                      </label>
                      <input
                        type="url"
                        dir="ltr"
                        value={draftForm.sourceUrl}
                        onChange={(event) => updateDraftField("sourceUrl", event.target.value)}
                        className={draftEditorFieldClassName}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        عنوان SEO
                      </label>
                      <input
                        type="text"
                        value={draftForm.seoTitle}
                        onChange={(event) => updateDraftField("seoTitle", event.target.value)}
                        className={draftEditorFieldClassName}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        وصف SEO
                      </label>
                      <textarea
                        value={draftForm.seoDescription}
                        onChange={(event) =>
                          updateDraftField("seoDescription", event.target.value)
                        }
                        rows={3}
                        className={draftEditorFieldClassName}
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-[28px] bg-white p-6 shadow md:p-8">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="text-xl font-bold text-gray-900">الأقسام</div>
                    <button
                      type="button"
                      onClick={addDraftSection}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      إضافة قسم
                    </button>
                  </div>

                  <div className="space-y-5">
                    {draftForm.sections.map((section, index) => (
                      <section
                        key={`${index}-${section.heading}`}
                        className="rounded-[24px] border border-gray-200 bg-gray-50 p-5"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <div className="font-bold text-gray-900">القسم {index + 1}</div>
                          {draftForm.sections.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeDraftSection(index)}
                              className="text-sm font-medium text-red-600 hover:text-red-800"
                            >
                              حذف
                            </button>
                          )}
                        </div>
                        <div className="space-y-4">
                          <input
                            type="text"
                            value={section.heading}
                            onChange={(event) =>
                              updateDraftSection(index, "heading", event.target.value)
                            }
                            placeholder="عنوان القسم"
                            className={draftEditorFieldClassName}
                          />
                          <textarea
                            value={section.content}
                            onChange={(event) =>
                              updateDraftSection(index, "content", event.target.value)
                            }
                            rows={8}
                            placeholder="محتوى القسم"
                            className={draftEditorFieldClassName}
                          />
                        </div>
                      </section>
                    ))}
                  </div>
                </section>
              </div>
            ) : review ? (
              <div className="space-y-6">
                <section className="rounded-[28px] bg-white p-6 shadow md:p-8">
                  <div className="mb-6 overflow-hidden rounded-[28px] border border-gray-200 bg-gray-100">
                    <Image
                      src={review.coverImageUrl}
                      alt={review.title}
                      width={1200}
                      height={640}
                      className="h-64 w-full object-cover"
                    />
                  </div>
                  <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                    <span className="rounded-full bg-yellow-200 px-3 py-1 font-bold text-yellow-900">
                      {review.category.name}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1">
                      {review.source === "draft"
                        ? "مقالة من الملفات المحلية"
                        : "مقالة من لوحة التحكم"}
                    </span>
                    {review.submittedAt && (
                      <span className="rounded-full bg-gray-100 px-3 py-1">
                        {new Date(review.submittedAt).toLocaleDateString("ar-SA")}
                      </span>
                    )}
                    {review.readingTime && (
                      <span className="rounded-full bg-gray-100 px-3 py-1">
                        {review.readingTime}
                      </span>
                    )}
                  </div>

                  <h2 className="mb-4 text-3xl font-black leading-[1.4] text-gray-900">
                    {review.title}
                  </h2>

                  <p className="mb-6 text-lg leading-8 text-gray-700">{review.excerpt}</p>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <div className="mb-2 text-xs text-gray-500">الرابط</div>
                      <div className="font-medium text-gray-900" dir="ltr">
                        /{review.slug}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <div className="mb-2 text-xs text-gray-500">ملف المصدر</div>
                      <div className="font-medium text-gray-900">
                        {review.fileName ?? "محفوظ داخل قاعدة البيانات"}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <div className="mb-2 text-xs text-gray-500">عنوان SEO</div>
                      <div className="font-medium text-gray-900">{review.seoTitle}</div>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <div className="mb-2 text-xs text-gray-500">وصف SEO</div>
                      <div className="font-medium leading-7 text-gray-900">
                        {review.seoDescription}
                      </div>
                    </div>
                    {review.sourceUrl && (
                      <div className="rounded-2xl bg-gray-50 p-4">
                        <div className="mb-2 text-xs text-gray-500">المصدر</div>
                        <a
                          href={review.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          فتح الرابط
                        </a>
                      </div>
                    )}
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <div className="mb-2 text-xs text-gray-500">ملاحظة الأصالة</div>
                      <div className="font-medium leading-7 text-gray-900">
                        {review.originalityNote}
                      </div>
                    </div>
                  </div>

                  {review.storeRecommendation && (
                    <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                      <div className="mb-2 text-sm font-bold text-emerald-900">
                        {review.storeRecommendation.title}
                      </div>
                      <p className="mb-4 text-sm leading-7 text-emerald-900">
                        {review.storeRecommendation.description}
                      </p>
                      <a
                        href={review.storeRecommendation.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                      >
                        {review.storeRecommendation.ctaLabel}
                      </a>
                    </div>
                  )}
                </section>

                <section className="space-y-5 rounded-[28px] bg-white p-6 shadow md:p-8">
                  <div className="text-xl font-bold text-gray-900">محتوى المقالة</div>
                  {review.sections.length > 0 ? (
                    review.sections.map((section) => (
                      <section
                        key={section.id}
                        id={section.anchor}
                        className="rounded-[24px] border border-gray-200 bg-gray-50 p-5"
                      >
                        <h3 className="text-2xl font-black leading-[1.5] text-gray-900">
                          {section.heading}
                        </h3>
                        {/<[a-z][\s\S]*>/i.test(section.content) ? (
                          <div
                            className="article-rich-content mt-4"
                            dangerouslySetInnerHTML={{ __html: section.content }}
                          />
                        ) : (
                          <p className="mt-4 whitespace-pre-line text-lg leading-9 text-gray-700">
                            {section.content}
                          </p>
                        )}
                      </section>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-gray-300 p-5 text-gray-600">
                      لا توجد أقسام محفوظة لهذه المقالة حالياً.
                    </div>
                  )}
                </section>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
