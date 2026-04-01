"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  category: { name: string };
  publishedAt?: string;
  status: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/articles");
      if (!res.ok) throw new Error("Failed to fetch articles");
      const data = await res.json();
      setArticles(data);
      setError("");
    } catch (err) {
      setError("فشل تحميل المقالات");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteArticle(id: number) {
    if (!confirm("هل أنت متأكد من حذف هذه المقالة؟")) return;

    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete article");
      setArticles(articles.filter((a) => a.id !== id));
    } catch (err) {
      setError("فشل حذف المقالة");
      console.error(err);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">المقالات</h1>
        <Link
          href="/admin/articles/new"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          + مقالة جديدة
        </Link>
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
          <p className="text-gray-600 mb-4">لا توجد مقالات</p>
          <Link
            href="/admin/articles/new"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            إنشاء أول مقالة
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                  العنوان
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                  الفئة
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                  تاريخ النشر
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>
                      <p className="font-medium">{article.title}</p>
                      <p className="text-gray-500 text-xs">/{article.slug}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {article.category.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString("ar-SA")
                      : "مسودة"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-3">
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        تعديل
                      </Link>
                      <button
                        onClick={() => deleteArticle(article.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        حذف
                      </button>
                      <a
                        href={`/articles/${article.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        عرض
                      </a>
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
