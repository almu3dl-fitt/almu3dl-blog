import "dotenv/config";

import { access, copyFile, mkdir, readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { decodeSlugValue } from "../lib/slug";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing in the current environment.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const backupRoot = path.resolve(process.cwd(), "..");
const publicUploadsRoot = path.join(process.cwd(), "public", "legacy-uploads");
const uploadSourceRoots = [
  path.join(backupRoot, "wp-content", "uploads"),
  path.join(process.cwd(), "tmp", "backup-uploads", "uploads"),
];
const articleMarker = '<div class="entry-content clearfix single-post-content">';
const articleEndMarkers = [
  '<div class="heateor_sss_sharing_container',
  '<div class="entry-terms post-tags',
  "</article>",
];

type ImportedSection = {
  heading: string;
  anchor: string;
  content: string;
  sortOrder: number;
};

type ImportedArticlePayload = {
  excerpt: string | null;
  coverImageUrl: string | null;
  mediaUrls: string[];
  sections: ImportedSection[];
};

type UploadCandidate = {
  sourceRoot: string;
  relativePath: string;
  baseName: string;
  normalizedBaseName: string;
};

const copiedAssetCache = new Map<string, string>();
let uploadIndexPromise: Promise<UploadCandidate[]> | null = null;

function stripEdgeSlashes(value: string) {
  return value.trim().replace(/^\/+|\/+$/g, "");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, decimal) =>
      String.fromCodePoint(Number.parseInt(decimal, 10)),
    )
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&ldquo;/gi, '"')
    .replace(/&rdquo;/gi, '"')
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripTags(value: string) {
  return value.replace(/<[^>]+>/g, " ");
}

function cleanText(value: string) {
  return decodeHtmlEntities(stripTags(value))
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasMeaningfulContent(value: string) {
  return cleanText(value).length > 0 || /<img\b/i.test(value);
}

function normalizeUploadBaseName(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();
  const stem = path
    .basename(fileName, extension)
    .toLowerCase()
    .replace(/-scaled(?:-\d+)?/g, "")
    .replace(/-\d+x\d+$/g, "");

  return `${stem}${extension}`;
}

async function collectUploadFiles(
  sourceRoot: string,
  currentDir: string,
  relativeDir = "",
): Promise<UploadCandidate[]> {
  const entries = await readdir(currentDir, { withFileTypes: true });
  const files: UploadCandidate[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(currentDir, entry.name);
    const relativePath = path.posix.join(relativeDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectUploadFiles(sourceRoot, absolutePath, relativePath)));
      continue;
    }

    files.push({
      sourceRoot,
      relativePath,
      baseName: entry.name.toLowerCase(),
      normalizedBaseName: normalizeUploadBaseName(entry.name),
    });
  }

  return files;
}

function getUploadIndex() {
  if (!uploadIndexPromise) {
    uploadIndexPromise = (async () => {
      const uploadFiles = await Promise.all(
        uploadSourceRoots.map(async (sourceRoot) => {
          if (!(await fileExists(sourceRoot))) {
            return [];
          }

          return collectUploadFiles(sourceRoot, sourceRoot);
        }),
      );

      return uploadFiles.flat();
    })();
  }

  return uploadIndexPromise;
}

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function extractWpUploadRelativePath(rawValue: string) {
  const normalized = rawValue
    .trim()
    .replace(/^https?:\/\/(?:www\.)?almu3dl\.com/i, "");
  const match = normalized.match(/\/wp-content\/uploads\/(.+)$/i);

  if (!match) {
    return null;
  }

  return decodeURIComponent(match[1].split("?")[0] ?? "").replace(/^\/+/, "");
}

async function resolveUploadSource(rawValue: string) {
  const relativePath = extractWpUploadRelativePath(rawValue);

  if (!relativePath) {
    return null;
  }

  for (const sourceRoot of uploadSourceRoots) {
    const exactPath = path.join(sourceRoot, relativePath);

    if (await fileExists(exactPath)) {
      return {
        sourceRoot,
        relativePath,
      };
    }
  }

  const uploadIndex = await getUploadIndex();
  const targetBaseName = path.basename(relativePath).toLowerCase();
  const targetNormalized = normalizeUploadBaseName(targetBaseName);

  const exactBaseMatch = uploadIndex.find((candidate) => candidate.baseName === targetBaseName);
  if (exactBaseMatch) {
    return exactBaseMatch;
  }

  const normalizedMatch = uploadIndex.find(
    (candidate) => candidate.normalizedBaseName === targetNormalized,
  );

  return normalizedMatch ?? null;
}

