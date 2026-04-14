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
  if (
    !body ||
    typeof body.title !== "string" ||
    typeof body.artist !== "string" ||
    typeof body.storageId !== "string"
  ) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const mediaType =
    body.mediaType === "video" || body.mediaType === "image"
      ? body.mediaType
      : undefined;

  const convex = getConvexAdminClient();
  const id = await convex.mutation(api.gallery.add, {
    adminKey: getAdminApiKey(),
    title: body.title,
    artist: body.artist,
    category: typeof body.category === "string" ? body.category : undefined,
    storageId: body.storageId as Id<"_storage">,
    mediaType,
  });

  return NextResponse.json({ id });
}
