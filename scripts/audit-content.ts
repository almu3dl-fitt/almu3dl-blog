import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { CATEGORY_DEFINITIONS } from "../lib/site";
import { decodeSlugValue, normalizeSlug } from "../lib/slug";
import { seedArticles } from "../prisma/seed";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing in the current environment.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

type AuditIssue = {
  slug: string;
  issue: string;
};

function printSection(title: string) {
  console.log(`\n=== ${title} ===`);
}

function printList(title: string, values: string[]) {
  console.log(`- ${title}: ${values.length}`);

  for (const value of values.slice(0, 12)) {
    console.log(`  - ${value}`);
  }
}

async function main() {
  const [posts, categories] = await Promise.all([
    prisma.post.findMany({
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        sections: {
          select: {
            id: true,
            anchor: true,
          },
        },
        media: {
          select: {
            id: true,
            type: true,
            url: true,
          },
        },
      },
    }),
    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    }),
  ]);

  const requiredFieldIssues: AuditIssue[] = [];
  const postsWithoutSections: string[] = [];
  const postsWithoutMedia: string[] = [];
  const postsWithRemoteCover: string[] = [];
  const percentEncodedSlugs: string[] = [];

  for (const post of posts) {
    if (!post.title.trim()) {
      requiredFieldIssues.push({ slug: post.slug, issue: "العنوان فارغ" });
    }

    if (!post.slug.trim()) {
      requiredFieldIssues.push({ slug: post.slug, issue: "الـ slug فارغ" });
    }

    if (!post.excerpt?.trim()) {
      requiredFieldIssues.push({ slug: post.slug, issue: "المقتطف مفقود" });
    }

    if (!post.coverImageUrl?.trim()) {
      requiredFieldIssues.push({
        slug: post.slug,
        issue: "coverImageUrl مفقود",
      });
    }

    if (!post.category?.name?.trim()) {
      requiredFieldIssues.push({ slug: post.slug, issue: "التصنيف مفقود" });
    }

    if (post.sections.length === 0) {
      postsWithoutSections.push(post.slug);
    }

    if (post.media.length === 0) {
      postsWithoutMedia.push(post.slug);
    }

    if (post.coverImageUrl && !post.coverImageUrl.startsWith("/")) {
      postsWithRemoteCover.push(post.slug);
    }

    if (/%[0-9A-Fa-f]{2}/.test(post.slug)) {
      percentEncodedSlugs.push(post.slug);
    }
  }

  const normalizedSlugMap = new Map<string, string[]>();
  for (const post of posts) {
    const normalized = normalizeSlug(post.slug);
    const bucket = normalizedSlugMap.get(normalized) ?? [];
    bucket.push(post.slug);
    normalizedSlugMap.set(normalized, bucket);
  }

  const slugCollisionReport = Array.from(normalizedSlugMap.entries())
    .filter(([, slugs]) => slugs.length > 1)
    .map(([normalized, slugs]) => `${normalized} -> ${slugs.join(", ")}`);

  const officialCategoryNames = new Set(
    CATEGORY_DEFINITIONS.map((category) => category.name),
  );
  const missingOfficialCategories = CATEGORY_DEFINITIONS.filter(
    (category) => !categories.some((dbCategory) => dbCategory.name === category.name),
  ).map((category) => category.name);
  const unexpectedCategories = categories
    .filter((category) => !officialCategoryNames.has(category.name))
    .map((category) => category.name);

  const dbSlugs = new Set(posts.map((post) => post.slug));
  const seedSlugs = new Set(seedArticles.map((article) => article.slug));
  const postBySlug = new Map(posts.map((post) => [post.slug, post]));

  const missingFromDatabase = seedArticles
    .filter((article) => !dbSlugs.has(article.slug))
    .map((article) => `${article.slug} — ${article.title}`);
  const extraInDatabase = posts
    .filter((post) => !seedSlugs.has(post.slug))
    .map((post) => `${post.slug} — ${post.title}`);
  const categoryMismatches = seedArticles
    .map((article) => {
      const post = postBySlug.get(article.slug);
      if (!post || post.category.name === article.category) return null;
      return `${article.slug} — seed: ${article.category} / db: ${post.category.name}`;
    })
    .filter((value): value is string => Boolean(value));

  const decodedSlugSamples = posts
    .filter((post) => decodeSlugValue(post.slug) !== post.slug)
    .slice(0, 8)
    .map((post) => `${post.slug} -> ${decodeSlugValue(post.slug)}`);

  const postsWithoutCoverMediaMatch = posts
    .filter((post) => {
      if (!post.coverImageUrl) return false;
      return !post.media.some((item) => item.url === post.coverImageUrl);
    })
    .map((post) => `${post.slug} — ${post.coverImageUrl}`);

  const seedExcerptIssues = seedArticles
    .filter((article) => !article.excerpt.trim())
    .map((article) => article.slug);

  printSection("ملخص المحتوى");
  console.log(`- إجمالي المقالات في قاعدة البيانات: ${posts.length}`);
  console.log(`- إجمالي المقالات في مصدر الـ seed: ${seedArticles.length}`);
  console.log(`- إجمالي التصنيفات في قاعدة البيانات: ${categories.length}`);

  printSection("سلامة الحقول الأساسية");
  console.log(`- المشاكل المكتشفة: ${requiredFieldIssues.length}`);
  for (const issue of requiredFieldIssues.slice(0, 20)) {
    console.log(`  - ${issue.slug} — ${issue.issue}`);
  }

  printSection("العلاقات والمحتوى");
  printList("مقالات بلا PostSection", postsWithoutSections);
  printList("مقالات بلا Media", postsWithoutMedia);
  printList("مقالات ما زالت تغلفها روابط خارجية", postsWithRemoteCover);

  printSection("الـ Slugs");
  printList("Slugs percent-encoded", percentEncodedSlugs);
  printList("تصادمات الـ slug بعد التطبيع", slugCollisionReport);
  printList("أمثلة على فك ترميز الـ slug", decodedSlugSamples);

  printSection("التصنيفات");
  for (const category of categories) {
    console.log(`- ${category.name}: ${category._count.posts} مقال`);
  }
  printList("تصنيفات رسمية ناقصة من قاعدة البيانات", missingOfficialCategories);
  printList("تصنيفات موجودة خارج القائمة الرسمية", unexpectedCategories);

  printSection("مطابقة قاعدة البيانات مع seed");
  printList("مقالات موجودة في seed وغير موجودة في DB", missingFromDatabase);
  printList("مقالات موجودة في DB وغير موجودة في seed", extraInDatabase);
  printList("اختلافات التصنيف بين seed و DB", categoryMismatches);

  printSection("ملاحظات إضافية");
  printList(
    "مقالات coverImageUrl فيها لا يطابق أي عنصر Media مرتبط",
    postsWithoutCoverMediaMatch,
  );
  printList("مقالات ناقصة excerpt داخل seed نفسه", seedExcerptIssues);
}

main()
  .catch((error) => {
    console.error("Content audit failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
