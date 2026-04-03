type ArticleCoverSectionInput = {
  heading?: string | null;
  content?: string | null;
};

type SuggestedArticleCoverInput = {
  title?: string | null;
  excerpt?: string | null;
  categoryName?: string | null;
  sections?: ArticleCoverSectionInput[];
};

const FREE_LOCAL_COVER_IMAGES = {
  protein: "/legacy-uploads/2022/12/protein.png",
  muscleMealPlan: "/legacy-uploads/2022/12/build-muscle-meal-plan.png",
  soyProtein: "/legacy-uploads/2022/12/soy-free-protein-powder.jpg",
  fatLoss: "/legacy-uploads/2022/12/fat-burning-sports.png",
  loseFat: "/legacy-uploads/2022/12/lose-fat-and-gain-muscle.png",
  heavyWeights: "/legacy-uploads/2022/12/benefits-of-lifting-heavy-weights.png",
  gym: "/legacy-uploads/2022/12/gym.png",
  compressionGear: "/legacy-uploads/2022/12/what-is-compression-clothing-for.png",
  creatine: "/legacy-uploads/2022/12/creatine.png",
  fishOil: "/legacy-uploads/2022/12/fish-oil.png",
  energy: "/legacy-uploads/2022/12/Energy-drinks.jpg",
  wellness: "/legacy-uploads/2022/12/pexels-viktoria-slowikowska-5678040-scaled.jpg.webp",
  healthyRecipe: "/legacy-uploads/2022/12/healthy-recipes-for-steak.png",
  healthyCookies: "/legacy-uploads/2022/12/healthy-chocolate-chip-cookies.png",
  athleticLifestyle: "/legacy-uploads/2022/12/pexels-ron-lach-10222727-scaled-1-1024x683.jpg",
  gymRecovery: "/legacy-uploads/2022/12/gym-with-sauna.png",
} as const;

const CATEGORY_FALLBACK_COVER_URLS: Record<string, string> = {
  "التغذية الرياضية": FREE_LOCAL_COVER_IMAGES.protein,
  "خسارة الدهون": FREE_LOCAL_COVER_IMAGES.fatLoss,
  "بناء العضلات والأداء": FREE_LOCAL_COVER_IMAGES.heavyWeights,
  "المستلزمات الرياضية": FREE_LOCAL_COVER_IMAGES.compressionGear,
  "المكملات الغذائية": FREE_LOCAL_COVER_IMAGES.creatine,
  "الصحة العامة": FREE_LOCAL_COVER_IMAGES.wellness,
  "الوصفات الصحية": FREE_LOCAL_COVER_IMAGES.healthyRecipe,
  "أسلوب الحياة الرياضي": FREE_LOCAL_COVER_IMAGES.athleticLifestyle,
};

