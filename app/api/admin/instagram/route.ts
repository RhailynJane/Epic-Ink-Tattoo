import { NextResponse } from "next/server";
import { requireAdmin, getAdminApiKey } from "@/lib/server-auth";
import { getConvexAdminClient } from "@/lib/convex-admin";
import { api } from "@/convex/_generated/api";

function extractInstagramUrl(input: string): string | null {
  const trimmed = input.trim();
  const permalinkMatch = trimmed.match(/data-instgrm-permalink="([^"]+)"/);
  const raw = permalinkMatch ? permalinkMatch[1] : trimmed;
  try {
    const u = new URL(raw);
    if (!/(^|\.)instagram\.com$/.test(u.hostname)) return null;
    if (!/^\/(p|reel|tv)\//.test(u.pathname)) return null;
    u.search = "";
    u.hash = "";
    return u.toString();
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof Response) return err;
    throw err;
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.embed !== "string") {
    return NextResponse.json({ error: "Missing embed." }, { status: 400 });
  }

  const url = extractInstagramUrl(body.embed);
  if (!url) {
    return NextResponse.json(
      { error: "Could not find a valid Instagram post/reel URL." },
      { status: 400 }
    );
  }

  const convex = getConvexAdminClient();
  const id = await convex.mutation(api.instagramEmbeds.add, {
    adminKey: getAdminApiKey(),
    url,
  });
  return NextResponse.json({ id, url });
}
