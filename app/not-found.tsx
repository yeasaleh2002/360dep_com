"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { T } from "@/lib/i18n";

/** Unknown routes never dead-end: send the visitor straight back to the home page. */
export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <main className="flex min-h-svh items-center justify-center bg-bg px-6 text-center">
      <p className="text-muted" role="status">
        <T k="notFound.redirecting" />
      </p>
    </main>
  );
}
