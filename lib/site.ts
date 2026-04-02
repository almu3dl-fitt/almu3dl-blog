import { getCategoryFallbackCoverImage } from "@/lib/article-cover-images";

export const SITE_NAME_AR = "المعضّل";
export const SITE_NAME_LATIN = "Almu3dl";
export const SITE_NAME = `${SITE_NAME_AR} - ${SITE_NAME_LATIN}`;
export const SITE_TAGLINE = "مدونة للياقة والتغذية والأداء الرياضي";
export const SITE_DESCRIPTION =
  "مدونة عن اللياقة والتغذية الرياضية وخسارة الدهون وبناء العضلات والمكملات الغذائية والصحة العامة.";
export const SITE_LOGO_PATH = "/brand/logo.png";
const DEFAULT_SITE_URL = "https://almu3dl-blog.almu3dl.store";
export const STORE_URL = "https://www.almu3dl.store/store";

export const NAV_LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/articles", label: "المقالات" },
  { href: "/about", label: "عن المعضّل" },
  { href: "/contact", label: "تواصل" },
  { href: "/privacy", label: "الخصوصية" },
] as const;

export const FOOTER_LINKS = [
  { href: "/articles", label: "الأرشيف" },
  { href: "/about", label: "عن المعضّل" },
  { href: "/contact", label: "التواصل" },
  { href: "/privacy", label: "سياسة الخصوصية" },
] as const;

export type SocialLink = {
  label: string;
  href: string;
};

export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/bin_zain/",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@almu3dl",
  },
  {
    label: "Snapchat",
    href: "https://www.snapchat.com/add/almu3dl",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@almu3dl",
  },
  {
    label: "Telegram",
    href: "https://t.me/almu3dl",
  },
  {
    label: "X",
    href: "https://x.com/almu3dl",
  },
];

export type CategoryDefinition = {
  name: string;
  slug: string;
  description: string;
  imagePath: string;
  accent: string;
};

export const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    name: "التغذية الرياضية",
    slug: "sports-nutrition",
    description: "خطط الأكل، توقيت العناصر، واستراتيجيات الدعم اليومي للأداء.",
    imagePath: getCategoryFallbackCoverImage("التغذية الرياضية"),
    accent: "from-[#D4AF37]/35 via-[#1A1A1A] to-[#101418]",
  },
  {
    name: "خسارة الدهون",
    slug: "fat-loss",
    description: "مفاهيم التنشيف، التحكم بالسعرات، ورفع كفاءة الحرق بدون فوضى.",
    imagePath: getCategoryFallbackCoverImage("خسارة الدهون"),
    accent: "from-[#0F7B6C]/25 via-[#171717] to-[#101010]",
  },
  {
    name: "بناء العضلات والأداء",
    slug: "strength-performance",
    description: "التدريب، التطور العضلي، وتحسين القوة والتحمل الرياضي.",
    imagePath: getCategoryFallbackCoverImage("بناء العضلات والأداء"),
    accent: "from-[#D4AF37]/30 via-[#151515] to-[#0C0E11]",
  },
  {
    name: "المستلزمات الرياضية",
    slug: "sports-gear",
    description: "اختيار الأدوات والمستلزمات التي ترفع الجودة والالتزام داخل النادي.",
    imagePath: getCategoryFallbackCoverImage("المستلزمات الرياضية"),
    accent: "from-[#8D6B2D]/30 via-[#161616] to-[#0F1114]",
  },
  {
    name: "المكملات الغذائية",
    slug: "supplements",
    description: "مراجعات وتفسيرات عملية للمكملات الشائعة واستخدامها الصحيح.",
    imagePath: getCategoryFallbackCoverImage("المكملات الغذائية"),
    accent: "from-[#D4AF37]/25 via-[#181818] to-[#121212]",
  },
  {
    name: "الصحة العامة",
    slug: "general-health",
    description: "المؤشرات الصحية، الاستشفاء، النوم، والعادات الداعمة للاستمرارية.",
    imagePath: getCategoryFallbackCoverImage("الصحة العامة"),
    accent: "from-[#0F7B6C]/22 via-[#171717] to-[#0E1112]",
  },
  {
    name: "الوصفات الصحية",
    slug: "healthy-recipes",
    description: "وصفات عملية تحافظ على الطعم وتخدم الهدف الغذائي اليومي.",
    imagePath: getCategoryFallbackCoverImage("الوصفات الصحية"),
    accent: "from-[#D4AF37]/25 via-[#171717] to-[#121315]",
  },
  {
    name: "أسلوب الحياة الرياضي",
    slug: "athletic-lifestyle",
    description: "تنظيم الروتين، الاستمرارية، والقرارات الصغيرة التي تصنع الفارق.",
    imagePath: getCategoryFallbackCoverImage("أسلوب الحياة الرياضي"),
    accent: "from-[#0F7B6C]/20 via-[#171717] to-[#121212]",
  },
];

