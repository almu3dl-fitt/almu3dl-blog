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
    const articleId = parseInt(id);
    const body = await request.json();
    const {
      title,
      excerpt,
      categoryId,
      coverImageUrl,
      seoTitle,
      seoDescription,
      sections = [],
      status = "draft",
    } = body;

    const existingArticle = await prisma.post.findUnique({
      where: { id: articleId },
      select: { id: true, publishedAt: true },
    });

    if (!existingArticle) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const publishedAt =
      status === "published"
        ? existingArticle.publishedAt ?? new Date()
        : null;

    await prisma.$transaction(async (tx) => {
      await tx.post.update({
        where: { id: articleId },
        data: {
          title,
          excerpt,
          categoryId: parseInt(categoryId),
          coverImageUrl,
          seoTitle,
          seoDescription,
          status,
          publishedAt,
        },
      });

      await tx.postSection.deleteMany({
        where: { postId: articleId },
      });

      if (sections.length > 0) {
        await tx.postSection.createMany({
          data: sections.map(
            (section: {
              heading: string;
              anchor: string;
              content: string;
              sortOrder: number;
            }) => ({
              postId: articleId,
              heading: section.heading,
              anchor: section.anchor,
              content: section.content,
              sortOrder: section.sortOrder,
            })
          ),
        });
      }
    });

    const article = await prisma.post.findUnique({
      where: { id: articleId },
      include: {
        category: true,
        sections: {
          orderBy: { sortOrder: "asc" },
        },
        media: true,
      },
    });

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
