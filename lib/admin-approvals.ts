import "server-only";

import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/slug";
import {
  CATEGORY_DEFINITIONS,
  getCategoryDefinitionByName,
  getCategorySlugFromName,
} from "@/lib/site";
import {
  getStoreRecommendation,
  type StoreRecommendation,
} from "@/lib/store-recommendations";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const draftsRoot = path.join(repoRoot, "articles");

const CATEGORY_ALIASES: Record<string, string> = {
  "تغذية رياضية": "التغذية الرياضية",
  "تمارين رياضية": "بناء العضلات والأداء",
};

export type ApprovalItemSource = "database" | "draft";

export type ApprovalItem = {
  id: string;
  source: ApprovalItemSource;
  title: string;
  excerpt: string;
  category: { name: string };
  submittedAt: string | null;
  status: string;
  reviewHref: string | null;
  fileName: string | null;
};

export type ApprovalReviewSection = {
  id: string;
  heading: string;
  anchor: string;
  content: string;
  sortOrder: number;
};

export type ApprovalReviewItem = {
  id: string;
  source: ApprovalItemSource;
  title: string;
  slug: string;
  excerpt: string;
  category: { name: string };
  submittedAt: string | null;
  status: string;
  fileName: string | null;
  readingTime: string | null;
  coverImageUrl: string;
  sourceUrl: string | null;
  originalityNote: string;
  storeRecommendation: StoreRecommendation | null;
  editHref: string | null;
  seoTitle: string;
  seoDescription: string;
  sections: ApprovalReviewSection[];
};

export type DraftApprovalUpdateInput = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  coverImageUrl?: string;
  seoTitle: string;
  seoDescription: string;
  sourceUrl?: string;
  sections: {
    heading: string;
    content: string;
  }[];
};

type DraftSection = {
  heading: string;
  anchor: string;
  content: string;
  sortOrder: number;
};

type PendingDraft = {
  draftId: string;
  fileName: string;
  filePath: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  coverImageUrl: string | null;
  seoTitle: string;
  seoDescription: string;
  publishedAt: string | null;
  status: string;
  readingTime: string | null;
  sourceUrl: string | null;
  submittedAt: string | null;
  sections: DraftSection[];
};

function splitFrontmatter(raw: string) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);

  if (!match) {
    return {
      frontmatter: "",
      body: raw,
    };
  }

  return {
    frontmatter: match[1],
    body: match[2],
  };
}

function parseFrontmatterScalar(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return "";
  if (trimmed === "null") return null;

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function getFrontmatterValue(frontmatter: string, key: string) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = frontmatter.match(new RegExp(`^${escapedKey}:\\s*(.+)$`, "m"));
  return match ? parseFrontmatterScalar(match[1]) : null;
}

function stringifyFrontmatterValue(value: string | null) {
  return value === null ? "null" : JSON.stringify(value);
}

function setFrontmatterValue(frontmatter: string, key: string, value: string | null) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const nextLine = `${key}: ${stringifyFrontmatterValue(value)}`;
  const matcher = new RegExp(`^${escapedKey}:\\s*.*$`, "m");

  if (matcher.test(frontmatter)) {
    return frontmatter.replace(matcher, nextLine);
  }

  return frontmatter.trim().length > 0
    ? `${frontmatter.trimEnd()}\n${nextLine}`
    : nextLine;
}

