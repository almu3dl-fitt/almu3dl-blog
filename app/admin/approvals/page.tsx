"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

export default function ApprovalsPage() {
  const [articles, setArticles] = useState<PendingArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actioningId, setActioningId] = useState<string | null>(null);

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
      setError("");
    } catch (err) {
      setError("فشل تحميل المقالات المعلقة");
      console.error(err);
    } finally {
      setLoading(false);
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
                <tr key={article.id} className="hover:bg-yellow-50">
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
                      {article.reviewHref ? (
                        <Link
                          href={article.reviewHref}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          عرض
                        </Link>
                      ) : (
                        <span className="text-gray-400 font-medium">
                          من الملف المحلي
                        </span>
                      )}
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
      )}
    </div>
  );
}
