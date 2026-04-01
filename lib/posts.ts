import "server-only";

import { access } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

import { prisma } from "@/lib/prisma";
import { buildSlugVariants, decodeSlugValue, normalizeSlug } from "@/lib/slug";
import {
  CATEGORY_DEFINITIONS,
  getCategoryDefinitionByName,
  getCategoryNameFromSlug,
  getCategorySlugFromName,
} from "@/lib/site";

const publicRoot = path.join(process.cwd(), "public");
const localAssetCache = new Map<string, Promise<boolean>>();

type CategoryRelation = {
  name: string;
  slug: string;
};

type PostListRecord = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: Date | null;
  readingTime: string | null;
  category: CategoryRelation;
};

type PostDetailRecord = PostListRecord & {
  categoryId: number;
  seoTitle: string | null;
  seoDescription: string | null;
  sections: {
    id: number;
    heading: string;
    anchor: string;
    content: string;
    sortOrder: number;
  }[];
};

export type ArticleListItem = {
  id: number;
  slug: string;
  urlSlug: string;
  href: string;
  title: string;
  excerpt: string;
  coverImageUrl: string;
  publishedAt: Date | null;
  publishedLabel: string;
  readingTime: string;
  category: {
    name: string;
    slug: string;
    imagePath: string;
    description: string;
    accent: string;
  };
};

export type ArticleDetail = ArticleListItem & {
  seoTitle: string;
  seoDescription: string;
  sections: {
    id: number;
    heading: string;
    anchor: string;
    content: string;
    sortOrder: number;
  }[];
  relatedPosts: ArticleListItem[];
};

export type CategorySummary = {
  name: string;
  slug: string;
  description: string;
  imagePath: string;
  accent: string;
  postCount: number;
};

export type SitemapEntry = {
  slug: string;
  publishedAt: Date | null;
};

type ArchiveFilters = {
  query?: string;
  categorySlug?: string;
};

function firstMeaningfulText(value: string | null, fallback: string) {
  const cleaned = value?.trim();
  return cleaned && cleaned.length > 0 ? cleaned : fallback;
}

async function hasLocalAsset(publicPath: string) {
  const normalized = publicPath.split("?")[0];

  if (localAssetCache.has(normalized)) {
    return localAssetCache.get(normalized)!;
  }

  const lookup = access(path.join(publicRoot, normalized.replace(/^\//, "")))
    .then(() => true)
    .catch(() => false);

  localAssetCache.set(normalized, lookup);
  return lookup;
}

async function resolveCoverImage(
  coverImageUrl: string | null,
  categoryName: string,
) {
  const cleanedCoverImageUrl = coverImageUrl?.trim();

  if (!cleanedCoverImageUrl) {
    return getCategoryDefinitionByName(categoryName).imagePath;
  }

  if (/^https?:\/\//i.test(cleanedCoverImageUrl)) {
    return cleanedCoverImageUrl;
  }

  if (
    cleanedCoverImageUrl.startsWith("/") &&
    (await hasLocalAsset(cleanedCoverImageUrl))
  ) {
    return cleanedCoverImageUrl;
  }

  return getCategoryDefinitionByName(categoryName).imagePath;
}

export function formatArabicDate(date: Date | null) {
  if (!date) return "تاريخ غير محدد";

  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function buildArticleHref(slug: string) {
  return `/articles/${decodeSlugValue(slug)}`;
}

async function serializePostListItem(post: PostListRecord) {
  const categoryDefinition = getCategoryDefinitionByName(post.category.name);

  return {
    id: post.id,
    slug: post.slug,
    urlSlug: decodeSlugValue(post.slug),
    href: buildArticleHref(post.slug),
    title: post.title,
    excerpt: firstMeaningfulText(post.excerpt, "محتوى تحريري قيد المراجعة."),
    coverImageUrl: await resolveCoverImage(post.coverImageUrl, post.category.name),
    publishedAt: post.publishedAt,
    publishedLabel: formatArabicDate(post.publishedAt),
    readingTime: firstMeaningfulText(post.readingTime, "قراءة سريعة"),
    category: {
      name: post.category.name,
      slug: getCategorySlugFromName(post.category.name),
      imagePath: categoryDefinition.imagePath,
      description: categoryDefinition.description,
      accent: categoryDefinition.accent,
    },
  } satisfies ArticleListItem;
}

async function serializePostDetail(post: PostDetailRecord) {
  const base = await serializePostListItem(post);

  return {
    ...base,
    seoTitle: firstMeaningfulText(post.seoTitle, post.title),
    seoDescription: firstMeaningfulText(
      post.seoDescription,
      firstMeaningfulText(post.excerpt, post.title),
    ),
    sections: post.sections.map((section, index) => ({
      id: section.id,
      heading:
        section.heading.trim().length > 0
          ? section.heading.trim()
          : `القسم ${index + 1}`,
      anchor: section.anchor,
      content: section.content,
      sortOrder: section.sortOrder,
    })),
  };
}

export const getCategorySummaries = cache(async (): Promise<CategorySummary[]> => {
  const [categories, counts] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, name: true },
    }),
    prisma.post.groupBy({
      by: ["categoryId"],
      where: { status: "published" },
      _count: { _all: true },
    }),
  ]);

  const categoryIdByName = new Map(categories.map((category) => [category.name, category.id]));
  const countByCategoryId = new Map(
    counts.map((item) => [item.categoryId, item._count._all]),
  );

  return CATEGORY_DEFINITIONS.map((definition) => {
    const categoryId = categoryIdByName.get(definition.name);

    return {
      ...definition,
      postCount: categoryId ? countByCategoryId.get(categoryId) ?? 0 : 0,
    };
  });
});