async function ensureLocalPublicAsset(rawValue: string) {
  if (copiedAssetCache.has(rawValue)) {
    return copiedAssetCache.get(rawValue)!;
  }

  const resolvedAsset = await resolveUploadSource(rawValue);

  if (!resolvedAsset) {
    return null;
  }

  const sourcePath = path.join(resolvedAsset.sourceRoot, resolvedAsset.relativePath);
  const destinationPath = path.join(publicUploadsRoot, resolvedAsset.relativePath);
  await mkdir(path.dirname(destinationPath), { recursive: true });
  await copyFile(sourcePath, destinationPath);

  const publicPath = `/legacy-uploads/${resolvedAsset.relativePath.replace(/\\/g, "/")}`;
  copiedAssetCache.set(rawValue, publicPath);
  return publicPath;
}

function stripSlugPhrase(value: string, slug: string) {
  const slugPhrase = decodeSlugValue(slug).replace(/[-_]+/g, " ").trim();

  if (!/[a-z]/i.test(slugPhrase)) {
    return value;
  }

  return value.replace(new RegExp(escapeRegExp(slugPhrase), "gi"), " ");
}

function makeAnchor(text: string, index: number) {
  const cleaned = text
    .trim()
    .replace(/^[0-9٠-٩]+[\-.\s]*/, "")
    .slice(0, 64);

  return (
    cleaned
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\u0600-\u06FFa-z0-9\-]/gi, "")
      .replace(/\-+/g, "-")
      .replace(/^\-|\-$/g, "") || `section-${index + 1}`
  );
}

function ensureUniqueAnchor(anchor: string, usedAnchors: Set<string>, index: number) {
  const baseAnchor = anchor || `section-${index + 1}`;
  let candidate = baseAnchor;
  let suffix = 2;

  while (usedAnchors.has(candidate)) {
    candidate = `${baseAnchor}-${suffix}`;
    suffix += 1;
  }

  usedAnchors.add(candidate);
  return candidate;
}

function extractAttributeValue(attributes: string, name: string) {
  const match = attributes.match(
    new RegExp(`${name}\\s*=\\s*(\"([^\"]*)\"|'([^']*)')`, "i"),
  );

  if (!match) {
    return null;
  }

  return match[2] ?? match[3] ?? null;
}

function sanitizeSectionHtml(value: string) {
  let html = value.trim();

  html = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  html = html.replace(/<style[\s\S]*?<\/style>/gi, "");
  html = html.replace(/<\/?span[^>]*>/gi, "");
  html = html.replace(/<p>\s*(?:&nbsp;|\u00A0|\s|<br\s*\/?>)*<\/p>/gi, "");

  html = html.replace(/<a\b([^>]*)>/gi, (_, attributes: string) => {
    const href = extractAttributeValue(attributes, "href") ?? "#";
    return `<a href="${escapeHtmlAttribute(href)}">`;
  });

  html = html.replace(/<img\b([^>]*)>/gi, (_, attributes: string) => {
    const src =
      extractAttributeValue(attributes, "src") ??
      extractAttributeValue(attributes, "data-src");

    if (!src) {
      return "";
    }

    const alt = extractAttributeValue(attributes, "alt") ?? "";
    return `<img src="${escapeHtmlAttribute(src)}" alt="${escapeHtmlAttribute(alt)}">`;
  });

  const simpleTags = [
    "p",
    "strong",
    "em",
    "br",
    "blockquote",
    "figure",
    "figcaption",
    "ul",
    "ol",
    "li",
  ];

  for (const tag of simpleTags) {
    html = html.replace(new RegExp(`<${tag}\\b[^>]*>`, "gi"), `<${tag}>`);
  }

  html = html.replace(
    /<(?!\/?(?:p|a|strong|em|br|blockquote|figure|figcaption|img|ul|ol|li)\b)[^>]+>/gi,
    "",
  );

  return html.replace(/\n{3,}/g, "\n\n").trim();
}

