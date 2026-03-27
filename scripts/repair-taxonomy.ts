import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { CATEGORY_DEFINITIONS } from "../lib/site";
import { seedArticles } from "../prisma/seed";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing in the current environment.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const ensuredCategories = await Promise.all(
    CATEGORY_DEFINITIONS.map((category) =>
      prisma.category.upsert({
        where: { name: category.name },
        update: { slug: category.slug },
        create: {
          name: category.name,
          slug: category.slug,
        },
      }),
    ),
  );

  const categoryIdByName = new Map(
    ensuredCategories.map((category) => [category.name, category.id]),
  );

  const categoryFixes: string[] = [];

  for (const article of seedArticles) {
    const expectedCategoryId = categoryIdByName.get(article.category);

    if (!expectedCategoryId) {
      throw new Error(`Missing expected category: ${article.category}`);
    }

    const post = await prisma.post.findUnique({
      where: { slug: article.slug },
      select: {
        id: true,
        slug: true,
        categoryId: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!post || post.categoryId === expectedCategoryId) {
      continue;
    }

    await prisma.post.update({
      where: { id: post.id },
      data: {
        categoryId: expectedCategoryId,
      },
    });

    categoryFixes.push(`${post.slug} — ${post.category.name} -> ${article.category}`);
  }

  console.log(`Ensured ${ensuredCategories.length} official categories.`);
  console.log(`Fixed ${categoryFixes.length} post category assignments.`);

  for (const fix of categoryFixes) {
    console.log(`- ${fix}`);
  }
}

main()
  .catch((error) => {
    console.error("Taxonomy repair failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
