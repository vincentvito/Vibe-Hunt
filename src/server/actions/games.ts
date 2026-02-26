"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabase } from "@/server/db";
import { createGameSchema } from "@/lib/validators";
import slugify from "slugify";
import { nanoid } from "nanoid";
import { requireAuth } from "@/lib/auth-utils";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import {
  actionSuccess,
  actionError,
  type ActionResult,
} from "@/lib/action-utils";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function createGame(
  formData: FormData
): Promise<ActionResult<never> | void> {
  const user = await requireAuth();

  const rl = await rateLimit(`submit:${user.id}`, {
    maxRequests: 5,
    windowMs: 300_000,
  });
  if (!rl.success)
    return actionError("Too many submissions. Please wait a few minutes.");

  const raw = {
    title: formData.get("title") as string,
    tagline: formData.get("tagline") as string,
    description: formData.get("description") as string,
    engine: formData.get("engine") as string,
    webBuildUrl: (formData.get("webBuildUrl") as string) || "",
    thumbnailUrl: (formData.get("thumbnailUrl") as string) || "",
    coverImageUrl: (formData.get("coverImageUrl") as string) || "",
    videoUrl: (formData.get("videoUrl") as string) || "",
    websiteUrl: (formData.get("websiteUrl") as string) || "",
    sourceCodeUrl: (formData.get("sourceCodeUrl") as string) || "",
    madeWithAi: formData.get("madeWithAi") === "true",
    aiToolsUsed: formData.getAll("aiToolsUsed") as string[],
    tags: formData.getAll("tags") as string[],
  };

  const validated = createGameSchema.parse(raw);

  const baseSlug = slugify(validated.title, { lower: true, strict: true });
  const slug = `${baseSlug}-${nanoid(6)}`;

  const gameId = nanoid();

  const { error } = await supabase
    .from("games")
    .insert({
      id: gameId,
      slug,
      title: validated.title,
      tagline: validated.tagline,
      description: sanitizeText(validated.description),
      engine: validated.engine,
      web_build_url: validated.webBuildUrl || null,
      thumbnail_url: validated.thumbnailUrl || null,
      cover_image_url: validated.coverImageUrl || null,
      video_url: validated.videoUrl || null,
      website_url: validated.websiteUrl || null,
      source_code_url: validated.sourceCodeUrl || null,
      made_with_ai: validated.madeWithAi,
      ai_tools_used: validated.aiToolsUsed,
      status: "published",
      published_at: new Date().toISOString(),
      creator_id: user.id,
    })
    .select("slug")
    .single();

  if (error) return actionError("Failed to create game. Please try again.");

  // Insert screenshots if provided
  const screenshotUrls = formData.getAll("screenshotUrls") as string[];
  if (screenshotUrls.length > 0) {
    const screenshotRows = screenshotUrls.map((url, index) => ({
      id: nanoid(),
      url,
      alt_text: `${validated.title} screenshot ${index + 1}`,
      sort_order: index,
      game_id: gameId,
    }));
    await supabase.from("screenshots").insert(screenshotRows);
  }

  // Find-or-create tags and associate with game
  if (validated.tags.length > 0) {
    const tagSlugs = validated.tags
      .map((t) => slugify(t, { lower: true, strict: true }))
      .filter(Boolean);

    if (tagSlugs.length > 0) {
      // Batch-fetch existing tags
      const { data: existingTags } = await supabase
        .from("tags")
        .select("id, slug")
        .in("slug", tagSlugs);

      const existingMap = new Map(
        (existingTags ?? []).map((t) => [t.slug, t.id])
      );

      // Create missing tags
      const newTags = validated.tags
        .map((name) => {
          const slug = slugify(name, { lower: true, strict: true });
          if (!slug || existingMap.has(slug)) return null;
          const id = nanoid();
          existingMap.set(slug, id);
          return {
            id,
            name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
            slug,
          };
        })
        .filter((t): t is NonNullable<typeof t> => t !== null);

      if (newTags.length > 0) {
        await supabase.from("tags").insert(newTags);
      }

      // Batch-insert game_tags
      const gameTagRows = tagSlugs
        .map((slug) => {
          const tagId = existingMap.get(slug);
          return tagId ? { game_id: gameId, tag_id: tagId } : null;
        })
        .filter((r): r is NonNullable<typeof r> => r !== null);

      if (gameTagRows.length > 0) {
        await supabase.from("game_tags").insert(gameTagRows);
      }
    }
  }

  revalidatePath("/");
  redirect(`/games/${slug}`);
}

export async function deleteGame(
  gameId: string
): Promise<ActionResult<void>> {
  try {
    const user = await requireAuth();

    const { data: game } = await supabase
      .from("games")
      .select("id, creator_id")
      .eq("id", gameId)
      .limit(1)
      .maybeSingle();

    if (!game) return actionError("Game not found.");
    if (game.creator_id !== user.id)
      return actionError("You can only delete your own games.");

    const { error } = await supabase.from("games").delete().eq("id", gameId);

    if (error) return actionError("Failed to delete game. Please try again.");

    revalidatePath("/");
    return actionSuccess(undefined);
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return actionError("Failed to delete game. Please try again.");
  }
}