const LEGACY_COVER_IMAGE_ALIASES: Record<string, string> = {
  "/articles/protein-timing-guide.svg": FREE_LOCAL_COVER_IMAGES.protein,
  "/articles/push-up-exercises-guide.svg": FREE_LOCAL_COVER_IMAGES.heavyWeights,
  "/articles/categories/sports-nutrition.svg":
    CATEGORY_FALLBACK_COVER_URLS["التغذية الرياضية"],
  "/articles/categories/fat-loss.svg":
    CATEGORY_FALLBACK_COVER_URLS["خسارة الدهون"],
  "/articles/categories/strength-performance.svg":
    CATEGORY_FALLBACK_COVER_URLS["بناء العضلات والأداء"],
  "/articles/categories/sports-gear.svg":
    CATEGORY_FALLBACK_COVER_URLS["المستلزمات الرياضية"],
  "/articles/categories/supplements.svg":
    CATEGORY_FALLBACK_COVER_URLS["المكملات الغذائية"],
  "/articles/categories/general-health.svg":
    CATEGORY_FALLBACK_COVER_URLS["الصحة العامة"],
  "/articles/categories/healthy-recipes.svg":
    CATEGORY_FALLBACK_COVER_URLS["الوصفات الصحية"],
  "/articles/categories/athletic-lifestyle.svg":
    CATEGORY_FALLBACK_COVER_URLS["أسلوب الحياة الرياضي"],
  "https://almu3dl.com/wp-content/uploads/2022/12/protein.png":
    FREE_LOCAL_COVER_IMAGES.protein,
  "https://www.almu3dl.com/wp-content/uploads/2022/12/protein.png":
    FREE_LOCAL_COVER_IMAGES.protein,
  "https://almu3dl.com/wp-content/uploads/2022/12/fat-burning-sports.png":
    FREE_LOCAL_COVER_IMAGES.fatLoss,
  "https://www.almu3dl.com/wp-content/uploads/2022/12/fat-burning-sports.png":
    FREE_LOCAL_COVER_IMAGES.fatLoss,
  "https://almu3dl.com/wp-content/uploads/2022/12/bodybuilding-for-beginners.jpg":
    FREE_LOCAL_COVER_IMAGES.heavyWeights,
  "https://www.almu3dl.com/wp-content/uploads/2022/12/bodybuilding-for-beginners.jpg":
    FREE_LOCAL_COVER_IMAGES.heavyWeights,
  "https://almu3dl.com/wp-content/uploads/2022/12/what-is-compression-clothing-for.png":
    FREE_LOCAL_COVER_IMAGES.compressionGear,
  "https://www.almu3dl.com/wp-content/uploads/2022/12/what-is-compression-clothing-for.png":
    FREE_LOCAL_COVER_IMAGES.compressionGear,
  "https://almu3dl.com/wp-content/uploads/2022/12/creatine.png":
    FREE_LOCAL_COVER_IMAGES.creatine,
  "https://www.almu3dl.com/wp-content/uploads/2022/12/creatine.png":
    FREE_LOCAL_COVER_IMAGES.creatine,
  "https://almu3dl.com/wp-content/uploads/2022/12/Energy-drinks.jpg":
    FREE_LOCAL_COVER_IMAGES.energy,
  "https://www.almu3dl.com/wp-content/uploads/2022/12/Energy-drinks.jpg":
    FREE_LOCAL_COVER_IMAGES.energy,
  "https://almu3dl.com/wp-content/uploads/2022/12/healthy-recipes-for-steak.png":
    FREE_LOCAL_COVER_IMAGES.healthyRecipe,
  "https://www.almu3dl.com/wp-content/uploads/2022/12/healthy-recipes-for-steak.png":
    FREE_LOCAL_COVER_IMAGES.healthyRecipe,
  "https://almu3dl.com/wp-content/uploads/2023/05/BinZainFitness.com-1-1.jpg":
    FREE_LOCAL_COVER_IMAGES.athleticLifestyle,
  "https://www.almu3dl.com/wp-content/uploads/2023/05/BinZainFitness.com-1-1.jpg":
    FREE_LOCAL_COVER_IMAGES.athleticLifestyle,
};

const DEFAULT_FALLBACK_COVER_IMAGE =
  CATEGORY_FALLBACK_COVER_URLS["التغذية الرياضية"];

