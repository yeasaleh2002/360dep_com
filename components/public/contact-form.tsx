"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/icons";
import { Turnstile, turnstileEnabled } from "@/components/ui/turnstile";
import { useLocale } from "@/lib/i18n";
import { contactSchema, OTHER_SERVICE, type ContactInput } from "@/lib/validators";
import { whatsappLink } from "@/lib/whatsapp";

type ServiceOption = { id: string; title: string };

export function ContactForm({ services }: { services: ServiceOption[] }) {
  const { t, locale } = useLocale();
  const [token, setToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [sentLink, setSentLink] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", phone: "", email: "", service: "", customService: "", message: "", website: "" },
  });

  const selectedService = watch("service");
  const err = (key?: string) => (key ? t(key) : null);

  const buildWhatsAppMessage = (data: ContactInput, serviceLabel: string) => {
    const lines = [
      `*${t("contact.waHeader")}*`,
      "",
      `*${t("contact.waName")}:* ${data.name}`,
      `*${t("contact.waPhone")}:* ${data.phone}`,
    ];
    if (data.email) lines.push(`*${t("contact.waEmail")}:* ${data.email}`);
    lines.push(`*${t("contact.waService")}:* ${serviceLabel}`);
    if (data.message?.trim()) lines.push("", `*${t("contact.waMessage")}:*`, data.message.trim());
    return lines.join("\n");
  };

  const onSubmit = async (data: ContactInput) => {
    setServerError(null);
    if (turnstileEnabled && !token) {
      setServerError(t("contact.captchaPending"));
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, turnstileToken: token ?? undefined }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setServerError(t(json.error ?? "contact.error"));
        setResetKey((k) => k + 1); // tokens are single-use
        return;
      }

      const serviceLabel =
        data.service === OTHER_SERVICE
          ? (data.customService ?? "")
          : (services.find((s) => s.id === data.service)?.title ?? "");
      const link = whatsappLink(buildWhatsAppMessage(data, serviceLabel));
      setSentLink(link);
      reset();
      setResetKey((k) => k + 1);

      // Prefer a new tab; if the browser blocks it (common after an await), go there directly.
      const win = window.open(link, "_blank");
      if (win) win.opener = null;
      else window.location.assign(link);
    } catch {
      setServerError(t("contact.error"));
      setResetKey((k) => k + 1);
    }
  };

  if (sentLink) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card flex flex-col items-center p-10 text-center sm:p-14"
        role="status"
      >
        <CheckCircle2 className="h-14 w-14 text-gold" strokeWidth={1.5} />
        <h2 className="mt-6 text-3xl font-medium">{t("contact.successTitle")}</h2>
        <p className="mt-3 max-w-md text-muted">{t("contact.successBody")}</p>
        <a href={sentLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-8">
          <WhatsAppIcon className="h-5 w-5" />
          {t("contact.openWhatsapp")}
        </a>
        <button type="button" onClick={() => setSentLink(null)} className="mt-4 text-sm font-medium text-muted underline-offset-4 hover:text-ink hover:underline">
          {t("contact.sendAnother")}
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="card p-6 sm:p-10">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="field-label">
            {t("contact.name")} <span className="text-gold-strong">*</span>
          </label>
          <input id="name" autoComplete="name" className="field" placeholder={t("contact.namePlaceholder")} aria-invalid={!!errors.name} {...register("name")} />
          {errors.name && <p className="field-error">{err(errors.name.message)}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="field-label">
            {t("contact.phone")} <span className="text-gold-strong">*</span>
          </label>
          <input id="phone" type="tel" inputMode="tel" autoComplete="tel" className="field" placeholder={t("contact.phonePlaceholder")} aria-invalid={!!errors.phone} {...register("phone")} />
          {errors.phone && <p className="field-error">{err(errors.phone.message)}</p>}
        </div>

        <div>
          <label htmlFor="email" className="field-label">
            {t("contact.email")}
          </label>
          <input id="email" type="email" inputMode="email" autoComplete="email" className="field" placeholder={t("contact.emailPlaceholder")} aria-invalid={!!errors.email} {...register("email")} />
          {errors.email && <p className="field-error">{err(errors.email.message)}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="service" className="field-label">
            {t("contact.service")} <span className="text-gold-strong">*</span>
          </label>
          <select id="service" className="field appearance-none bg-[length:18px] bg-[right_1rem_center] bg-no-repeat pr-12" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a8844a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }} aria-invalid={!!errors.service} {...register("service")}>
            <option value="" disabled>
              {t("contact.servicePlaceholder")}
            </option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
            <option value={OTHER_SERVICE}>{t("contact.other")}</option>
          </select>
          {errors.service && <p className="field-error">{err(errors.service.message)}</p>}
        </div>

        <AnimatePresence initial={false}>
          {selectedService === OTHER_SERVICE && (
            <motion.div
              className="sm:col-span-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label htmlFor="customService" className="field-label">
                {t("contact.customService")} <span className="text-gold-strong">*</span>
              </label>
              <input id="customService" className="field" placeholder={t("contact.customServicePlaceholder")} aria-invalid={!!errors.customService} {...register("customService")} />
              {errors.customService && <p className="field-error">{err(errors.customService.message)}</p>}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="sm:col-span-2">
          <label htmlFor="message" className="field-label">
            {t("contact.message")}
          </label>
          <textarea id="message" rows={5} className="field resize-y" placeholder={t("contact.messagePlaceholder")} aria-invalid={!!errors.message} {...register("message")} />
          {errors.message && <p className="field-error">{err(errors.message.message)}</p>}
        </div>

        {/* Honeypot: invisible to people, tempting to bots. */}
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="website">Website</label>
          <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
        </div>
      </div>

      <div className="mt-6">
        <Turnstile onToken={setToken} resetKey={resetKey} language={locale} />
      </div>

      {serverError && (
        <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {serverError}
        </p>
      )}

      <button type="submit" disabled={isSubmitting} className="btn-whatsapp mt-8 w-full sm:w-auto sm:px-8">
        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <WhatsAppIcon className="h-5 w-5" />}
        {isSubmitting ? t("contact.submitting") : t("contact.submit")}
      </button>
    </form>
  );
}
