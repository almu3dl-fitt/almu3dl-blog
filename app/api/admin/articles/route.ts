import { NextRequest, NextResponse } from "next/server";
import { createSlug } from "@/lib/slug";
import { prisma } from "@/lib/prisma";

// GET all articles
export async function GET(request: NextRequest) {
  try {
    const articles = await prisma.post.findMany({
      include: {
        category: true,
        sections: true,
        media: true,
      },
      orderBy: {
        publishedAt: "desc",
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
    const {
      title,
      excerpt,
      categoryId,
      coverImageUrl,
      seoTitle,
      seoDescription,
      sections = [],
      publishNow = false,
    } = body;

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
        categoryId: parseInt(categoryId),
        coverImageUrl: coverImageUrl || null,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || excerpt || "",
        publishedAt: publishNow ? new Date() : null,
        status: "published",
        sections: {
          create: sections.map(
            (section: {
              heading: string;
              anchor: string;
              content: string;
              sortOrder: number;
            }) => ({
              heading: section.heading,
              anchor: section.anchor,
              content: section.content,
              sortOrder: section.sortOrder,
            })
          ),
        },
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
