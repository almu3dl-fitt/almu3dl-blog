import "server-only";

import { createHash } from "node:crypto";

export const CONTACT_FORM_TO_EMAIL = "almu3dl@gmail.com";
export const CONTACT_RATE_LIMIT_WINDOW_MS = 30 * 60 * 1000;
export const CONTACT_RATE_LIMIT_MAX = 3;
export const CONTACT_DUPLICATE_WINDOW_MS = 10 * 60 * 1000;
export const CONTACT_MIN_FILL_MS = 3_000;

type ContactSubmission = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
  startedAt: string;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type DuplicateEntry = {
  submittedAt: number;
};

const globalForContact = globalThis as typeof globalThis & {
  contactRateLimitStore?: Map<string, RateLimitEntry>;
  contactDuplicateStore?: Map<string, DuplicateEntry>;
};

const rateLimitStore =
  globalForContact.contactRateLimitStore ?? new Map<string, RateLimitEntry>();
const duplicateStore =
  globalForContact.contactDuplicateStore ?? new Map<string, DuplicateEntry>();

if (process.env.NODE_ENV !== "production") {
  globalForContact.contactRateLimitStore = rateLimitStore;
  globalForContact.contactDuplicateStore = duplicateStore;
}

function trimValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeContactSubmission(input: unknown): ContactSubmission {
  const data =
    typeof input === "object" && input !== null
      ? (input as Record<string, unknown>)
      : {};

  return {
    name: trimValue(data.name),
    email: trimValue(data.email).toLowerCase(),
    subject: trimValue(data.subject),
    message: trimValue(data.message),
    website: trimValue(data.website),
    startedAt: trimValue(data.startedAt),
  };
}

export function validateContactSubmission(submission: ContactSubmission) {
  if (submission.website) {
    return "تعذر إرسال الرسالة.";
  }

  const startedAt = Number(submission.startedAt);
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < CONTACT_MIN_FILL_MS) {
    return "يرجى إعادة المحاولة بعد تعبئة النموذج بشكل كامل.";
  }

  if (submission.name.length < 2 || submission.name.length > 80) {
    return "يرجى كتابة اسم واضح.";
  }

  if (
    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(submission.email) ||
    submission.email.length > 160
  ) {
    return "يرجى إدخال بريد إلكتروني صحيح.";
  }

  if (submission.subject.length < 3 || submission.subject.length > 140) {
    return "يرجى كتابة عنوان مناسب للرسالة.";
  }

  if (submission.message.length < 20 || submission.message.length > 4_000) {
    return "يرجى كتابة رسالة أوضح.";
  }

  const urlMatches = submission.message.match(/https?:\/\//gi);
  if ((urlMatches?.length ?? 0) > 3) {
    return "الرسالة تحتوي على عدد كبير من الروابط.";
  }

  return null;
}

function cleanupStores(now: number) {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }

  for (const [key, entry] of duplicateStore.entries()) {
    if (entry.submittedAt + CONTACT_DUPLICATE_WINDOW_MS <= now) {
      duplicateStore.delete(key);
    }
  }
}

export function enforceRateLimit(ipAddress: string) {
  const now = Date.now();
  cleanupStores(now);

  const current = rateLimitStore.get(ipAddress);
  if (!current || current.resetAt <= now) {
    rateLimitStore.set(ipAddress, {
      count: 1,
      resetAt: now + CONTACT_RATE_LIMIT_WINDOW_MS,
    });

    return null;
  }

  if (current.count >= CONTACT_RATE_LIMIT_MAX) {
    return "تم الوصول إلى الحد المسموح من الرسائل مؤقتًا. حاول لاحقًا.";
  }

  current.count += 1;
  rateLimitStore.set(ipAddress, current);
  return null;
}

export function getSubmissionFingerprint(ipAddress: string, submission: ContactSubmission) {
  return createHash("sha256")
    .update(
      [
        ipAddress,
        submission.email,
        submission.subject.toLowerCase(),
        submission.message.toLowerCase(),
      ].join("|"),
    )
    .digest("hex");
}

export function isDuplicateSubmission(fingerprint: string) {
  const now = Date.now();
  cleanupStores(now);

  const existing = duplicateStore.get(fingerprint);
  return Boolean(existing && existing.submittedAt + CONTACT_DUPLICATE_WINDOW_MS > now);
}

export function rememberSubmission(fingerprint: string) {
  const now = Date.now();
  cleanupStores(now);

  duplicateStore.set(fingerprint, { submittedAt: now });
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() ?? "unknown";
}

export function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return process.env.NODE_ENV !== "production";
  }

  const requestUrl = new URL(request.url);
  const allowedOrigins = new Set([
    requestUrl.origin,
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "",
  ]);

  return allowedOrigins.has(origin.replace(/\/$/, ""));
}

export function escapeEmailHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