export const getHomePageData = cache(async () => {
  const [posts, totalPosts, categorySummaries] = await Promise.all([
    prisma.post.findMany({
      where: { status: "published" },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImageUrl: true,
        publishedAt: true,
        readingTime: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      take: 9,
    }),
    prisma.post.count({ where: { status: "published" } }),
    getCategorySummaries(),
  ]);

  const serializedPosts = await Promise.all(posts.map(serializePostListItem));
  const [featuredPost, ...latestPosts] = serializedPosts;

  return {
    featuredPost: featuredPost ?? null,
    latestPosts,
    totalPosts,
    totalCategories: categorySummaries.length,
    categorySummaries,
  };
});

export async function getArchivePageData(filters: ArchiveFilters) {
  const query = filters.query?.trim() ?? "";
  const categoryName = getCategoryNameFromSlug(filters.categorySlug ?? "");

  const posts = await prisma.post.findMany({
    where: {
      status: "published",
      ...(categoryName
        ? {
            category: {
              name: categoryName,
            },
          }
        : {}),
      ...(query
        ? {
            OR: [
              {
                title: {
                  contains: query,
                },
              },
              {
                excerpt: {
                  contains: query,
                },
              },
              {
                sections: {
                  some: {
                    content: {
                      contains: query,
                    },
                  },
                },
              },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImageUrl: true,
      publishedAt: true,
      readingTime: true,
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
  });

  return {
    posts: await Promise.all(posts.map(serializePostListItem)),
    categorySummaries: await getCategorySummaries(),
    selectedCategorySlug: filters.categorySlug ?? "",
    selectedCategoryName: categoryName,
    query,
  };
}

export const getPostBySlug = cache(async (inputSlug: string): Promise<ArticleDetail | null> => {
  const exactMatch = await prisma.post.findFirst({
    where: {
      status: "published",
      slug: {
        in: buildSlugVariants(inputSlug),
      },
    },
    select: {
      id: true,
      categoryId: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImageUrl: true,
      publishedAt: true,
      readingTime: true,
      seoTitle: true,
      seoDescription: true,
      category: {
        select: {
          name: true,
          slug: true,
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

  let post = exactMatch as PostDetailRecord | null;

  if (!post) {
    const allPosts = await prisma.post.findMany({
      where: { status: "published" },
      select: {
        id: true,
        slug: true,
      },
    });

    const normalizedInput = normalizeSlug(inputSlug);
    const matchedPost = allPosts.find(
      (candidate) => normalizeSlug(candidate.slug) === normalizedInput,
    );

    if (matchedPost) {
      post = (await prisma.post.findUnique({
        where: { id: matchedPost.id },
        select: {
          id: true,
          categoryId: true,
          slug: true,
          title: true,
          excerpt: true,
          coverImageUrl: true,
          publishedAt: true,
          readingTime: true,
          seoTitle: true,
          seoDescription: true,
          category: {
            select: {
              name: true,
              slug: true,
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
      })) as PostDetailRecord | null;
    }
  }

  if (!post) return null;

  const [serializedPost, relatedPosts] = await Promise.all([
    serializePostDetail(post),
    prisma.post.findMany({
      where: {
        status: "published",
        categoryId: post.categoryId,
        id: { not: post.id },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImageUrl: true,
        publishedAt: true,
        readingTime: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      take: 3,
    }),
  ]);

  return {
    ...serializedPost,
    relatedPosts: await Promise.all(relatedPosts.map(serializePostListItem)),
  };
});

export function readSearchParam(
  value: string | string[] | undefined,
  fallback = "",
) {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

export const getSitemapEntries = cache(async (): Promise<SitemapEntry[]> => {
  return prisma.post.findMany({
    where: { status: "published" },
    select: {
      slug: true,
      publishedAt: true,
    },
    orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
  });
});