function convertInternalHref(value: string) {
  if (/^(#|mailto:|tel:)/i.test(value)) {
    return value;
  }

  if (/^javascript:/i.test(value)) {
    return "#";
  }

  const normalized = value.replace(/^https?:\/\/(?:www\.)?almu3dl\.com/i, "");

  if (!normalized.startsWith("/")) {
    return value;
  }

  const [pathWithoutHash, hashFragment] = normalized.split("#", 2);
  const cleanedPath = (pathWithoutHash ?? "/").split("?")[0] ?? "/";

  if (!cleanedPath || cleanedPath === "/") {
    return "/";
  }

  if (
    cleanedPath.startsWith("/wp-content/uploads/") ||
    cleanedPath.startsWith("/legacy-uploads/") ||
    cleanedPath.startsWith("/articles/")
  ) {
    return cleanedPath;
  }

  if (/^\/(category|tag|author|feed|comments|wp-|xmlrpc\.php)/i.test(cleanedPath)) {
    return "/articles";
  }

  const trimmed = stripEdgeSlashes(cleanedPath);
  if (!trimmed || trimmed.includes("/")) {
    return "/articles";
  }

  const nextHref = `/articles/${decodeSlugValue(trimmed)}`;
  return hashFragment ? `${nextHref}#${hashFragment}` : nextHref;
}

async function rewriteHtmlAssetsAndLinks(rawHtml: string, slug: string) {
  let html = stripSlugPhrase(rawHtml, slug);
  const uploadUrls = Array.from(
    new Set(
      Array.from(
        html.matchAll(/(?:src|href|data-src)=["']([^"']*(?:\/wp-content\/uploads\/[^"']+))["']/gi),
      ).map((match) => match[1]),
    ),
  );

  const mediaUrls: string[] = [];
  for (const uploadUrl of uploadUrls) {
    const publicPath = await ensureLocalPublicAsset(uploadUrl);
    if (!publicPath) {
      continue;
    }

    html = html.split(uploadUrl).join(publicPath);
    mediaUrls.push(publicPath);
  }

  html = html.replace(/href=(["'])([^"']+)\1/gi, (_, quote: string, href: string) => {
    return `href=${quote}${convertInternalHref(href)}${quote}`;
  });

  return {
    html,
    mediaUrls,
  };
}

function extractEntryContent(html: string) {
  const start = html.indexOf(articleMarker);
  if (start === -1) {
    return null;
  }

  const afterMarker = html.slice(start + articleMarker.length);
  const endIndex = articleEndMarkers
    .map((marker) => afterMarker.indexOf(marker))
    .filter((index) => index >= 0)
    .sort((left, right) => left - right)[0];

  if (typeof endIndex !== "number") {
    return afterMarker.trim();
  }

  return afterMarker.slice(0, endIndex).trim();
}

function extractFeaturedImage(html: string) {
  const featuredMatch = html.match(
    /<div class="single-featured">[\s\S]*?<a[^>]+href="([^"]+)"/i,
  );
  if (featuredMatch?.[1]) {
    return featuredMatch[1];
  }

  const ogMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
  return ogMatch?.[1] ?? null;
}

function extractHeadingAnchor(headingHtml: string) {
  const nestedSpanMatch = headingHtml.match(/<span[^>]+id="([^"]+)"/i);
  if (nestedSpanMatch?.[1]) {
    return nestedSpanMatch[1];
  }

  const headingMatch = headingHtml.match(/<h[1-6][^>]+id="([^"]+)"/i);
  return headingMatch?.[1] ?? null;
}

function buildSectionsFromHtml(html: string) {
  const headingPattern = /<h([23])\b[^>]*>[\s\S]*?<\/h\1>/gi;
  const matches = Array.from(html.matchAll(headingPattern));
  const sections: ImportedSection[] = [];
  const usedAnchors = new Set<string>();

  const pushSection = (heading: string, anchorSource: string, content: string) => {
    const sanitizedContent = sanitizeSectionHtml(content);

    if (!hasMeaningfulContent(sanitizedContent)) {
      return;
    }

    const anchor = ensureUniqueAnchor(
      makeAnchor(cleanText(anchorSource || heading), sections.length),
      usedAnchors,
      sections.length,
    );

    sections.push({
      heading: cleanText(heading) || `القسم ${sections.length + 1}`,
      anchor,
      content: sanitizedContent,
      sortOrder: sections.length + 1,
    });
  };

  if (matches.length === 0) {
    pushSection("المقدمة", "المقدمة", html);
    return sections;
  }

  const introContent = html.slice(0, matches[0].index ?? 0).trim();
  if (hasMeaningfulContent(introContent)) {
    pushSection("المقدمة", "المقدمة", introContent);
  }

  matches.forEach((match, index) => {
    const headingHtml = match[0];
    const headingText = stripTags(headingHtml);
    const contentStart = (match.index ?? 0) + headingHtml.length;
    const contentEnd = matches[index + 1]?.index ?? html.length;
    const sectionContent = html.slice(contentStart, contentEnd).trim();
    const extractedAnchor = extractHeadingAnchor(headingHtml) ?? headingText;

    pushSection(headingText, extractedAnchor, sectionContent);
  });

  return sections;
}

