function stripEdgeSlashes(value: string) {
  return value.trim().replace(/^\/+|\/+$/g, "");
}

export function decodeSlugValue(value: string) {
  let current = stripEdgeSlashes(value);

  for (let index = 0; index < 4; index += 1) {
    try {
      const decoded = decodeURIComponent(current);
      if (decoded === current) break;
      current = decoded;
    } catch {
      break;
    }
  }

  return current;
}

export function normalizeSlug(value: string) {
  return decodeSlugValue(value)
    .normalize("NFKD")
    .toLowerCase()
    .replace(/\/+$/g, "")
    .replace(/[\u0640\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\u0600-\u06FFa-z0-9\s_-]/g, " ")
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildSlugVariants(input: string) {
  const raw = stripEdgeSlashes(input);
  const decoded = decodeSlugValue(raw);
  const encoded = encodeURIComponent(decoded);

  return Array.from(
    new Set([
      raw,
      raw.toLowerCase(),
      decoded,
      decoded.toLowerCase(),
      encoded,
      encoded.toLowerCase(),
    ]),
  ).filter(Boolean);
}
