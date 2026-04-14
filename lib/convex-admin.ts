import { ConvexHttpClient } from "convex/browser";

let client: ConvexHttpClient | null = null;

export function getConvexAdminClient(): ConvexHttpClient {
  if (!client) {
    const url =
      process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_CLOUD_URL;
    if (!url) {
      throw new Error(
        "NEXT_PUBLIC_CONVEX_URL (or CONVEX_CLOUD_URL) is not set."
      );
    }
    client = new ConvexHttpClient(url);
  }
  return client;
}
