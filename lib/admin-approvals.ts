import "server-only";

import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/slug";
import { CATEGORY_DEFINITIONS, getCategorySlugFromName } from "@/lib/site";

const draftsRoot = path.join(process.cwd(), "articles");

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
  seoTitle: string;
  seoDescription: string;
  publishedAt: string | null;
  status: string;
  readingTime: string | null;
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
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
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

  return {
    draftId: toDraftId(fileName),
    fileName,
    filePath,
    title,
    slug,
    category,
    excerpt,
    seoTitle,
    seoDescription,
    publishedAt: getFrontmatterValue(frontmatter, "publishedAt"),
    status,
    readingTime: extractReadingTime(body),
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
        reviewHref: `/admin/articles/${article.id}/edit`,
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
            reviewHref: null,
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
