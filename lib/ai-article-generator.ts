import "server-only";

import Groq from "groq-sdk";

import { prisma } from "@/lib/prisma";
import { CATEGORY_DEFINITIONS, getCategorySlugFromName } from "@/lib/site";
import { createSlug } from "@/lib/slug";

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

type GeneratedSection = {
  heading: string;
  content: string;
};

type ClaudeArticleOutput = {
  title: string;
  category: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  readingTime: string;
  pexelsQuery: string;
  sections: GeneratedSection[];
};

export type GeneratedArticleResult = {
  postId: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
};

async function getPublishedArticlesForStyleAnalysis() {
  try {
    return await prisma.post.findMany({
      where: { status: "published" },
      select: {
        title: true,
        excerpt: true,
        category: { select: { name: true } },
        sections: {
          orderBy: { sortOrder: "asc" as const },
          select: { heading: true, content: true },
          take: 4,
        },
      },
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      take: 4,
    });
  } catch {
    return [];
  }
}

/** Extracts the Pexels photo ID from a URL like:
 *  https://images.pexels.com/photos/12345/pexels-photo-12345.jpeg?...
 *  Returns null if the URL is not a Pexels photo URL.
 */
function extractPexelsPhotoId(url: string): string | null {
  const match = url.match(/pexels\.com\/photos\/(\d+)\//);
  return match?.[1] ?? null;
}

async function getExistingPexelsPhotoIds(): Promise<Set<string>> {
  try {
    const posts = await prisma.post.findMany({
      where: { coverImageUrl: { not: null } },
      select: { coverImageUrl: true },
    });

    const ids = new Set<string>();

    for (const post of posts) {
      if (!post.coverImageUrl) continue;
      const id = extractPexelsPhotoId(post.coverImageUrl);
      if (id) ids.add(id);
    }

    return ids;
  } catch {
    return new Set();
  }
}

async function fetchUniquePexelsCoverImage(
  query: string,
  existingPhotoIds: Set<string>,
): Promise<string | null> {
  if (!PEXELS_API_KEY) return null;

  for (let page = 1; page <= 8; page++) {
    const url = new URL("https://api.pexels.com/v1/search");
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", "10");
    url.searchParams.set("page", String(page));
    url.searchParams.set("orientation", "landscape");
    url.searchParams.set("size", "large");

    try {
      const response = await fetch(url.toString(), {
        headers: { Authorization: PEXELS_API_KEY },
      });

      if (!response.ok) continue;

      const data = await response.json();
      const photos: { id: number; src: { large2x?: string; large?: string } }[] =
        data.photos ?? [];

      for (const photo of photos) {
        const photoId = String(photo.id);
        if (existingPhotoIds.has(photoId)) continue;

        const photoUrl = photo.src?.large2x ?? photo.src?.large ?? null;
        if (photoUrl) return photoUrl;
      }
    } catch {
      continue;
    }
  }

  return null;
}

function buildStyleExamples(
  articles: Awaited<ReturnType<typeof getPublishedArticlesForStyleAnalysis>>,
): string {
  if (articles.length === 0) {
    return "لا توجد مقالات منشورة بعد.";
  }

  return articles
    .map((article, i) => {
      const sectionsText = article.sections
        .map((s) => `### ${s.heading}\n${s.content.slice(0, 400)}`)
        .join("\n\n");

      return `--- مثال ${i + 1} ---
العنوان: ${article.title}
الفئة: ${article.category.name}
المقتطف: ${article.excerpt}

${sectionsText}`;
    })
    .join("\n\n");
}

function availableCategoryNames(): string {
  return CATEGORY_DEFINITIONS.map((c) => c.name).join("، ");
}

async function generateWithGroq(
  styleExamples: string,
): Promise<ClaudeArticleOutput> {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const systemPrompt = `أنت كاتب محتوى عربي متخصص في اللياقة البدنية والتغذية الرياضية. تكتب لمدونة "المعضّل" وأسلوبك يتسم بـ:
- الأسلوب العلمي المبسط باللغة العربية الفصيحة
- الاستشهاد بمصادر علمية موثوقة مثل ISSN وACSM وCDC وجامعات معروفة
- تقديم نصائح عملية وقابلة للتطبيق في الحياة اليومية
- التشجيع والحماس في نهاية المقالات
- استخدام الجداول والقوائم المرقمة عند الحاجة

الفئات المتاحة في الموقع: ${availableCategoryNames()}

تخرج دائماً JSON صحيح فقط بدون أي نص إضافي أو code blocks.`;

  const userPrompt = `بناءً على هذه الأمثلة من أسلوب كتابة المدونة:

${styleExamples}

---

اكتب الآن مقالة جديدة وفريدة تماماً عن موضوع لياقة بدنية أو تغذية رياضية لم يُتناول في الأمثلة أعلاه.

أخرج النتيجة كـ JSON صحيح فقط:

{
  "title": "عنوان المقالة الكامل",
  "category": "اسم الفئة الدقيق من القائمة المتاحة",
  "excerpt": "مقتطف وصفي جذاب من جملتين يلخص المقالة",
  "seoTitle": "عنوان SEO مع الكلمة المفتاحية الرئيسية",
  "seoDescription": "وصف SEO واضح بين 150-160 حرف",
  "readingTime": "X دقائق",
  "pexelsQuery": "english fitness photo search query for cover image",
  "sections": [
    { "heading": "المقدمة", "content": "محتوى تفصيلي..." },
    { "heading": "عنوان القسم 2", "content": "..." },
    { "heading": "عنوان القسم 3", "content": "..." },
    { "heading": "عنوان القسم 4", "content": "..." },
    { "heading": "عنوان القسم 5", "content": "..." },
    { "heading": "عنوان القسم 6", "content": "..." },
    { "heading": "الخلاصة", "content": "..." }
  ]
}

المتطلبات:
- 7 أقسام على الأقل بمحتوى تفصيلي حقيقي
- كل قسم يحتوي على 3 فقرات أو أكثر
- استشهد بمصادر علمية حقيقية مع روابطها
- pexelsQuery بالإنجليزية ومرتبط بموضوع المقالة`;

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 6000,
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0]?.message?.content ?? "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("لم يتمكن الذكاء الاصطناعي من إنتاج مقالة صالحة");
  }

  const parsed = JSON.parse(jsonMatch[0]) as ClaudeArticleOutput;

  if (!parsed.title || !parsed.sections?.length) {
    throw new Error("استجابة الذكاء الاصطناعي غير مكتملة");
  }

  return parsed;
}

