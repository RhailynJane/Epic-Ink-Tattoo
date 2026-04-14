import { NextResponse } from "next/server";
import { requireAdmin, getAdminApiKey } from "@/lib/server-auth";
import { getConvexAdminClient } from "@/lib/convex-admin";
import { api } from "@/convex/_generated/api";

export async function GET() {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof Response) return err;
    throw err;
  }

  const convex = getConvexAdminClient();
  const rows = await convex.query(api.appointments.list, {
    adminKey: getAdminApiKey(),
  });
  return NextResponse.json({ appointments: rows });
}
