/**
 * Marks pending draft articles as published and assigns Pexels cover images.
 * Run with: npx tsx scripts/publish-drafts.ts
 */
import "dotenv/config";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getSuggestedCoverImageForArticleAsync } from "../lib/article-cover-images";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const draftsRoot = path.join(repoRoot, "articles");

const DRAFTS = [
  {
    file: "protein-timing-guide.md",
    title: "توقيت البروتين: دليلك الشامل لتحقيق أقصى فوائد التعافي العضلي",
    excerpt: "تعرف على أفضل أوقات تناول البروتين لتعزيز نمو العضلات وتسريع التعافي بعد التمارين الشاقة",
    categoryName: "التغذية الرياضية",
  },
  {
    file: "push-up-exercises-guide.md",
    title: "تمارين الضغط: دليلك الشامل لبناء عضلات الصدر القوية",
    excerpt: "تعرف على أسرار تمارين الضغط الفعالة لبناء عضلات الصدر والكتفين والذراعين",
    categoryName: "بناء العضلات والأداء",
  },
];

async function main() {
  const publishedAt = new Date().toISOString();

  for (const draft of DRAFTS) {
    const filePath = path.join(draftsRoot, draft.file);
    const raw = await readFile(filePath, "utf8");

    // Fetch Pexels cover image
    const coverImageUrl = await getSuggestedCoverImageForArticleAsync({
      title: draft.title,
      excerpt: draft.excerpt,
      categoryName: draft.categoryName,
    });

    console.log(`\n[${draft.file}]`);
    console.log(`  cover: ${coverImageUrl}`);

    // Update frontmatter fields
    let updated = raw
      .replace(/^coverImageUrl:.*$/m, `coverImageUrl: "${coverImageUrl}"`)
      .replace(/^status:.*$/m, `status: "published"`)
      .replace(/^publishedAt:.*$/m, `publishedAt: "${publishedAt}"`);

    await writeFile(filePath, updated, "utf8");
    console.log(`  status: published ✓`);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
