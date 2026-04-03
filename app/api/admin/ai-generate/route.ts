import { NextRequest, NextResponse } from "next/server";

import { generateAiArticle } from "@/lib/ai-article-generator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const category = typeof body.category === "string" ? body.category : undefined;

    const article = await generateAiArticle({ category });

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
