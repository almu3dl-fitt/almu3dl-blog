import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const articleId = parseInt(id);

    // Get current article
    const article = await prisma.post.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return NextResponse.json(
        { error: "المقالة غير موجودة" },
        { status: 404 }
      );
    }

    // Update status to published and set publishedAt
    const updated = await prisma.post.update({
      where: { id: articleId },
      data: {
        status: "published",
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "تم نشر المقالة بنجاح",
      article: updated,
    });
  } catch (error) {
    console.error("Error approving article:", error);
    return NextResponse.json(
      { error: "خطأ في نشر المقالة" },
      { status: 500 }
    );
  }
}
