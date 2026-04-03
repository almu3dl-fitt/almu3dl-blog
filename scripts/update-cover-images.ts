/**
 * Updates cover images for all existing database articles using the Pexels API.
 *
 * Run locally (needs a real PostgreSQL DATABASE_URL):
 *   DATABASE_URL="postgresql://..." PEXELS_API_KEY="..." npx tsx scripts/update-cover-images.ts
 *
 * Or in production after setting env vars in your hosting provider.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { getSuggestedCoverImageForArticleAsync } from "../lib/article-cover-images";

const connectionString = process.env.DATABASE_URL;

if (!connectionString || connectionString.startsWith("file:")) {
  console.error(
    "ERROR: DATABASE_URL must be a PostgreSQL connection string.\n" +
      "Usage: DATABASE_URL=\"postgresql://...\" PEXELS_API_KEY=\"...\" npx tsx scripts/update-cover-images.ts",
  );
  process.exit(1);
}

if (!process.env.PEXELS_API_KEY) {
  console.warn("WARNING: PEXELS_API_KEY is not set — will fall back to local images.\n");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const articles = await prisma.post.findMany({
    select: {
      id: true,
      title: true,
      excerpt: true,
      coverImageUrl: true,
      category: { select: { name: true } },
      sections: { select: { heading: true, content: true } },
    },
    orderBy: { id: "desc" },
  });

  console.log(`Found ${articles.length} articles.\n`);

  let updated = 0;

  for (const article of articles) {
    const suggested = await getSuggestedCoverImageForArticleAsync({
      title: article.title,
      excerpt: article.excerpt,
      categoryName: article.category?.name,
      sections: article.sections,
    });

    if (suggested === article.coverImageUrl) {
      console.log(`[SKIP] #${article.id} — image unchanged`);
      continue;
    }

    await prisma.post.update({
      where: { id: article.id },
      data: { coverImageUrl: suggested },
    });

    console.log(`[OK]   #${article.id} "${article.title}"`);
    console.log(`       was: ${article.coverImageUrl ?? "(none)"}`);
    console.log(`       now: ${suggested}\n`);
    updated++;
  }

  console.log(`Done. Updated ${updated} of ${articles.length} articles.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
