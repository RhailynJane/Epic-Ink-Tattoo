#!/usr/bin/env node
/**
 * Seed Convex gallery from /public/images/gallery/*
 * Run with: node scripts/seed-gallery.mjs
 *
 * Requires NEXT_PUBLIC_CONVEX_URL and ADMIN_API_KEY in .env.local.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

async function loadEnv() {
  const envPath = path.join(root, ".env.local");
  const text = await fs.readFile(envPath, "utf8");
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    const hashIdx = value.indexOf(" #");
    if (hashIdx !== -1) value = value.slice(0, hashIdx).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

const titles = {
  "tattoo-1.jpg": "Maple Leaf Portrait",
  "tattoo-2.jpg": "Tiger Cub",
  "tattoo-3.jpg": "Butterfly Art",
  "tattoo-4.jpg": "Dog Portrait",
  "tattoo-5.jpg": "Feather Design",
  "tattoo-6.jpg": "Lion Realism",
};

const categories = {
  "tattoo-1.jpg": "Color",
  "tattoo-2.jpg": "Black & Grey",
  "tattoo-3.jpg": "Black & Grey",
  "tattoo-4.jpg": "Color",
  "tattoo-5.jpg": "Fine Line",
  "tattoo-6.jpg": "Realism",
};

async function main() {
  await loadEnv();

  const url = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_CLOUD_URL;
  const adminKey = process.env.ADMIN_API_KEY;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL not set.");
  if (!adminKey) throw new Error("ADMIN_API_KEY not set in .env.local.");

  const client = new ConvexHttpClient(url);
  const dir = path.join(root, "public", "images", "gallery");

  let files;
  try {
    files = (await fs.readdir(dir)).filter((f) =>
      /\.(jpe?g|png|webp|gif|mp4|webm|mov)$/i.test(f)
    );
  } catch (err) {
    console.error(`Could not read ${dir}:`, err.message);
    process.exit(1);
  }

  if (files.length === 0) {
    console.log("No files found to seed.");
    return;
  }

  const existing = await client.query(api.gallery.list, {});
  const existingTitles = new Set(existing.map((i) => i.title));

  for (const name of files.sort()) {
    const title = titles[name] ?? path.basename(name, path.extname(name));
    if (existingTitles.has(title)) {
      console.log(`• skip "${title}" (already in DB)`);
      continue;
    }

    const filePath = path.join(dir, name);
    const buf = await fs.readFile(filePath);
    const ext = path.extname(name).toLowerCase();
    const mime =
      ext === ".png" ? "image/png"
      : ext === ".webp" ? "image/webp"
      : ext === ".gif" ? "image/gif"
      : ext === ".mp4" ? "video/mp4"
      : ext === ".webm" ? "video/webm"
      : ext === ".mov" ? "video/quicktime"
      : "image/jpeg";
    const mediaType = mime.startsWith("video/") ? "video" : "image";

    const uploadUrl = await client.mutation(api.gallery.generateUploadUrl, { adminKey });
    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": mime },
      body: buf,
    });
    if (!res.ok) {
      console.error(`✗ upload failed for ${name}:`, res.status, await res.text());
      continue;
    }
    const { storageId } = await res.json();

    await client.mutation(api.gallery.add, {
      adminKey,
      title,
      artist: "Eman",
      category: categories[name] ?? "Custom",
      storageId,
      mediaType,
    });

    console.log(`✓ added "${title}" (${name})`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
