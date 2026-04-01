import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ArticleParams {
  params: Promise<{ id: string }>;
}

// GET single article
export async function GET(request: NextRequest, { params }: ArticleParams) {
  try {
    const { id } = await params;

    const article = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        sections: {
          orderBy: { sortOrder: "asc" },
        },
        media: true,
      },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("Failed to fetch article:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}

// PUT update article
export async function PUT(request: NextRequest, { params }: ArticleParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      excerpt,
      categoryId,
      coverImageUrl,
      seoTitle,
      seoDescription,
      sections = [],
      publishNow,
    } = body;

    const article = await prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        title,
        excerpt,
        categoryId: parseInt(categoryId),
        coverImageUrl,
        seoTitle,
        seoDescription,
        publishedAt: publishNow ? new Date() : undefined,
      },
      include: {
        category: true,
        sections: true,
        media: true,
      },
    });

    // Update sections
    await prisma.postSection.deleteMany({
      where: { postId: parseInt(id) },
    });

    if (sections.length > 0) {
      await prisma.postSection.createMany({
        data: sections.map(
          (section: {
            heading: string;
            anchor: string;
            content: string;
            sortOrder: number;
          }) => ({
            postId: parseInt(id),
            heading: section.heading,
            anchor: section.anchor,
            content: section.content,
            sortOrder: section.sortOrder,
          })
        ),
      });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("Failed to update article:", error);
    return NextResponse.json(
      { error: "Failed to update article" },
      { status: 500 }
    );
  }
}

// DELETE article
export async function DELETE(request: NextRequest, { params }: ArticleParams) {
  try {
    const { id } = await params;

    await prisma.post.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete article:", error);
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 }
    );
  }
}
