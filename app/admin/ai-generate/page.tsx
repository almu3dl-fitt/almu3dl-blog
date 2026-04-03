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

export default function AiGeneratePage() {
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
        <h1 className="text-3xl font-bold text-gray-900">
          وكيل الذكاء الاصطناعي
        </h1>
        <p className="mt-2 text-gray-500">
          أنشئ مقالة جديدة بالذكاء الاصطناعي بناءً على أسلوب كتابتك
        </p>
      </div>

      {/* How it works card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex items-start gap-5">
          <div className="text-5xl select-none">🤖</div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              كيف يعمل الوكيل؟
            </h2>
            <ol className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 mt-0.5">١.</span>
                <span>يدرس المقالات المنشورة في الموقع ويستوعب أسلوبك في الكتابة والنغمة التحريرية</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 mt-0.5">٢.</span>
                <span>يختار موضوعاً جديداً مفيداً في اللياقة أو التغذية الرياضية لم يُتناول من قبل</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 mt-0.5">٣.</span>
                <span>يكتب مقالة شاملة بنفس أسلوبك مع استشهادات علمية حقيقية</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 mt-0.5">٤.</span>
                <span>يجلب صورة غلاف عالية الجودة من Pexels غير مكررة في المقالات الأخرى</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 mt-0.5">٥.</span>
                <span>يضع المقالة في قائمة المعلقة لمراجعتها والموافقة عليها قبل النشر</span>
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Generate button card */}
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
              <div className="bg-white rounded-lg border border-green-200 p-3 space-y-1">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                  العنوان
                </p>
                <p className="text-gray-900 font-semibold">{result.title}</p>
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
