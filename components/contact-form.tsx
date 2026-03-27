"use client";

import { useState } from "react";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
  startedAt: string;
};

const initialState = () => ({
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "",
  startedAt: `${Date.now()}`,
});

export function ContactForm() {
  const [formState, setFormState] = useState<FormState>(initialState);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"idle" | "success" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);
    setStatusType("idle");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });

      const data = (await response.json()) as {
        success?: string;
        error?: string;
      };

      if (!response.ok) {
        setStatusType("error");
        setStatusMessage(data.error ?? "تعذر إرسال الرسالة.");
        return;
      }

      setStatusType("success");
      setStatusMessage(data.success ?? "تم إرسال الرسالة.");
      setFormState(initialState());
    } catch {
      setStatusType("error");
      setStatusMessage("تعذر إرسال الرسالة حاليًا. حاول مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setFormState((current) => ({
      ...current,
      [key]: value,
    }));
  }

  return (
    <form onSubmit={handleSubmit} className="panel-surface rounded-[32px] p-6 md:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 text-sm text-[#D7D1C6]">
          <span className="font-semibold text-white">الاسم</span>
          <input
            value={formState.name}
            onChange={(event) => updateField("name", event.target.value)}
            required
            minLength={2}
            maxLength={80}
            className="w-full rounded-[20px] border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition placeholder:text-[#7D766D] focus:border-[#D4AF37]/40"
            placeholder="الاسم الكامل"
          />
        </label>

        <label className="space-y-2 text-sm text-[#D7D1C6]">
          <span className="font-semibold text-white">البريد الإلكتروني</span>
          <input
            type="email"
            value={formState.email}
            onChange={(event) => updateField("email", event.target.value)}
            required
            maxLength={160}
            className="w-full rounded-[20px] border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition placeholder:text-[#7D766D] focus:border-[#D4AF37]/40"
            placeholder="name@example.com"
            dir="ltr"
          />
        </label>
      </div>

      <div className="mt-5">
        <label className="space-y-2 text-sm text-[#D7D1C6]">
          <span className="font-semibold text-white">عنوان الرسالة</span>
          <input
            value={formState.subject}
            onChange={(event) => updateField("subject", event.target.value)}
            required
            minLength={3}
            maxLength={140}
            className="w-full rounded-[20px] border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition placeholder:text-[#7D766D] focus:border-[#D4AF37]/40"
            placeholder="عنوان مختصر وواضح"
          />
        </label>
      </div>

      <div className="mt-5">
        <label className="space-y-2 text-sm text-[#D7D1C6]">
          <span className="font-semibold text-white">الرسالة</span>
          <textarea
            value={formState.message}
            onChange={(event) => updateField("message", event.target.value)}
            required
            minLength={20}
            maxLength={4000}
            rows={7}
            className="w-full rounded-[22px] border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition placeholder:text-[#7D766D] focus:border-[#D4AF37]/40"
            placeholder="اكتب تفاصيل رسالتك هنا"
          />
        </label>
      </div>

      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            value={formState.website}
            onChange={(event) => updateField("website", event.target.value)}
          />
        </label>
        <input
          value={formState.startedAt}
          onChange={(event) => updateField("startedAt", event.target.value)}
          readOnly
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm leading-7 text-[#9D988F]">
          يُستخدم النموذج للرسائل المباشرة فقط. الحقول المخفية ومحددات الإرسال مفعلة
          للحد من الرسائل الآلية.
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-bold text-black transition hover:translate-y-[-1px] hover:bg-[#E5C25B] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "جارٍ الإرسال..." : "إرسال الرسالة"}
        </button>
      </div>

      {statusMessage ? (
        <div
          aria-live="polite"
          className={`mt-5 rounded-[20px] border px-4 py-3 text-sm leading-7 ${
            statusType === "success"
              ? "border-[#3DDC84]/30 bg-[#3DDC84]/10 text-[#D7F7E5]"
              : "border-[#D4AF37]/25 bg-[#D4AF37]/10 text-[#F3E5B0]"
          }`}
        >
          {statusMessage}
        </div>
      ) : null}
    </form>
  );
}