const categoryByName = new Map(
  CATEGORY_DEFINITIONS.map((category) => [category.name, category]),
);
const categoryBySlug = new Map(
  CATEGORY_DEFINITIONS.map((category) => [category.slug, category]),
);

type StoreHighlight = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
};

const DEFAULT_STORE_HIGHLIGHT: StoreHighlight = {
  eyebrow: "روابط مرتبطة",
  title: "مواد مرتبطة بالموضوع",
  description:
    "يمكن الوصول إلى المنتجات والخيارات ذات الصلة من خلال المتجر عند الحاجة.",
  ctaLabel: "المتجر",
};

const STORE_HIGHLIGHTS_BY_CATEGORY: Record<string, Omit<StoreHighlight, "eyebrow">> =
  {
    "التغذية الرياضية": {
      title: "روابط مرتبطة بالتغذية الرياضية",
      description:
        "مواد وخيارات ذات صلة بتنظيم الوجبات والتوقيت الغذائي.",
      ctaLabel: "المتجر",
    },
    "خسارة الدهون": {
      title: "روابط مرتبطة بخسارة الدهون",
      description:
        "خيارات ذات صلة بالتنظيم الغذائي ومراحل خفض الدهون.",
      ctaLabel: "المتجر",
    },
    "بناء العضلات والأداء": {
      title: "روابط مرتبطة بالأداء وبناء العضلات",
      description:
        "مواد وخيارات ذات صلة بالتدريب والتطور العضلي.",
      ctaLabel: "المتجر",
    },
    "المستلزمات الرياضية": {
      title: "روابط مرتبطة بالمستلزمات الرياضية",
      description:
        "أدوات ومستلزمات يمكن الرجوع إليها عند الحاجة.",
      ctaLabel: "المتجر",
    },
    "المكملات الغذائية": {
      title: "روابط مرتبطة بالمكملات الغذائية",
      description:
        "خيارات ذات صلة بالمكملات المذكورة ضمن هذا التصنيف.",
      ctaLabel: "المتجر",
    },
    "الصحة العامة": {
      title: "روابط مرتبطة بالصحة العامة",
      description:
        "خيارات ذات صلة بالروتين الصحي والاستشفاء.",
      ctaLabel: "المتجر",
    },
    "الوصفات الصحية": {
      title: "روابط مرتبطة بالوصفات الصحية",
      description:
        "عناصر ذات صلة بالتحضير والتنظيم الغذائي.",
      ctaLabel: "المتجر",
    },
    "أسلوب الحياة الرياضي": {
      title: "روابط مرتبطة بأسلوب الحياة الرياضي",
      description:
        "خيارات مرتبطة بالروتين اليومي والتنظيم الرياضي.",
      ctaLabel: "المتجر",
    },
  };

function normalizeSiteUrl(value?: string | null) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    return new URL(withProtocol).toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function getSiteUrl() {
  return (
    normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeSiteUrl(process.env.SITE_URL) ??
    normalizeSiteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalizeSiteUrl(process.env.VERCEL_URL) ??
    DEFAULT_SITE_URL
  );
}

export function isPreviewDeployment() {
  return process.env.VERCEL_ENV === "preview";
}

export const SITE_URL = getSiteUrl();
export const SITE_HOST = new URL(SITE_URL).host;

export function getCategoryDefinitionByName(name: string) {
  return categoryByName.get(name) ?? CATEGORY_DEFINITIONS[0];
}

export function getCategoryDefinitionBySlug(slug: string) {
  return categoryBySlug.get(slug) ?? null;
}

export function getCategoryNameFromSlug(slug?: string | null) {
  if (!slug) return null;
  return getCategoryDefinitionBySlug(slug)?.name ?? null;
}

export function getCategorySlugFromName(name: string) {
  return getCategoryDefinitionByName(name).slug;
}

export function getStoreHighlight(categoryName?: string | null): StoreHighlight {
  if (!categoryName) {
    return DEFAULT_STORE_HIGHLIGHT;
  }

  const override = STORE_HIGHLIGHTS_BY_CATEGORY[categoryName];

  if (!override) {
    return {
      ...DEFAULT_STORE_HIGHLIGHT,
      eyebrow: `مرتبط بـ ${categoryName}`,
    };
  }

  return {
    eyebrow: `مرتبط بـ ${categoryName}`,
    ...override,
  };
}
