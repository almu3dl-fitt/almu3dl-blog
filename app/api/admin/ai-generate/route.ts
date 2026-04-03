import { NextResponse } from "next/server";

import { generateAiArticle } from "@/lib/ai-article-generator";

export async function POST() {
  try {
    const article = await generateAiArticle();

    return NextResponse.json({ success: true, article });
  } catch (error) {
    console.error("[ai-generate] Article generation failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء إنشاء المقالة",
      },
      { status: 500 },
    );
  }
}
