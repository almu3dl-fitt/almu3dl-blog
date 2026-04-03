"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ArticleForm, { type ArticleFormInitialData } from "@/components/article-form";

export default function EditArticlePage() {
  const params = useParams();
  const id = params.id as string;
  const [article, setArticle] = useState<ArticleFormInitialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchArticle() {
      try {
        const res = await fetch(`/api/admin/articles/${id}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch article");
        const data = (await res.json()) as ArticleFormInitialData;
        setArticle(data);
        setError("");
      } catch (err) {
        setError("فشل تحميل المقالة");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    void fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">جاري التحميل...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!article) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        المقالة غير موجودة
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">تعديل المقالة</h1>
      <ArticleForm articleId={parseInt(id)} initialData={article} />
    </div>
  );
}
