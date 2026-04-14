import { NextResponse } from "next/server";
import { requireAdmin, getAdminApiKey } from "@/lib/server-auth";
import { getConvexAdminClient } from "@/lib/convex-admin";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type Params = { params: Promise<{ id: string }> };

const VALID_STATUSES = ["pending", "approved", "rejected"] as const;
type ValidStatus = (typeof VALID_STATUSES)[number];

export async function PATCH(req: Request, { params }: Params) {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof Response) return err;
    throw err;
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const status = body?.status;
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const convex = getConvexAdminClient();
  await convex.mutation(api.reviews.updateStatus, {
    adminKey: getAdminApiKey(),
    id: id as Id<"reviews">,
    status: status as ValidStatus,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof Response) return err;
    throw err;
  }

  const { id } = await params;
  const convex = getConvexAdminClient();
  await convex.mutation(api.reviews.remove, {
    adminKey: getAdminApiKey(),
    id: id as Id<"reviews">,
  });

  return NextResponse.json({ ok: true });
}
