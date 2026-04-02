import "server-only";

import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  normalizeCoverImageForStorage,
  resolveCoverImageUrl,
} from "@/lib/article-cover-images";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/lib/slug";
import {
  CATEGORY_DEFINITIONS,
  getCategorySlugFromName,
} from "@/lib/site";
import {
  getStoreRecommendation,
  type StoreRecommendation,
} from "@/lib/store-recommendations";

const draftsRoot = path.join(/* turbopackIgnore: true */ process.cwd(), "articles");

const CATEGORY_ALIASES: Record<string, string> = {
  "تغذية رياضية": "التغذية الرياضية",
  "تمارين رياضية": "بناء العضلات والأداء",
};

const DRAFT_SOURCE_MEDIA_TYPE = "draft-source-file";

function logApprovalsDatabaseFallback(scope: string, error: unknown) {
  console.warn(`[admin-approvals] Falling back without database for ${scope}:`, error);
}

const draftOverlayPostSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverImageUrl: true,
  publishedAt: true,
  readingTime: true,
  status: true,
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
  media: {
    where: {
      type: DRAFT_SOURCE_MEDIA_TYPE,
    },
    select: {
      url: true,
      altText: true,
      type: true,
    },
  },
} as const;

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

type DraftOverlayPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: Date | null;
  readingTime: string | null;
  status: string;
  seoTitle: string | null;
  seoDescription: string | null;
  category: {
    name: string;
  };
  sections: {
    id: number;
    heading: string;
    anchor: string;
    content: string;
    sortOrder: number;
  }[];
  media: {
    url: string;
    altText: string | null;
    type: string | null;
  }[];
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

