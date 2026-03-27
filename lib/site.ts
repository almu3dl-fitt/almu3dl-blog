export const SITE_NAME = "المعضّل - Almu3dl";
export const SITE_TAGLINE = "منصة عربية للّياقة والتغذية والأداء الرياضي";
export const SITE_DESCRIPTION =
  "مدونة عربية احترافية عن اللياقة والتغذية الرياضية وخسارة الدهون وبناء العضلات والمكملات الغذائية والصحة العامة.";

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
