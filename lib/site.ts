export const SITE_NAME = "المعضّل - Almu3dl";
export const SITE_TAGLINE = "منصة عربية للّياقة والتغذية والأداء الرياضي";
export const SITE_DESCRIPTION =
  "مدونة عربية احترافية عن اللياقة والتغذية الرياضية وخسارة الدهون وبناء العضلات والمكملات الغذائية والصحة العامة.";
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
  { href: "/about", label: "عن المشروع" },
  { href: "/contact", label: "التواصل" },
  { href: "/privacy", label: "سياسة الخصوصية" },
] as const;

export type SocialLink = {
  label: string;
  shortLabel: string;
  href: string;
};

export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: "Instagram",
    shortLabel: "IG",
    href: "https://www.instagram.com/bin_zain/",
  },
  {
    label: "TikTok",
    shortLabel: "TT",
    href: "https://www.tiktok.com/@almu3dl",
  },
  {
    label: "Snapchat",
    shortLabel: "SC",
    href: "https://www.snapchat.com/add/almu3dl",
  },
  {
    label: "YouTube",
    shortLabel: "YT",
    href: "https://www.youtube.com/@almu3dl",
  },
  {
    label: "Telegram",
    shortLabel: "TG",
    href: "https://t.me/almu3dl",
  },
  {
    label: "X",
    shortLabel: "X",
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
    imagePath: "/articles/categories/sports-nutrition.svg",
    accent: "from-[#D4AF37]/35 via-[#1A1A1A] to-[#101418]",
  },
  {
    name: "خسارة الدهون",
    slug: "fat-loss",
    description: "مفاهيم التنشيف، التحكم بالسعرات، ورفع كفاءة الحرق بدون فوضى.",
    imagePath: "/articles/categories/fat-loss.svg",
    accent: "from-[#0F7B6C]/25 via-[#171717] to-[#101010]",
  },
  {
    name: "بناء العضلات والأداء",
    slug: "strength-performance",
    description: "التدريب، التطور العضلي، وتحسين القوة والتحمل الرياضي.",
    imagePath: "/articles/categories/strength-performance.svg",
    accent: "from-[#D4AF37]/30 via-[#151515] to-[#0C0E11]",
  },
  {
    name: "المستلزمات الرياضية",
    slug: "sports-gear",
    description: "اختيار الأدوات والمستلزمات التي ترفع الجودة والالتزام داخل النادي.",
    imagePath: "/articles/categories/sports-gear.svg",
    accent: "from-[#8D6B2D]/30 via-[#161616] to-[#0F1114]",
  },
  {
    name: "المكملات الغذائية",
    slug: "supplements",
    description: "مراجعات وتفسيرات عملية للمكملات الشائعة واستخدامها الصحيح.",
    imagePath: "/articles/categories/supplements.svg",
    accent: "from-[#D4AF37]/25 via-[#181818] to-[#121212]",
  },
  {
    name: "الصحة العامة",
    slug: "general-health",
    description: "المؤشرات الصحية، الاستشفاء، النوم، والعادات الداعمة للاستمرارية.",
    imagePath: "/articles/categories/general-health.svg",
    accent: "from-[#0F7B6C]/22 via-[#171717] to-[#0E1112]",
  },
  {
    name: "الوصفات الصحية",
    slug: "healthy-recipes",
    description: "وصفات عملية تحافظ على الطعم وتخدم الهدف الغذائي اليومي.",
    imagePath: "/articles/categories/healthy-recipes.svg",
    accent: "from-[#D4AF37]/25 via-[#171717] to-[#121315]",
  },
  {
    name: "أسلوب الحياة الرياضي",
    slug: "athletic-lifestyle",
    description: "تنظيم الروتين، الاستمرارية، والقرارات الصغيرة التي تصنع الفارق.",
    imagePath: "/articles/categories/athletic-lifestyle.svg",
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
  eyebrow: "من المتجر",
  title: "مختارات تخدم الهدف",
  description:
    "منتجات وخيارات منتقاة تدعم التدريب، التغذية، والاستمرارية اليومية.",
  ctaLabel: "زيارة المتجر",
};

const STORE_HIGHLIGHTS_BY_CATEGORY: Record<string, Omit<StoreHighlight, "eyebrow">> =
  {
    "التغذية الرياضية": {
      title: "خيارات داعمة للخطة الغذائية",
      description:
        "اختيارات مرتبطة بالتوقيت الغذائي، تنظيم الوجبات، والالتزام اليومي.",
      ctaLabel: "عرض المتجر",
    },
    "خسارة الدهون": {
      title: "ما يدعم مرحلة التنشيف",
      description:
        "منتجات وخيارات تساعد على التنظيم والاستمرارية خلال مرحلة خفض الدهون.",
      ctaLabel: "استكشف المتجر",
    },
    "بناء العضلات والأداء": {
      title: "أدوات تدعم الأداء",
      description:
        "اختيارات مرتبطة بالقوة، التطور العضلي، وتحسين جودة التدريب.",
      ctaLabel: "زيارة المتجر",
    },
    "المستلزمات الرياضية": {
      title: "مستلزمات مرتبطة بالمقال",
      description:
        "مستلزمات وأدوات يمكن الرجوع لها عند المقارنة أو تجهيز الروتين الرياضي.",
      ctaLabel: "تصفح المتجر",
    },
    "المكملات الغذائية": {
      title: "مكملات مرتبطة بالموضوع",
      description:
        "وصول مباشر للخيارات المرتبطة بالمكملات التي يناقشها المقال.",
      ctaLabel: "عرض المكملات",
    },
    "الصحة العامة": {
      title: "اختيارات للعادات اليومية",
      description:
        "منتجات وعناصر مرتبطة بالروتين الصحي والاستشفاء اليومي.",
      ctaLabel: "زيارة المتجر",
    },
    "الوصفات الصحية": {
      title: "ما يكمل الوصفات والنظام",
      description:
        "اختيارات مناسبة لمن يبني نظامه الغذائي حول وصفات عملية ومستمرة.",
      ctaLabel: "استكشف المتجر",
    },
    "أسلوب الحياة الرياضي": {
      title: "دعم لنمط الحياة الرياضي",
      description:
        "خيارات مرتبطة بالروتين الرياضي اليومي وما يساعد على الاستمرارية.",
      ctaLabel: "زيارة المتجر",
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