function extractPublishingNotesBlock(body: string) {
  const match = body.match(/\n---\s*\n\s*##\s+معلومات إضافية للنشر[\s\S]*$/u);
  return match?.[0]?.trim() ?? "";
}

function stripPublishingNotes(body: string) {
  return body
    .replace(/\n---\s*\n\s*##\s+معلومات إضافية للنشر[\s\S]*$/u, "")
    .trim();
}

function extractReadingTime(body: string) {
  const match = body.match(/\*\*وقت القراءة\*\*:\s*(.+)$/m);
  return match?.[1]?.trim() ?? null;
}

function normalizeMarkdownContent(content: string) {
  return content
    .replace(/\r/g, "")
    .replace(/^###\s+/gm, "")
    .replace(/^####\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(
      /\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noreferrer">$1</a>',
    )
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function ensureUniqueAnchor(anchor: string, usedAnchors: Set<string>, index: number) {
  const base = anchor || `section-${index + 1}`;
  let candidate = base;
  let suffix = 2;

  while (usedAnchors.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  usedAnchors.add(candidate);
  return candidate;
}

function buildSectionsFromMarkdown(body: string) {
  const cleanedBody = stripPublishingNotes(body);

  if (!cleanedBody) {
    return [];
  }

  const lines = cleanedBody.split("\n");
  const sections: DraftSection[] = [];
  const usedAnchors = new Set<string>();

  let currentHeading = "المقدمة";
  let currentLines: string[] = [];

  const pushSection = () => {
    const content = normalizeMarkdownContent(currentLines.join("\n"));

    if (!content) {
      currentLines = [];
      return;
    }

    const anchor = ensureUniqueAnchor(
      createSlug(currentHeading) || `section-${sections.length + 1}`,
      usedAnchors,
      sections.length,
    );

    sections.push({
      heading: currentHeading,
      anchor,
      content,
      sortOrder: sections.length + 1,
    });

    currentLines = [];
  };

  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.+)$/);

    if (headingMatch) {
      pushSection();
      currentHeading = headingMatch[1].trim();
      continue;
    }

    currentLines.push(line);
  }

  pushSection();

  return sections;
}

function normalizeCategoryName(categoryName: string) {
  const trimmed = categoryName.trim();

  if (!trimmed) {
    return "التغذية الرياضية";
  }

  if (CATEGORY_DEFINITIONS.some((category) => category.name === trimmed)) {
    return trimmed;
  }

  return CATEGORY_ALIASES[trimmed] ?? trimmed;
}

function resolveCoverImage(categoryName: string, coverImageUrl?: string | null) {
  const cleanedUrl = coverImageUrl?.trim();

  if (cleanedUrl) {
    return cleanedUrl;
  }

  return getCategoryDefinitionByName(categoryName).imagePath;
}

function buildOriginalityNote(source: ApprovalItemSource, sourceUrl?: string | null) {
  if (sourceUrl?.trim()) {
    return "يوجد رابط مصدر خارجي مرفق، لذلك يجب التأكد يدويًا من الأصالة وحقوق النشر قبل الاعتماد.";
  }

  if (source === "draft") {
    return "المقالة محفوظة كمسودة محلية داخل المشروع ولا يوجد رابط مصدر خارجي مرفق. التحقق النهائي من الأصالة يظل مراجعة تحريرية يدوية.";
  }

  return "المقالة محفوظة داخل نظام الإدارة ولا يوجد رابط مصدر خارجي مرفق هنا. التحقق التحريري النهائي من الأصالة يبقى مطلوبًا قبل النشر.";
}

function getCategorySlug(categoryName: string) {
  return CATEGORY_DEFINITIONS.some((category) => category.name === categoryName)
    ? getCategorySlugFromName(categoryName)
    : createSlug(categoryName);
}

function toDraftId(fileName: string) {
  return fileName.replace(/\.md$/i, "");
}

function resolveDraftFilePath(draftId: string) {
  const normalized = draftId.endsWith(".md") ? draftId : `${draftId}.md`;
  const safeFileName = path.basename(normalized);

  if (safeFileName !== normalized) {
    throw new Error("Invalid draft id");
  }

  return {
    fileName: safeFileName,
    filePath: path.join(draftsRoot, safeFileName),
  };
}

async function readDraft(draftId: string) {
  const { fileName, filePath } = resolveDraftFilePath(draftId);
  const raw = await readFile(filePath, "utf8");
  const fileStats = await stat(filePath);
  const { frontmatter, body } = splitFrontmatter(raw);

  const title =
    (getFrontmatterValue(frontmatter, "title") ?? toDraftId(fileName)).trim();
  const excerpt = (getFrontmatterValue(frontmatter, "excerpt") ?? "").trim();
  const category = normalizeCategoryName(
    getFrontmatterValue(frontmatter, "category") ?? "",
  );
  const coverImageUrl = (
    getFrontmatterValue(frontmatter, "coverImageUrl") ??
    getFrontmatterValue(frontmatter, "image")
  )?.trim() ?? null;
  const slug = (
    getFrontmatterValue(frontmatter, "slug") ?? createSlug(title)
  ).trim();
  const seoTitle =
    (getFrontmatterValue(frontmatter, "seoTitle") ?? title).trim();
  const seoDescription = (
    getFrontmatterValue(frontmatter, "metaDescription") ??
    getFrontmatterValue(frontmatter, "seoDescription") ??
    excerpt ??
    title
  ).trim();
  const status = (getFrontmatterValue(frontmatter, "status") ?? "draft").trim();
  const sourceUrl = (getFrontmatterValue(frontmatter, "sourceUrl") ?? "").trim() || null;

  return {
    draftId: toDraftId(fileName),
    fileName,
    filePath,
    title,
    slug,
    category,
    excerpt,
    coverImageUrl,
    seoTitle,
    seoDescription,
    publishedAt: getFrontmatterValue(frontmatter, "publishedAt"),
    status,
    readingTime: extractReadingTime(body),
    sourceUrl,
    submittedAt: fileStats.mtime.toISOString(),
    sections: buildSectionsFromMarkdown(body),
  } satisfies PendingDraft;
}

async function updateDraftFrontmatter(
  filePath: string,
  updates: Record<string, string | null | undefined>,
) {
  const raw = await readFile(filePath, "utf8");
  const { frontmatter, body } = splitFrontmatter(raw);

  let nextFrontmatter = frontmatter;

  for (const [key, value] of Object.entries(updates)) {
    if (typeof value === "undefined") continue;
    nextFrontmatter = setFrontmatterValue(nextFrontmatter, key, value);
  }

  const nextContent = `---\n${nextFrontmatter.trim()}\n---\n\n${body.trimStart()}`;
  await writeFile(filePath, nextContent, "utf8");
}

function buildApprovalReviewPath(source: ApprovalItemSource, id: string) {
  return `/admin/approvals?reviewSource=${source}&reviewId=${encodeURIComponent(id)}`;
}

function buildDraftBody(
  sections: DraftApprovalUpdateInput["sections"],
  existingBody: string,
) {
  const contentBlocks = sections
    .map((section, index) => ({
      heading: section.heading.trim() || `القسم ${index + 1}`,
      content: section.content.trim(),
    }))
    .filter((section) => section.content.length > 0)
    .map((section) => `## ${section.heading}\n\n${section.content}`)
    .join("\n\n");

  const publishingNotes = extractPublishingNotesBlock(existingBody);

  if (!publishingNotes) {
    return contentBlocks.trim();
  }

  return contentBlocks.trim().length > 0
    ? `${contentBlocks.trim()}\n\n${publishingNotes}`
    : publishingNotes;
}

async function listPendingDatabaseApprovals() {
  const articles = await prisma.post.findMany({
    where: { status: "pending_approval" },
    select: {
      id: true,
      title: true,
      excerpt: true,
      status: true,
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  });

  return articles.map(
    (article) =>
      ({
        id: `db:${article.id}`,
        source: "database",
        title: article.title,
        excerpt: article.excerpt ?? "",
        category: article.category,
        submittedAt: null,
        status: article.status,
        reviewHref: buildApprovalReviewPath("database", `db:${article.id}`),
        fileName: null,
      }) satisfies ApprovalItem,
  );
}

async function listPendingDraftApprovals() {
  try {
    const files = await readdir(draftsRoot);
    const pendingDrafts = await Promise.all(
      files
        .filter((fileName) => fileName.endsWith(".md"))
        .map((fileName) => readDraft(fileName)),
    );

    return pendingDrafts
      .filter((draft) => draft.status === "pending")
      .map(
        (draft) =>
          ({
            id: `draft:${draft.draftId}`,
            source: "draft",
            title: draft.title,
            excerpt: draft.excerpt,
            category: { name: draft.category },
            submittedAt: draft.submittedAt,
            status: draft.status,
            reviewHref: buildApprovalReviewPath("draft", `draft:${draft.draftId}`),
            fileName: draft.fileName,
          }) satisfies ApprovalItem,
      );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function getDatabaseApprovalReviewItem(id: string) {
  const articleId = parseDatabaseId(id);

  const article = await prisma.post.findUnique({
    where: { id: articleId },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImageUrl: true,
      status: true,
      readingTime: true,
      seoTitle: true,
      seoDescription: true,
      category: {
        select: {
          name: true,
        },
      },
      sections: {
        orderBy: {
          sortOrder: "asc",
        },
        select: {
          id: true,
          heading: true,
          anchor: true,
          content: true,
          sortOrder: true,
        },
      },
    },
  });

  if (!article) {
    return null;
  }

  return {
    id,
    source: "database",
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt ?? "",
    category: article.category,
    submittedAt: null,
    status: article.status,
    fileName: null,
    readingTime: article.readingTime,
    coverImageUrl: resolveCoverImage(article.category.name, article.coverImageUrl),
    sourceUrl: null,
    originalityNote: buildOriginalityNote("database"),
    storeRecommendation: getStoreRecommendation({
      categoryName: article.category.name,
      title: article.title,
      excerpt: article.excerpt,
      sections: article.sections,
    }),
    editHref: `/admin/articles/${article.id}/edit`,
    seoTitle: article.seoTitle ?? article.title,
    seoDescription: article.seoDescription ?? article.excerpt ?? article.title,
    sections: article.sections.map((section) => ({
      id: `db-section:${section.id}`,
      heading: section.heading,
      anchor: section.anchor,
      content: section.content,
      sortOrder: section.sortOrder,
    })),
  } satisfies ApprovalReviewItem;
}

async function getDraftApprovalReviewItem(id: string) {
  const draft = await readDraft(parseDraftId(id));

  return {
    id,
    source: "draft",
    title: draft.title,
    slug: draft.slug,
    excerpt: draft.excerpt,
    category: { name: draft.category },
    submittedAt: draft.submittedAt,
    status: draft.status,
    fileName: draft.fileName,
    readingTime: draft.readingTime,
    coverImageUrl: resolveCoverImage(draft.category, draft.coverImageUrl),
    sourceUrl: draft.sourceUrl,
    originalityNote: buildOriginalityNote("draft", draft.sourceUrl),
    storeRecommendation: getStoreRecommendation({
      categoryName: draft.category,
      title: draft.title,
      excerpt: draft.excerpt,
      sections: draft.sections,
    }),
    editHref: null,
    seoTitle: draft.seoTitle,
    seoDescription: draft.seoDescription,
    sections: draft.sections.map((section, index) => ({
      id: `draft-section:${index + 1}`,
      heading: section.heading,
      anchor: section.anchor,
      content: section.content,
      sortOrder: section.sortOrder,
    })),
  } satisfies ApprovalReviewItem;
}

function parseDatabaseId(id: string) {
  const numericId = parseInt(id.replace(/^db:/, ""), 10);

  if (!Number.isInteger(numericId)) {
    throw new Error("Invalid article id");
  }

  return numericId;
}

function parseDraftId(id: string) {
  const draftId = id.replace(/^draft:/, "").trim();

  if (!draftId) {
    throw new Error("Invalid draft id");
  }

  return draftId;
}

async function approveDatabaseArticle(id: string) {
  const articleId = parseDatabaseId(id);

  const article = await prisma.post.findUnique({
    where: { id: articleId },
    select: {
      id: true,
      publishedAt: true,
    },
  });

  if (!article) {
    throw new Error("Article not found");
  }

  await prisma.post.update({
    where: { id: articleId },
    data: {
      status: "published",
      publishedAt: article.publishedAt ?? new Date(),
    },
  });
}

async function rejectDatabaseArticle(id: string) {
  const articleId = parseDatabaseId(id);

  await prisma.post.update({
    where: { id: articleId },
    data: {
      status: "rejected",
      publishedAt: null,
    },
  });
}

async function approveDraftArticle(id: string) {
  const draft = await readDraft(parseDraftId(id));
  const publishedAt = new Date();
  const categoryName = normalizeCategoryName(draft.category);
  const categorySlug = getCategorySlug(categoryName);

  await prisma.$transaction(async (tx) => {
    const category = await tx.category.upsert({
      where: { name: categoryName },
      update: {
        slug: categorySlug,
      },
      create: {
        name: categoryName,
        slug: categorySlug,
      },
    });

    const post = await tx.post.upsert({
      where: { slug: draft.slug },
      update: {
        title: draft.title,
        excerpt: draft.excerpt,
        categoryId: category.id,
        coverImageUrl: draft.coverImageUrl,
        seoTitle: draft.seoTitle,
        seoDescription: draft.seoDescription,
        status: "published",
        publishedAt,
        ...(draft.readingTime ? { readingTime: draft.readingTime } : {}),
      },
      create: {
        slug: draft.slug,
        title: draft.title,
        excerpt: draft.excerpt,
        categoryId: category.id,
        coverImageUrl: draft.coverImageUrl,
        seoTitle: draft.seoTitle,
        seoDescription: draft.seoDescription,
        status: "published",
        publishedAt,
        ...(draft.readingTime ? { readingTime: draft.readingTime } : {}),
      },
      select: {
        id: true,
      },
    });

    await tx.postSection.deleteMany({
      where: { postId: post.id },
    });

    if (draft.sections.length > 0) {
      await tx.postSection.createMany({
        data: draft.sections.map((section) => ({
          postId: post.id,
          heading: section.heading,
          anchor: section.anchor,
          content: section.content,
          sortOrder: section.sortOrder,
        })),
      });
    }
  });

  await updateDraftFrontmatter(draft.filePath, {
    status: "published",
    publishedAt: publishedAt.toISOString(),
    rejectionReason: null,
  });
}

async function rejectDraftArticle(id: string, reason?: string) {
  const draft = await readDraft(parseDraftId(id));

  await updateDraftFrontmatter(draft.filePath, {
    status: "rejected",
    publishedAt: null,
    rejectionReason: reason?.trim() ? reason.trim() : null,
  });
}

export async function listPendingApprovalItems() {
  const [databaseItems, draftItems] = await Promise.all([
    listPendingDatabaseApprovals(),
    listPendingDraftApprovals(),
  ]);

  return [...draftItems, ...databaseItems].sort((left, right) => {
    const leftTime = left.submittedAt ? new Date(left.submittedAt).getTime() : 0;
    const rightTime = right.submittedAt ? new Date(right.submittedAt).getTime() : 0;
    return rightTime - leftTime;
  });
}

export async function getApprovalReviewItem(
  source: ApprovalItemSource,
  id: string,
) {
  if (source === "database") {
    return getDatabaseApprovalReviewItem(id);
  }

  return getDraftApprovalReviewItem(id);
}

export async function updateDraftApprovalItem(
  id: string,
  input: DraftApprovalUpdateInput,
) {
  const draft = await readDraft(parseDraftId(id));
  const raw = await readFile(draft.filePath, "utf8");
  const { frontmatter, body } = splitFrontmatter(raw);

  let nextFrontmatter = frontmatter;
  nextFrontmatter = setFrontmatterValue(nextFrontmatter, "title", input.title.trim());
  nextFrontmatter = setFrontmatterValue(nextFrontmatter, "slug", input.slug.trim());
  nextFrontmatter = setFrontmatterValue(
    nextFrontmatter,
    "category",
    normalizeCategoryName(input.category),
  );
  nextFrontmatter = setFrontmatterValue(nextFrontmatter, "excerpt", input.excerpt.trim());
  nextFrontmatter = setFrontmatterValue(
    nextFrontmatter,
    "seoTitle",
    input.seoTitle.trim(),
  );
  nextFrontmatter = setFrontmatterValue(
    nextFrontmatter,
    "metaDescription",
    input.seoDescription.trim(),
  );
  nextFrontmatter = setFrontmatterValue(
    nextFrontmatter,
    "coverImageUrl",
    input.coverImageUrl?.trim() ? input.coverImageUrl.trim() : null,
  );
  nextFrontmatter = setFrontmatterValue(
    nextFrontmatter,
    "sourceUrl",
    input.sourceUrl?.trim() ? input.sourceUrl.trim() : null,
  );

  const nextBody = buildDraftBody(input.sections, body);
  const nextContent = `---\n${nextFrontmatter.trim()}\n---\n\n${nextBody.trimStart()}`;

  await writeFile(draft.filePath, nextContent, "utf8");

  return getDraftApprovalReviewItem(id);
}

export async function approveApprovalItem(source: ApprovalItemSource, id: string) {
  if (source === "database") {
    await approveDatabaseArticle(id);
    return;
  }

  await approveDraftArticle(id);
}

export async function rejectApprovalItem(
  source: ApprovalItemSource,
  id: string,
  reason?: string,
) {
  if (source === "database") {
    await rejectDatabaseArticle(id);
    return;
  }

  await rejectDraftArticle(id, reason);
}
