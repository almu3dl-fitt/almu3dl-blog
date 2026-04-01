import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  normalizeArticleSections,
  normalizeArticleText,
  normalizeOptionalArticleText,
  parseArticleCategoryId,
} from "@/lib/admin-article-input";
import { createSlug } from "@/lib/slug";
import { prisma } from "@/lib/prisma";

// GET all articles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: Prisma.PostWhereInput = {};
    if (status) {
      where.status = status;
    }

    const articles = await prisma.post.findMany({
      where,
      include: {
        category: true,
        sections: true,
        media: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

// POST new article
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const title = normalizeArticleText(body.title);
    const excerpt = normalizeArticleText(body.excerpt);
    const categoryId = parseArticleCategoryId(body.categoryId);
    const coverImageUrl = normalizeOptionalArticleText(body.coverImageUrl);
    const seoTitle = normalizeOptionalArticleText(body.seoTitle);
    const seoDescription = normalizeOptionalArticleText(body.seoDescription);
    const sections = normalizeArticleSections(body.sections);
    const status = normalizeArticleText(body.status) || "draft";

    if (!title || !categoryId) {
      return NextResponse.json(
        { error: "Title and category are required" },
        { status: 400 }
      );
    }

    const slug = createSlug(title);

    const article = await prisma.post.create({
      data: {
        title,
        slug,
        excerpt: excerpt || "",
        categoryId,
        coverImageUrl,
        seoTitle: seoTitle ?? title,
        seoDescription: seoDescription ?? excerpt ?? "",
        publishedAt: status === "published" ? new Date() : null,
        status,
        ...(sections.length > 0
          ? {
              sections: {
                create: sections,
              },
            }
          : {}),
      },
      include: {
        category: true,
        sections: true,
        media: true,
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("Failed to create article:", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}
