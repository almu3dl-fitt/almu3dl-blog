"use client";

import Link from "next/link";
import { useState } from "react";

type GeneratedArticle = {
  postId: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
};

const CATEGORIES = [
  { name: "التغذية الرياضية", icon: "🥗" },
  { name: "خسارة الدهون", icon: "🔥" },
  { name: "بناء العضلات والأداء", icon: "💪" },
  { name: "المستلزمات الرياضية", icon: "🏋️" },
  { name: "المكملات الغذائية", icon: "💊" },
  { name: "الصحة العامة", icon: "❤️" },
  { name: "الوصفات الصحية", icon: "🍽️" },
  { name: "أسلوب الحياة الرياضي", icon: "🏃" },
];

export default function AiGeneratePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedArticle | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setIsGenerating(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/admin/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: selectedCategory ?? undefined }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error ?? "حدث خطأ أثناء إنشاء المقالة");
        return;
      }

      setResult(data.article);
    } catch {
      setError("تعذر الاتصال بالخادم، يرجى المحاولة مجدداً");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-8" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">المعضّل AI</h1>
        <p className="mt-2 text-gray-500">
          أنشئ مقالة جديدة بالذكاء الاصطناعي بناءً على أسلوب كتابتك
        </p>
      </div>

      {/* Category selection */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            اختر القسم
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            اختياري — إذا تركته فارغاً سيختار الذكاء الاصطناعي القسم بنفسه
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() =>
                  setSelectedCategory(isSelected ? null : cat.name)
                }
                className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all text-sm font-medium ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-center leading-tight">{cat.name}</span>
              </button>
            );
          })}
        </div>

        {selectedCategory && (
          <p className="text-sm text-blue-600 font-medium">
            ✓ سيكتب الوكيل مقالة في قسم: {selectedCategory}
          </p>
        )}
        {!selectedCategory && (
          <p className="text-sm text-gray-400">
            لم يتم تحديد قسم — سيختار الوكيل بحرية
          </p>
        )}
      </div>

      {/* Generate button */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-5 px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-bold text-xl rounded-xl transition-colors flex items-center justify-center gap-3 shadow-sm"
        >
          {isGenerating ? (
            <>
              <svg
                className="animate-spin h-6 w-6 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              جاري إنشاء المقالة... (قد يستغرق دقيقة أو دقيقتين)
            </>
          ) : (
            <>
              <span className="text-2xl">✨</span>
              إنشاء مقالة الآن
              {selectedCategory && (
                <span className="text-base font-normal opacity-80">
                  في {selectedCategory}
                </span>
              )}
            </>
          )}
        </button>

        {isGenerating && (
          <p className="text-center text-sm text-gray-500">
            الذكاء الاصطناعي يدرس أسلوبك ويكتب المقالة، يرجى الانتظار...
          </p>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">❌</span>
              <p className="font-semibold text-red-800">حدث خطأ</p>
            </div>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <h3 className="font-bold text-green-800 text-lg">
                تم إنشاء المقالة بنجاح!
              </h3>
            </div>

            <div className="space-y-2 text-sm">
              <div className="bg-white rounded-lg border border-green-200 p-3">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                  العنوان
                </p>
                <p className="text-gray-900 font-semibold mt-0.5">
                  {result.title}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-lg border border-green-200 p-3">
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                    الفئة
                  </p>
                  <p className="text-gray-900 font-medium mt-0.5">
                    {result.category}
                  </p>
                </div>
                <div className="bg-white rounded-lg border border-green-200 p-3">
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                    الرابط
                  </p>
                  <p className="text-gray-700 text-xs mt-0.5 break-all font-mono">
                    {result.slug}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-green-200 p-3">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                  المقتطف
                </p>
                <p className="text-gray-700 mt-0.5">{result.excerpt}</p>
              </div>
            </div>

            <Link
              href="/admin/approvals"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-5 rounded-lg transition-colors"
            >
              مراجعة المقالة في قائمة المعلقة
              <span>←</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
