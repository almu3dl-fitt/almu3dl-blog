import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";

import {
  CONTACT_FORM_TO_EMAIL,
  enforceRateLimit,
  escapeEmailHtml,
  getClientIp,
  getSubmissionFingerprint,
  isAllowedOrigin,
  isDuplicateSubmission,
  normalizeContactSubmission,
  rememberSubmission,
  validateContactSubmission,
} from "@/lib/contact";

export const runtime = "nodejs";

function jsonResponse(body: Record<string, string>, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function buildEmailHtml(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
  ipAddress: string;
}) {
  const escapedMessage = escapeEmailHtml(params.message).replace(/\n/g, "<br>");

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.8; color: #171717;">
      <h2 style="margin: 0 0 16px;">رسالة جديدة من نموذج التواصل</h2>
      <p><strong>الاسم:</strong> ${escapeEmailHtml(params.name)}</p>
      <p><strong>البريد:</strong> ${escapeEmailHtml(params.email)}</p>
      <p><strong>العنوان:</strong> ${escapeEmailHtml(params.subject)}</p>
      <p><strong>IP:</strong> ${escapeEmailHtml(params.ipAddress)}</p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e5e5;">
      <p style="white-space: normal;">${escapedMessage}</p>
    </div>
  `;
}

function buildEmailText(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
  ipAddress: string;
}) {
  return [
    "رسالة جديدة من نموذج التواصل",
    "",
    `الاسم: ${params.name}`,
    `البريد: ${params.email}`,
    `العنوان: ${params.subject}`,
    `IP: ${params.ipAddress}`,
    "",
    params.message,
  ].join("\n");
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return jsonResponse({ error: "الطلب غير مسموح." }, 403);
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return jsonResponse({ error: "صيغة الطلب غير مدعومة." }, 415);
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.CONTACT_FORM_FROM_EMAIL;

  if (!resendApiKey || !fromEmail) {
    return jsonResponse(
      { error: "خدمة التواصل غير مهيأة بعد." },
      503,
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "تعذر قراءة البيانات المرسلة." }, 400);
  }

  const submission = normalizeContactSubmission(payload);
  const validationError = validateContactSubmission(submission);

  if (validationError) {
    return jsonResponse({ error: validationError }, 400);
  }

  const ipAddress = getClientIp(request);
  const rateLimitError = enforceRateLimit(ipAddress);

  if (rateLimitError) {
    return jsonResponse({ error: rateLimitError }, 429);
  }

  const submissionFingerprint = getSubmissionFingerprint(ipAddress, submission);

  if (isDuplicateSubmission(submissionFingerprint)) {
    return jsonResponse(
      { error: "تم استلام رسالة مشابهة مؤخرًا. يرجى الانتظار قليلًا قبل الإرسال مرة أخرى." },
      429,
    );
  }

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": randomUUID(),
      "User-Agent": "almu3dl-blog-contact-form/1.0",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [process.env.CONTACT_FORM_TO_EMAIL ?? CONTACT_FORM_TO_EMAIL],
      subject: `نموذج التواصل: ${submission.subject}`,
      html: buildEmailHtml({
        name: submission.name,
        email: submission.email,
        subject: submission.subject,
        message: submission.message,
        ipAddress,
      }),
      text: buildEmailText({
        name: submission.name,
        email: submission.email,
        subject: submission.subject,
        message: submission.message,
        ipAddress,
      }),
      reply_to: submission.email,
      tags: [
        { name: "source", value: "contact-form" },
        { name: "site", value: "almu3dl-blog" },
      ],
    }),
  });

  if (!resendResponse.ok) {
    const errorText = await resendResponse.text();
    console.error("Contact email send failed:", errorText);

    return jsonResponse(
      { error: "تعذر إرسال الرسالة حاليًا. حاول لاحقًا." },
      502,
    );
  }

  rememberSubmission(submissionFingerprint);

  return jsonResponse({ success: "تم إرسال رسالتك بنجاح." });
}