function normalizeDraftSectionsForStorage(
  sections: DraftApprovalUpdateInput["sections"],
) {
  const usedAnchors = new Set<string>();

  return sections
    .map((section, index) => {
      const heading = section.heading.trim() || `القسم ${index + 1}`;
      const content = section.content.trim();

      if (!content) {
        return null;
      }

      return {
        heading,
        anchor: ensureUniqueAnchor(createSlug(heading), usedAnchors, index),
        content,
        sortOrder: index + 1,
      };
    })
    .filter((section): section is DraftSection => section !== null);
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
  return resolveCoverImageUrl(coverImageUrl, categoryName);
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

function isPendingDraftOverlayStatus(status: string) {
  return status === "draft" || status === "pending_approval";
}

function getDraftSourceUrlFromOverlay(overlay: DraftOverlayPost | null) {
  return overlay?.media[0]?.altText?.trim() || null;
}

async function findDraftOverlayPostByFileName(fileName: string) {
  try {
    return await (prisma.post.findFirst({
      where: {
        media: {
          some: {
            type: DRAFT_SOURCE_MEDIA_TYPE,
            url: fileName,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
      select: draftOverlayPostSelect,
    }) as Promise<DraftOverlayPost | null>);
  } catch (error) {
    logApprovalsDatabaseFallback(`draft overlay lookup for "${fileName}"`, error);
    return null;
  }
}

async function listDraftOverlayPostsByFileName(fileNames: string[]) {
  if (fileNames.length === 0) {
    return [];
  }

  try {
    return await (prisma.post.findMany({
      where: {
        media: {
          some: {
            type: DRAFT_SOURCE_MEDIA_TYPE,
            url: {
              in: fileNames,
            },
          },
        },
      },
      select: draftOverlayPostSelect,
    }) as Promise<DraftOverlayPost[]>);
  } catch (error) {
    logApprovalsDatabaseFallback("draft overlay list", error);
    return [];
  }
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
    filePath: path.join(/* turbopackIgnore: true */ draftsRoot, safeFileName),
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
  const coverImageUrl = normalizeCoverImageForStorage(
    (
    getFrontmatterValue(frontmatter, "coverImageUrl") ??
    getFrontmatterValue(frontmatter, "image")
    )?.trim() ?? null,
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

function buildDraftReviewItem(
  id: string,
  draft: PendingDraft,
  overlay?: DraftOverlayPost | null,
) {
  const effectiveCategoryName = overlay?.category.name ?? draft.category;
  const effectiveTitle = overlay?.title ?? draft.title;
  const effectiveExcerpt = overlay?.excerpt ?? draft.excerpt;
  const effectiveSections = overlay?.sections.length ? overlay.sections : draft.sections;
  const effectiveStatus =
    overlay && !isPendingDraftOverlayStatus(overlay.status)
      ? overlay.status
      : draft.status;
  const effectiveSourceUrl = getDraftSourceUrlFromOverlay(overlay ?? null) ?? draft.sourceUrl;

  return {
    id,
    source: "draft",
    title: effectiveTitle,
    slug: overlay?.slug ?? draft.slug,
    excerpt: effectiveExcerpt,
    category: { name: effectiveCategoryName },
    submittedAt: draft.submittedAt,
    status: effectiveStatus,
    fileName: draft.fileName,
    readingTime: overlay?.readingTime ?? draft.readingTime,
    coverImageUrl: resolveCoverImage(
      effectiveCategoryName,
      overlay?.coverImageUrl ?? draft.coverImageUrl,
    ),
    sourceUrl: effectiveSourceUrl,
    originalityNote: buildOriginalityNote("draft", effectiveSourceUrl),
    storeRecommendation: getStoreRecommendation({
      categoryName: effectiveCategoryName,
      title: effectiveTitle,
      excerpt: effectiveExcerpt,
      sections: effectiveSections,
    }),
    editHref: null,
    seoTitle: overlay?.seoTitle ?? draft.seoTitle,
    seoDescription: overlay?.seoDescription ?? draft.seoDescription,
    sections: effectiveSections.map((section, index) => ({
      id: `draft-section:${index + 1}`,
      heading: section.heading,
      anchor: section.anchor,
      content: section.content,
      sortOrder: section.sortOrder,
    })),
  } satisfies ApprovalReviewItem;
}

function buildDraftUpdateInputFromState(
  draft: PendingDraft,
  overlay?: DraftOverlayPost | null,
): DraftApprovalUpdateInput {
  const effectiveSections = overlay?.sections.length ? overlay.sections : draft.sections;

  return {
    title: overlay?.title ?? draft.title,
    slug: overlay?.slug ?? draft.slug,
    excerpt: overlay?.excerpt ?? draft.excerpt,
    category: overlay?.category.name ?? draft.category,
    coverImageUrl: overlay?.coverImageUrl ?? draft.coverImageUrl ?? undefined,
    seoTitle: overlay?.seoTitle ?? draft.seoTitle,
    seoDescription: overlay?.seoDescription ?? draft.seoDescription,
    sourceUrl: getDraftSourceUrlFromOverlay(overlay ?? null) ?? draft.sourceUrl ?? undefined,
    sections: effectiveSections.map((section) => ({
      heading: section.heading,
      content: section.content,
    })),
  };
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

async function syncDraftFrontmatterBestEffort(
  filePath: string,
  updates: Record<string, string | null | undefined>,
) {
  try {
    await updateDraftFrontmatter(filePath, updates);
  } catch (error) {
    console.warn("Draft frontmatter sync skipped:", error);
  }
}

async function upsertDraftOverlayPost(
  draft: PendingDraft,
  input: DraftApprovalUpdateInput,
  status: "draft" | "pending_approval" | "published" | "rejected",
) {
  const overlay = await findDraftOverlayPostByFileName(draft.fileName);
  const title = input.title.trim();
  const slug = input.slug.trim();
  const excerpt = input.excerpt.trim();
  const categoryName = normalizeCategoryName(input.category);
  const categorySlug = getCategorySlug(categoryName);
  const coverImageUrl = normalizeCoverImageForStorage(input.coverImageUrl?.trim());
  const seoTitle = input.seoTitle.trim() || title;
  const seoDescription = input.seoDescription.trim() || excerpt || title;
  const sourceUrl = input.sourceUrl?.trim() ? input.sourceUrl.trim() : null;
  const sections = normalizeDraftSectionsForStorage(input.sections);
  const now = new Date();

  const conflictingPost = await prisma.post.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (conflictingPost && conflictingPost.id !== overlay?.id) {
    throw new Error("يوجد مقال آخر يستخدم هذا الرابط بالفعل");
  }

  return prisma.$transaction(async (tx) => {
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

    let postId = overlay?.id ?? null;

    if (overlay) {
      await tx.post.update({
        where: { id: overlay.id },
        data: {
          title,
          slug,
          excerpt,
          categoryId: category.id,
          coverImageUrl,
          seoTitle,
          seoDescription,
          status,
          publishedAt:
            status === "published" ? overlay.publishedAt ?? now : null,
          readingTime: draft.readingTime ?? overlay.readingTime ?? null,
        },
      });
    } else {
      const createdPost = await tx.post.create({
        data: {
          title,
          slug,
          excerpt,
          categoryId: category.id,
          coverImageUrl,
          seoTitle,
          seoDescription,
          status,
          publishedAt: status === "published" ? now : null,
          readingTime: draft.readingTime,
        },
        select: {
          id: true,
        },
      });

      postId = createdPost.id;
    }

    if (!postId) {
      throw new Error("Failed to persist draft overlay");
    }

    const sourceMediaCount = await tx.media.count({
      where: {
        postId,
        type: DRAFT_SOURCE_MEDIA_TYPE,
        url: draft.fileName,
      },
    });

    if (sourceMediaCount === 0) {
      await tx.media.create({
        data: {
          postId,
          type: DRAFT_SOURCE_MEDIA_TYPE,
          url: draft.fileName,
          altText: sourceUrl,
        },
      });
    } else {
      await tx.media.updateMany({
        where: {
          postId,
          type: DRAFT_SOURCE_MEDIA_TYPE,
          url: draft.fileName,
        },
        data: {
          altText: sourceUrl,
        },
      });
    }

    await tx.postSection.deleteMany({
      where: { postId },
    });

    if (sections.length > 0) {
      await tx.postSection.createMany({
        data: sections.map((section) => ({
          postId,
          heading: section.heading,
          anchor: section.anchor,
          content: section.content,
          sortOrder: section.sortOrder,
        })),
      });
    }

    return tx.post.findUnique({
      where: { id: postId },
      select: draftOverlayPostSelect,
    }) as Promise<DraftOverlayPost>;
  });
}

function buildApprovalReviewPath(source: ApprovalItemSource, id: string) {
  return `/admin/approvals?reviewSource=${source}&reviewId=${encodeURIComponent(id)}`;
}

async function listPendingDatabaseApprovals() {
  try {
    const articles = await prisma.post.findMany({
      where: {
        status: "pending_approval",
        media: {
          none: {
            type: DRAFT_SOURCE_MEDIA_TYPE,
          },
        },
      },
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
  } catch (error) {
    logApprovalsDatabaseFallback("pending database approvals list", error);
    return [];
  }
}

async function listPendingDraftApprovals() {
  try {
    const files = await readdir(draftsRoot);
    const pendingDrafts = await Promise.all(
      files
        .filter((fileName) => fileName.endsWith(".md"))
        .map((fileName) => readDraft(fileName)),
    );
    const overlays = await listDraftOverlayPostsByFileName(
      pendingDrafts.map((draft) => draft.fileName),
    );
    const overlayByFileName = new Map(
      overlays.map((overlay) => [overlay.media[0]?.url ?? "", overlay]),
    );

    return pendingDrafts
      .filter((draft) => draft.status === "pending")
      .flatMap((draft) => {
        const overlay = overlayByFileName.get(draft.fileName);

        if (overlay && !isPendingDraftOverlayStatus(overlay.status)) {
          return [];
        }

        return [
          {
            id: `draft:${draft.draftId}`,
            source: "draft",
            title: overlay?.title ?? draft.title,
            excerpt: overlay?.excerpt ?? draft.excerpt,
            category: { name: overlay?.category.name ?? draft.category },
            submittedAt: draft.submittedAt,
            status: draft.status,
            reviewHref: buildApprovalReviewPath("draft", `draft:${draft.draftId}`),
            fileName: draft.fileName,
          } satisfies ApprovalItem,
        ];
      });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function getDatabaseApprovalReviewItem(id: string) {
  try {
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
  } catch (error) {
    logApprovalsDatabaseFallback(`database review item "${id}"`, error);
    return null;
  }
}

async function getDraftApprovalReviewItem(id: string) {
  const draft = await readDraft(parseDraftId(id));
  const overlay = await findDraftOverlayPostByFileName(draft.fileName);

  return buildDraftReviewItem(id, draft, overlay);
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
  const overlay = await findDraftOverlayPostByFileName(draft.fileName);
  await upsertDraftOverlayPost(
    draft,
    buildDraftUpdateInputFromState(draft, overlay),
    "published",
  );

  await syncDraftFrontmatterBestEffort(draft.filePath, {
    status: "published",
    publishedAt: new Date().toISOString(),
    rejectionReason: null,
  });
}

async function rejectDraftArticle(id: string, reason?: string) {
  const draft = await readDraft(parseDraftId(id));
  const overlay = await findDraftOverlayPostByFileName(draft.fileName);
  await upsertDraftOverlayPost(
    draft,
    buildDraftUpdateInputFromState(draft, overlay),
    "rejected",
  );

  await syncDraftFrontmatterBestEffort(draft.filePath, {
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
  const overlay = await upsertDraftOverlayPost(draft, input, "pending_approval");

  return buildDraftReviewItem(id, draft, overlay);
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
