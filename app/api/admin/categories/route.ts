import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CATEGORY_DEFINITIONS } from "@/lib/site";

// GET all categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.warn(
      "Failed to fetch categories from database, returning static fallback categories:",
      error,
    );

    return NextResponse.json(
      CATEGORY_DEFINITIONS.map((category, index) => ({
        id: index + 1,
        name: category.name,
        slug: category.slug,
      })),
    );
  }
}