function buildExcerptFromSections(sections: ImportedSection[]) {
  const combinedText = sections
    .map((section) => cleanText(section.content))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (!combinedText) {
    return null;
  }

  return combinedText.length > 220 ? `${combinedText.slice(0, 217).trim()}...` : combinedText;
}

async function resolveBackupArticlePath(slug: string) {
  const decodedSlug = decodeSlugValue(slug);
  const candidates = Array.from(
    new Set([
      path.join(backupRoot, slug, "index.html"),
      path.join(backupRoot, decodedSlug, "index.html"),
      path.join(backupRoot, encodeURIComponent(decodedSlug), "index.html"),
    ]),
  );

  for (const candidate of candidates) {
    if (await fileExists(candidate)) {
      return candidate;
    }
  }

  return null;
}

async function importArticleFromBackup(slug: string): Promise<ImportedArticlePayload | null> {
  const backupPath = await resolveBackupArticlePath(slug);
  if (!backupPath) {
    return null;
  }

  const html = await readFile(backupPath, "utf8");
  const entryContent = extractEntryContent(html);

  if (!entryContent) {
    return null;
  }

  const rewritten = await rewriteHtmlAssetsAndLinks(entryContent, slug);
  const sections = buildSectionsFromHtml(rewritten.html);
  const excerpt = buildExcerptFromSections(sections);
  const featuredImage = extractFeaturedImage(html);
  const localCoverImage = featuredImage ? await ensureLocalPublicAsset(featuredImage) : null;

  return {
    excerpt,
    coverImageUrl: localCoverImage,
    mediaUrls: Array.from(
      new Set([
        ...(localCoverImage ? [localCoverImage] : []),
        ...rewritten.mediaUrls,
      ]),
    ),
    sections,
  };
}

async function main() {
  const posts = await prisma.post.findMany({
    where: { status: "published" },
    orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImageUrl: true,
    },
  });

  let importedCount = 0;
  const missingArticles: string[] = [];

  for (const post of posts) {
    const imported = await importArticleFromBackup(post.slug);

    if (!imported) {
      missingArticles.push(post.slug);
      continue;
    }

    const operations = [
      prisma.post.update({
        where: { id: post.id },
        data: {
          excerpt: imported.excerpt ?? post.excerpt,
          coverImageUrl: imported.coverImageUrl ?? post.coverImageUrl,
          seoTitle: post.title,
          seoDescription: imported.excerpt ?? post.excerpt ?? post.title,
        },
      }),
      prisma.postSection.deleteMany({
        where: { postId: post.id },
      }),
      prisma.media.deleteMany({
        where: { postId: post.id },
      }),
    ];

    if (imported.mediaUrls.length > 0) {
      operations.push(
        prisma.media.createMany({
          data: imported.mediaUrls.map((url, index) => ({
            postId: post.id,
            url,
            altText: index === 0 ? post.title : null,
            type: index === 0 ? "cover" : "inline",
          })),
        }),
      );
    }

    if (imported.sections.length > 0) {
      operations.push(
        prisma.postSection.createMany({
          data: imported.sections.map((section) => ({
            postId: post.id,
            heading: section.heading,
            anchor: section.anchor,
            content: section.content,
            sortOrder: section.sortOrder,
          })),
        }),
      );
    }

    await prisma.$transaction(operations);

    importedCount += 1;
    console.log(`Imported backup content for: ${post.slug}`);
  }

  console.log(`\nImported full backup content for ${importedCount} posts.`);

  if (missingArticles.length > 0) {
    console.log(`Missing backup HTML for ${missingArticles.length} posts:`);
    for (const slug of missingArticles) {
      console.log(`- ${slug}`);
    }
  }
}

main()
  .catch((error) => {
    console.error("Backup import failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
