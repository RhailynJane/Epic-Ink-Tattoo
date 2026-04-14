import { NextResponse } from "next/server";
import { requireAdmin, getAdminApiKey } from "@/lib/server-auth";
import { getConvexAdminClient } from "@/lib/convex-admin";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof Response) return err;
    throw err;
  }

  const { id } = await params;
  const convex = getConvexAdminClient();
  await convex.mutation(api.instagramEmbeds.remove, {
    adminKey: getAdminApiKey(),
    id: id as Id<"instagramEmbeds">,
  });
  return NextResponse.json({ ok: true });
}
