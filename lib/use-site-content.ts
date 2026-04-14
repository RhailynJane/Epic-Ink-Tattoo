"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getDefault } from "@/lib/site-defaults";

export function useSiteContent() {
  const remote = useQuery(api.siteContent.getAll);

  function get(section: string, key: string): string {
    const full = `${section}.${key}`;
    if (remote && full in remote) return remote[full];
    return getDefault(full);
  }

  return { get, loaded: remote !== undefined };
}
