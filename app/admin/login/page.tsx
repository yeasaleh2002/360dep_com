import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";
import { LogoMark } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/toggles";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; email?: string }> }) {
  const { next, email } = await searchParams;

  return (
    <main className="relative flex min-h-svh items-center justify-center bg-bg px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <LogoMark className="mx-auto h-12 w-12 text-ink" />
          <h1 className="mt-5 font-sans text-2xl font-semibold">360DEP Admin</h1>
          <p className="mt-2 text-sm text-muted">Sign in to manage your website.</p>
        </div>
        <div className="card p-6 sm:p-8">
          <LoginForm next={next} email={typeof email === "string" ? email.slice(0, 200) : undefined} />
        </div>
      </div>
    </main>
  );
}
