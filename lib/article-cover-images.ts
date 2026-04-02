const CATEGORY_FALLBACK_COVER_URLS: Record<string, string> = {
  "التغذية الرياضية":
    "https://almu3dl.com/wp-content/uploads/2022/12/protein.png",
  "خسارة الدهون":
    "https://almu3dl.com/wp-content/uploads/2022/12/fat-burning-sports.png",
  "بناء العضلات والأداء":
    "https://almu3dl.com/wp-content/uploads/2022/12/bodybuilding-for-beginners.jpg",
  "المستلزمات الرياضية":
    "https://almu3dl.com/wp-content/uploads/2022/12/what-is-compression-clothing-for.png",
  "المكملات الغذائية":
    "https://almu3dl.com/wp-content/uploads/2022/12/creatine.png",
  "الصحة العامة":
    "https://almu3dl.com/wp-content/uploads/2022/12/Energy-drinks.jpg",
  "الوصفات الصحية":
    "https://almu3dl.com/wp-content/uploads/2022/12/healthy-recipes-for-steak.png",
  "أسلوب الحياة الرياضي":
    "https://almu3dl.com/wp-content/uploads/2023/05/BinZainFitness.com-1-1.jpg",
};

const LEGACY_COVER_IMAGE_ALIASES: Record<string, string> = {
  "/articles/protein-timing-guide.svg":
    "https://almu3dl.com/wp-content/uploads/2022/12/protein.png",
  "/articles/push-up-exercises-guide.svg":
    "https://almu3dl.com/wp-content/uploads/2022/12/bodybuilding-for-beginners.jpg",
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
};

const DEFAULT_FALLBACK_COVER_IMAGE =
  CATEGORY_FALLBACK_COVER_URLS["التغذية الرياضية"];

function cleanCoverImageUrl(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

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

export function resolveCoverImageUrl(
  value: string | null | undefined,
  categoryName?: string | null,
) {
  const normalized = normalizeCoverImageForStorage(value);

  if (!normalized) {
    return getCategoryFallbackCoverImage(categoryName);
  }

  if (/\.svg(?:[?#].*)?$/i.test(normalized)) {
    return getCategoryFallbackCoverImage(categoryName);
  }

  return normalized;
}
