"use client";

import ArticleForm from "@/components/article-form";

export default function NewArticlePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">إنشاء مقالة جديدة</h1>
      <ArticleForm />
    </div>
  );
}
