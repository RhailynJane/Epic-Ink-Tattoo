import { cookies } from "next/headers";
import { SESSION_COOKIE, verifyAdminToken } from "@/lib/auth";

export async function requireAdmin() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const session = await verifyAdminToken(token);
  if (!session) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return session;
}

export function getAdminApiKey(): string {
  const key = process.env.ADMIN_API_KEY;
  if (!key) {
    throw new Error(
      "ADMIN_API_KEY is not set. Add it to .env.local and run `npx convex env set ADMIN_API_KEY <same value>`."
    );
  }
  return key;
}
