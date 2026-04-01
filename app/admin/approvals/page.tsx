"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PendingArticle {
  id: number;
  title: string;
  excerpt?: string;
  category: { name: string };
  createdAt: string;
  status: string;
}

export default function ApprovalsPage() {
  const [articles, setArticles] = useState<PendingArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actioningId, setActioningId] = useState<number | null>(null);

  useEffect(() => {
    fetchPendingArticles();
  }, []);

  async function fetchPendingArticles() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/articles?status=pending_approval");
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

  async function approveArticle(id: number) {
    if (!confirm("هل تريد نشر هذه المقالة؟")) return;

    try {
      setActioningId(id);
      const res = await fetch(`/api/admin/articles/${id}/approve`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to approve article");

      setArticles(articles.filter((a) => a.id !== id));
      alert("تم نشر المقالة بنجاح");
    } catch (err) {
      alert("فشل نشر المقالة");
      console.error(err);
    } finally {
      setActioningId(null);
    }
  }

  async function rejectArticle(id: number) {
    const reason = prompt("أدخل سبب الرفض (اختياري):");
    if (reason === null) return;

    try {
      setActioningId(id);
      const res = await fetch(`/api/admin/articles/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || "" }),
      });
      if (!res.ok) throw new Error("Failed to reject article");

      setArticles(articles.filter((a) => a.id !== id));
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
                  تاريخ الإنشاء
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
                    {new Date(article.createdAt).toLocaleDateString("ar-SA")}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        عرض
                      </Link>
                      <button
                        onClick={() => approveArticle(article.id)}
                        disabled={actioningId === article.id}
                        className="text-green-600 hover:text-green-800 font-medium disabled:text-gray-400"
                      >
                        ✓ نشر
                      </button>
                      <button
                        onClick={() => rejectArticle(article.id)}
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
