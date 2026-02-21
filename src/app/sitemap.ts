import type { MetadataRoute } from "next";
import { supabase } from "@/server/db";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://vibehunt.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/games`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/marketplace`, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/bounties`, changeFrequency: "daily", priority: 0.6 },
    { url: `${BASE_URL}/leaderboard`, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/search`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/terms`, changeFrequency: "monthly", priority: 0.2 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "monthly", priority: 0.2 },
  ];

  const { data: games } = await supabase
    .from("games")
    .select("slug, updated_at")
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(5000);

  const gamePages: MetadataRoute.Sitemap = (games ?? []).map((g) => ({
    url: `${BASE_URL}/games/${g.slug}`,
    lastModified: g.updated_at ? new Date(g.updated_at) : undefined,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const { data: users } = await supabase
    .from("users")
    .select("username, updated_at")
    .limit(5000);

  const profilePages: MetadataRoute.Sitemap = (users ?? []).map((u) => ({
    url: `${BASE_URL}/profile/${u.username}`,
    lastModified: u.updated_at ? new Date(u.updated_at) : undefined,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...gamePages, ...profilePages];
}
