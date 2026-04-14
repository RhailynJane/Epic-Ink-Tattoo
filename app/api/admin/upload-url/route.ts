import { NextResponse } from "next/server";
import { requireAdmin, getAdminApiKey } from "@/lib/server-auth";
import { getConvexAdminClient } from "@/lib/convex-admin";
import { api } from "@/convex/_generated/api";

export async function POST() {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof Response) return err;
    throw err;
  }

  const convex = getConvexAdminClient();
  const url = await convex.mutation(api.gallery.generateUploadUrl, {
    adminKey: getAdminApiKey(),
  });

  return NextResponse.json({ url });
}
