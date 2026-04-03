"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  totalArticles: number;
  totalCategories: number;
  publishedArticles: number;
  pendingArticles: number;
}

interface DashboardArticle {
  status: string;
}

interface PendingApproval {
  id: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalArticles: 0,
    totalCategories: 0,
    publishedArticles: 0,
    pendingArticles: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [articlesRes, categoriesRes, approvalsRes] = await Promise.all([
          fetch("/api/admin/articles", { cache: "no-store" }),
          fetch("/api/admin/categories", { cache: "no-store" }),
          fetch("/api/admin/approvals", { cache: "no-store" }),
        ]);

        const articles = await articlesRes.json();
        const categories = await categoriesRes.json();
        const pendingApprovals = (await approvalsRes.json()) as PendingApproval[];

        setStats({
          totalArticles: articles.length,
          totalCategories: categories.length,
          publishedArticles: articles.filter(
            (article: DashboardArticle) => article.status === "published"
          ).length,
          pendingArticles: pendingApprovals.length,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">لوحة التحكم</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm mb-2">إجمالي المقالات</p>
          <p className="text-4xl font-bold text-gray-900">{stats.totalArticles}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-gray-600 text-sm mb-2">المقالات المنشورة</p>
          <p className="text-4xl font-bold text-gray-900">
            {stats.publishedArticles}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm mb-2">الفئات</p>
          <p className="text-4xl font-bold text-gray-900">
            {stats.totalCategories}
          </p>
        </div>

        {stats.pendingArticles > 0 && (
          <Link href="/admin/approvals">
            <div className="bg-yellow-50 p-6 rounded-lg shadow border-l-4 border-yellow-500 hover:bg-yellow-100 cursor-pointer transition-colors">
              <p className="text-gray-600 text-sm mb-2">المعلقة بانتظار الموافقة</p>
              <p className="text-4xl font-bold text-yellow-600">{stats.pendingArticles}</p>
              <p className="text-xs text-yellow-700 mt-2">اضغط للمراجعة</p>
            </div>
          </Link>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">الإجراءات السريعة</h2>
        <div className="flex gap-4 flex-wrap">
          <Link
            href="/admin/articles"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            عرض المقالات
          </Link>
          <Link
            href="/admin/articles/new"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            إنشاء مقالة جديدة
          </Link>
          {stats.pendingArticles > 0 && (
            <Link
              href="/admin/approvals"
              className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              مراجعة المقالات المعلقة ({stats.pendingArticles})
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
