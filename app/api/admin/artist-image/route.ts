import { NextResponse } from "next/server";
import { requireAdmin, getAdminApiKey } from "@/lib/server-auth";
import { getConvexAdminClient } from "@/lib/convex-admin";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof Response) return err;
    throw err;
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.storageId !== "string") {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const convex = getConvexAdminClient();
  await convex.mutation(api.artistImage.set, {
    adminKey: getAdminApiKey(),
    storageId: body.storageId as Id<"_storage">,
  });
  return NextResponse.json({ ok: true });
}
