import { NextResponse } from "next/server";
import { requireAdmin, getAdminApiKey } from "@/lib/server-auth";
import { getConvexAdminClient } from "@/lib/convex-admin";
import { api } from "@/convex/_generated/api";

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof Response) return err;
    throw err;
  }

  const body = await req.json().catch(() => null);
  if (
    !body ||
    typeof body.section !== "string" ||
    typeof body.key !== "string" ||
    typeof body.value !== "string"
  ) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const convex = getConvexAdminClient();
  await convex.mutation(api.siteContent.set, {
    adminKey: getAdminApiKey(),
    section: body.section,
    key: body.key,
    value: body.value,
  });
  return NextResponse.json({ ok: true });
}
