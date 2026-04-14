import { NextResponse } from "next/server";
import { issueAdminToken, SESSION_COOKIE, SESSION_TTL, timingSafeEqual } from "@/lib/auth";

const MIN_DELAY_MS = 400;

export async function POST(req: Request) {
  const start = Date.now();
  const body = await req.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { error: "Server not configured: ADMIN_PASSWORD missing." },
      { status: 500 }
    );
  }

  const ok = password.length > 0 && timingSafeEqual(password, expected);

  const elapsed = Date.now() - start;
  if (elapsed < MIN_DELAY_MS) {
    await new Promise((r) => setTimeout(r, MIN_DELAY_MS - elapsed));
  }

  if (!ok) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  const token = await issueAdminToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
  return res;
}
