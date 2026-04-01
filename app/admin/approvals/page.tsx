"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface PendingArticle {
  id: string;
  source: "database" | "draft";
  title: string;
  excerpt: string;
  category: { name: string };
  submittedAt: string | null;
  status: string;
  reviewHref: string | null;
  fileName: string | null;
}

interface ApprovalReview {
  id: string;
  source: "database" | "draft";
  title: string;
  slug: string;
  excerpt: string;
  category: { name: string };
  submittedAt: string | null;
  status: string;
  fileName: string | null;
  readingTime: string | null;
  seoTitle: string;
  seoDescription: string;
  sections: {
    id: string;
    heading: string;
    anchor: string;
    content: string;
    sortOrder: number;
  }[];
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

  useEffect(() => {
    fetchPendingArticles();
  }, []);

  async function fetchPendingArticles() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/approvals");
      if (!res.ok) throw new Error("Failed to fetch pending articles");
      const data = await res.json();
      setArticles(data);
      setReview((currentReview) =>
        currentReview && !data.some((article: PendingArticle) => article.id === currentReview.id)
          ? null
          : currentReview
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

  async function loadReview(article: PendingArticle) {
    try {
      setReviewError("");
      setReviewLoadingId(article.id);

      const params = new URLSearchParams({
        source: article.source,
        id: article.id,
      });
      const res = await fetch(`/api/admin/approvals?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch approval review");

      const data = await res.json();
      setReview(data);
    } catch (err) {
      setReviewError("فشل تحميل معاينة المقالة");
      console.error(err);
    } finally {
      setReviewLoadingId(null);
    }
  }

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
        currentArticles.filter((currentArticle) => currentArticle.id !== article.id)
      );
      if (review?.id === article.id) {
        setReview(null);
      }
      alert("تم نشر المقالة بنجاح");
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
        currentArticles.filter((currentArticle) => currentArticle.id !== article.id)
      );
      if (review?.id === article.id) {
        setReview(null);
      }
      alert("تم رفض المقالة");
    } catch (err) {
      alert("فشل رفض المقالة");
      console.error(err);
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
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
            ← العودة للمقالات
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadReview(article)}
                          disabled={reviewLoadingId === article.id}
                          className="text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400"
                        >
                          {reviewLoadingId === article.id ? "جاري التحميل..." : "عرض"}
                        </button>
                        <button
                          onClick={() => approveArticle(article)}
                          disabled={actioningId === article.id}
                          className="text-green-600 hover:text-green-800 font-medium disabled:text-gray-400"
                        >
                          ✓ نشر
                        </button>
                        <button
                          onClick={() => rejectArticle(article)}
                          disabled={actioningId === article.id}
                          className="text-red-600 hover:text-red-800 font-medium disabled:text-gray-400"
                        >
                          ✗ رفض
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">معاينة المقالة</h2>
              {review && (
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      approveArticle({
                        id: review.id,
                        source: review.source,
                        title: review.title,
                        excerpt: review.excerpt,
                        category: review.category,
                        submittedAt: review.submittedAt,
                        status: review.status,
                        reviewHref: null,
                        fileName: review.fileName,
                      })
                    }
                    disabled={actioningId === review.id}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-gray-400"
                  >
                    اعتماد ونشر
                  </button>
                  <button
                    onClick={() =>
                      rejectArticle({
                        id: review.id,
                        source: review.source,
                        title: review.title,
                        excerpt: review.excerpt,
                        category: review.category,
                        submittedAt: review.submittedAt,
                        status: review.status,
                        reviewHref: null,
                        fileName: review.fileName,
                      })
                    }
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

            {review && (
              <div className="space-y-6">
                <section className="rounded-[28px] bg-white p-6 shadow md:p-8">
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

                  <p className="mb-6 text-lg leading-8 text-gray-700">
                    {review.excerpt}
                  </p>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <div className="mb-2 text-xs text-gray-500">الرابط</div>
                      <div className="font-medium text-gray-900">/{review.slug}</div>
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
                  </div>
                </section>

                <section className="space-y-5 rounded-[28px] bg-white p-6 shadow md:p-8">
                  <div className="text-xl font-bold text-gray-900">محتوى المقالة</div>
                  {review.sections.map((section) => (
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
                  ))}
                </section>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
