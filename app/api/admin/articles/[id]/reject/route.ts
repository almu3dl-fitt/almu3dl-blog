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

    // Update status to rejected
    const updated = await prisma.post.update({
      where: { id: articleId },
      data: {
        status: "rejected",
      },
    });

    return NextResponse.json({
      message: "تم رفض المقالة",
      article: updated,
    });
  } catch (error) {
    console.error("Error rejecting article:", error);
    return NextResponse.json(
      { error: "خطأ في رفض المقالة" },
      { status: 500 }
    );
  }
}
