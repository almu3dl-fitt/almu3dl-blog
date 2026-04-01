import "server-only";

import { STORE_URL } from "@/lib/site";

export type StoreRecommendation = {
  href: string;
  title: string;
  description: string;
  ctaLabel: string;
};

type RecommendationRule = {
  categories?: string[];
  keywords: string[];
  recommendation: Omit<StoreRecommendation, "href">;
};

const recommendationRules: RecommendationRule[] = [
  {
    categories: ["المكملات الغذائية"],
    keywords: [
      "بروتين",
      "protein",
      "whey",
      "واي",
      "كرياتين",
      "creatine",
      "مكمل",
      "supplement",
      "امينو",
      "amino",
      "pre workout",
      "فيتامين",
      "vitamin",
      "اوميغا",
      "omega",
    ],
    recommendation: {
      title: "منتجات مكملة مرتبطة بالمحتوى",
      description: "هذا المقال يتقاطع مع منتجات مكملات يمكن تصفحها داخل متجر المعضّل.",
      ctaLabel: "تصفح منتجات المتجر",
    },
  },
  {
    categories: ["المستلزمات الرياضية"],
    keywords: [
      "شيكر",
      "shaker",
      "حزام",
      "belt",
      "strap",
      "ستراب",
      "قفاز",
      "glove",
      "hoodie",
      "هودي",
      "tshirt",
      "تيشيرت",
      "معدات",
      "equipment",
      "accessories",
      "اكسسوار",
    ],
    recommendation: {
      title: "منتجات رياضية مناسبة لهذا المقال",
      description: "الموضوع يرتبط بمستلزمات أو أدوات رياضية قد تكون مناسبة للزائر.",
      ctaLabel: "عرض المنتجات المناسبة",
    },
  },
];

function normalizeArabicText(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0640\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();
}

export function getStoreRecommendation(input: {
  categoryName?: string | null;
  title?: string | null;
  excerpt?: string | null;
  sections?: { content: string }[];
}) {
  const categoryName = input.categoryName?.trim() ?? "";
  const searchText = normalizeArabicText(
    [
      input.title ?? "",
      input.excerpt ?? "",
      ...(input.sections?.map((section) => section.content) ?? []),
    ].join(" "),
  );

  for (const rule of recommendationRules) {
    const categoryMatch =
      rule.categories?.includes(categoryName) ?? false;
    const keywordMatch = rule.keywords.some((keyword) =>
      searchText.includes(normalizeArabicText(keyword)),
    );

    if (categoryMatch || keywordMatch) {
      return {
        href: STORE_URL,
        ...rule.recommendation,
      } satisfies StoreRecommendation;
    }
  }

  return null;
}