async function resolveUniqueSlug(base: string): Promise<string> {
  let slug = base || `ai-article-${Date.now()}`;
  let attempt = 0;

  while (true) {
    const existing = await prisma.post.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) break;

    attempt++;
    slug = `${base}-${attempt}`;
  }

  return slug;
}

export async function generateAiArticle(): Promise<GeneratedArticleResult> {
  // 1. Load existing articles for style analysis (best effort)
  const [existingArticles, existingPhotoIds] = await Promise.all([
    getPublishedArticlesForStyleAnalysis(),
    getExistingPexelsPhotoIds(),
  ]);

  const styleExamples = buildStyleExamples(existingArticles);

  // 2. Generate article content with Groq (Llama 3)
  const generated = await generateWithGroq(styleExamples);

  // 3. Normalize category to one of the known categories
  const validCategory =
    CATEGORY_DEFINITIONS.find((c) => c.name === generated.category)?.name ??
    CATEGORY_DEFINITIONS[0].name;
  const categorySlug = getCategorySlugFromName(validCategory);

  // 4. Fetch a unique cover image from Pexels (compare by photo ID, not full URL)
  const coverImageUrl = await fetchUniquePexelsCoverImage(
    generated.pexelsQuery,
    existingPhotoIds,
  );

  // 5. Resolve a unique slug
  const slug = await resolveUniqueSlug(createSlug(generated.title));

  // 6. Save to database
  return await prisma.$transaction(async (tx) => {
    const category = await tx.category.upsert({
      where: { name: validCategory },
      update: { slug: categorySlug },
      create: { name: validCategory, slug: categorySlug },
    });

    const post = await tx.post.create({
      data: {
        title: generated.title,
        slug,
        excerpt: generated.excerpt,
        categoryId: category.id,
        coverImageUrl: coverImageUrl ?? null,
        seoTitle: generated.seoTitle || generated.title,
        seoDescription:
          generated.seoDescription || generated.excerpt || generated.title,
        status: "pending_approval",
        publishedAt: null,
        readingTime: generated.readingTime || null,
      },
      select: { id: true },
    });

    // Build sections with unique anchors
    const usedAnchors = new Set<string>();
    const sections = generated.sections
      .filter((s) => s.content?.trim())
      .map((section, index) => {
        const heading = section.heading?.trim() || `القسم ${index + 1}`;
        const baseAnchor = createSlug(heading) || `section-${index + 1}`;
        let anchor = baseAnchor;
        let suffix = 2;

        while (usedAnchors.has(anchor)) {
          anchor = `${baseAnchor}-${suffix}`;
          suffix++;
        }

        usedAnchors.add(anchor);

        return {
          postId: post.id,
          heading,
          anchor,
          content: section.content.trim(),
          sortOrder: index + 1,
        };
      });

    if (sections.length > 0) {
      await tx.postSection.createMany({ data: sections });
    }

    return {
      postId: post.id,
      title: generated.title,
      slug,
      category: validCategory,
      excerpt: generated.excerpt,
    };
  });
}
