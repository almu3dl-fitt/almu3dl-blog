import { createSlug } from "@/lib/slug";

type RawSection = {
  heading?: unknown;
  anchor?: unknown;
  content?: unknown;
  sortOrder?: unknown;
};

export type NormalizedArticleSection = {
  heading: string;
  anchor: string;
  content: string;
  sortOrder: number;
};

export function normalizeArticleText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeOptionalArticleText(value: unknown) {
  const trimmed = normalizeArticleText(value);
  return trimmed.length > 0 ? trimmed : null;
}

export function parseArticleCategoryId(value: unknown) {
  const numericValue =
    typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);

  return Number.isInteger(numericValue) && numericValue > 0 ? numericValue : null;
}

function createUniqueAnchor(
  preferredAnchor: string,
  usedAnchors: Set<string>,
  index: number,
) {
  const baseAnchor = createSlug(preferredAnchor.trim()) || `section-${index + 1}`;
  let candidate = baseAnchor;
  let suffix = 2;

  while (usedAnchors.has(candidate)) {
    candidate = `${baseAnchor}-${suffix}`;
    suffix += 1;
  }

  usedAnchors.add(candidate);
  return candidate;
}

export function normalizeArticleSections(input: unknown): NormalizedArticleSection[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const usedAnchors = new Set<string>();

  return input.flatMap((rawSection, index) => {
    if (typeof rawSection !== "object" || rawSection === null) {
      return [];
    }

    const section = rawSection as RawSection;
    const rawHeading = normalizeArticleText(section.heading);
    const heading = rawHeading || `القسم ${index + 1}`;
    const content = typeof section.content === "string" ? section.content.trim() : "";

    if (!rawHeading && !content) {
      return [];
    }

    return [
      {
        heading,
        anchor: createUniqueAnchor(
          normalizeArticleText(section.anchor) || heading,
          usedAnchors,
          index,
        ),
        content,
        sortOrder:
          typeof section.sortOrder === "number" && Number.isFinite(section.sortOrder)
            ? section.sortOrder
            : index + 1,
      },
    ];
  });
}