function cleanCoverImageUrl(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

function normalizeSearchableText(value: string | null | undefined) {
  return value
    ?.toLocaleLowerCase("ar")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim() ?? "";
}

const COVER_IMAGE_KEYWORD_RULES: Array<{
  imagePath: string;
  keywords: string[];
}> = [
  {
    imagePath: FREE_LOCAL_COVER_IMAGES.creatine,
    keywords: ["كرياتين", "creatine", "مونوهيدرات", "monohydrate"],
  },
  {
    imagePath: FREE_LOCAL_COVER_IMAGES.fishOil,
    keywords: ["fish oil", "omega", "omega 3", "اوميغا", "أوميغا", "سمك", "سلمون"],
  },
  {
    imagePath: FREE_LOCAL_COVER_IMAGES.protein,
    keywords: [
      "بروتين",
      "protein",
      "whey",
      "تعافي",
      "recovery",
      "amino",
      "leucine",
      "حمض أميني",
    ],
  },
  {
    imagePath: FREE_LOCAL_COVER_IMAGES.muscleMealPlan,
    keywords: [
      "خطة غذائية",
      "meal plan",
      "وجبة",
      "وجبات",
      "meal prep",
      "calorie",
      "سعرات",
    ],
  },
  {
    imagePath: FREE_LOCAL_COVER_IMAGES.healthyRecipe,
    keywords: ["وصفة", "recipe", "steak", "طبخ", "طبخة", "مطبخ", "meal"],
  },
  {
    imagePath: FREE_LOCAL_COVER_IMAGES.healthyCookies,
    keywords: ["cookie", "cookies", "كوكيز", "حلى", "حلويات", "snack"],
  },
  {
    imagePath: FREE_LOCAL_COVER_IMAGES.fatLoss,
    keywords: [
      "دهون",
      "تنشيف",
      "fat loss",
      "fat burning",
      "weight loss",
      "خسارة الوزن",
      "حرق الدهون",
    ],
  },
  {
    imagePath: FREE_LOCAL_COVER_IMAGES.loseFat,
    keywords: ["body recomposition", "وزن", "weight", "عجز", "deficit"],
  },
  {
    imagePath: FREE_LOCAL_COVER_IMAGES.heavyWeights,
    keywords: [
      "ضغط",
      "push up",
      "push-up",
      "تمرين",
      "تمارين",
      "صدر",
      "كتف",
      "أوزان",
      "weights",
      "strength",
      "muscle",
      "عضلات",
    ],
  },
  {
    imagePath: FREE_LOCAL_COVER_IMAGES.compressionGear,
    keywords: ["gear", "معدات", "مستلزمات", "compression", "ملابس", "أداة", "اداة"],
  },
  {
    imagePath: FREE_LOCAL_COVER_IMAGES.gymRecovery,
    keywords: ["sauna", "استشفاء", "recovery day", "روتين النادي", "gym routine"],
  },
  {
    imagePath: FREE_LOCAL_COVER_IMAGES.energy,
    keywords: ["طاقة", "energy", "كافيين", "caffeine", "مشروبات الطاقة"],
  },
  {
    imagePath: FREE_LOCAL_COVER_IMAGES.wellness,
    keywords: ["صحة", "health", "نوم", "sleep", "تعافي عام", "wellness"],
  },
];

export function getCategoryFallbackCoverImage(categoryName?: string | null) {
  const cleanedCategoryName = categoryName?.trim();

  if (!cleanedCategoryName) {
    return DEFAULT_FALLBACK_COVER_IMAGE;
  }

  return (
    CATEGORY_FALLBACK_COVER_URLS[cleanedCategoryName] ?? DEFAULT_FALLBACK_COVER_IMAGE
  );
}

export function normalizeCoverImageForStorage(value: string | null | undefined) {
  const cleaned = cleanCoverImageUrl(value);

  if (!cleaned) {
    return null;
  }

  return LEGACY_COVER_IMAGE_ALIASES[cleaned] ?? cleaned;
}

export function getSuggestedCoverImageForArticle(
  input: SuggestedArticleCoverInput,
) {
  const searchableText = normalizeSearchableText(
    [
      input.title,
      input.excerpt,
      ...(input.sections?.flatMap((section) => [section.heading, section.content]) ?? []),
    ]
      .filter(Boolean)
      .join(" "),
  );

  if (searchableText) {
    const matchedRule = COVER_IMAGE_KEYWORD_RULES.find((rule) =>
      rule.keywords.some((keyword) =>
        searchableText.includes(normalizeSearchableText(keyword)),
      ),
    );

    if (matchedRule) {
      return matchedRule.imagePath;
    }
  }

  return getCategoryFallbackCoverImage(input.categoryName);
}

export function resolveArticleCoverImageUrl(
  input: SuggestedArticleCoverInput & {
    coverImageUrl?: string | null;
  },
) {
  const normalized = normalizeCoverImageForStorage(input.coverImageUrl);

  if (normalized && !/\.svg(?:[?#].*)?$/i.test(normalized)) {
    return normalized;
  }

  return getSuggestedCoverImageForArticle(input);
}

export function resolveCoverImageUrl(
  value: string | null | undefined,
  categoryName?: string | null,
) {
  return resolveArticleCoverImageUrl({
    coverImageUrl: value,
    categoryName,
  });
}
