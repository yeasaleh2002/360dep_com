import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySession, type AdminSession } from "@/lib/auth";

/** Server Component guard (defence in depth behind middleware). */
export async function requireAdminSession(): Promise<AdminSession> {
  const store = await cookies();
  const session = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!session) redirect("/admin/login");
  return session;
}
