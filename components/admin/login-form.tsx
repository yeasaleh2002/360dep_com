"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { Turnstile, turnstileEnabled } from "@/components/ui/turnstile";
import { loginSchema } from "@/lib/validators";

type LoginValues = z.input<typeof loginSchema>;

/** Only allow redirects back into the admin area. */
function safeNext(next: string | undefined) {
  return next && /^\/admin(\/[\w-]*)*$/.test(next) && next !== "/admin/login" ? next : "/admin/dashboard";
}

export function LoginForm({ next }: { next?: string }) {
  const [token, setToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const onSubmit = async (values: LoginValues) => {
    setError(null);
    if (turnstileEnabled && !token) {
      setError("Running a quick security check — please try again in a moment.");
      return;
    }
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, turnstileToken: token ?? undefined }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Sign-in failed. Please try again.");
        setResetKey((k) => k + 1);
        return;
      }
      // Full navigation so the new session cookie is used by middleware.
      window.location.assign(safeNext(next));
    } catch {
      setError("Network problem — check your connection and try again.");
      setResetKey((k) => k + 1);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <label htmlFor="email" className="field-label">
          Email
        </label>
        <input id="email" type="email" autoComplete="username" className="field" aria-invalid={!!errors.email} {...register("email")} />
        {errors.email && <p className="field-error">{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="password" className="field-label">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="field pr-12"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted hover:text-ink"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="field-error">{errors.password.message}</p>}
      </div>

      <Turnstile onToken={setToken} resetKey={resetKey} language="en" />

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      <button type="submit" disabled={isSubmitting} className="admin-btn-primary w-full !min-h-[48px]">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
