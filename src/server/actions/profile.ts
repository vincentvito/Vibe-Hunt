"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/server/db";
import { updateProfileSchema } from "@/lib/validators";
import { requireAuth } from "@/lib/auth-utils";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import {
  actionSuccess,
  actionError,
  type ActionResult,
} from "@/lib/action-utils";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function updateProfile(
  input: Record<string, string>
): Promise<ActionResult<void>> {
  try {
    const user = await requireAuth();

    const rl = await rateLimit(`profile:${user.id}`, {
      maxRequests: 10,
      windowMs: 60_000,
    });
    if (!rl.success)
      return actionError("Too many requests. Please slow down.");

    const validated = updateProfileSchema.parse(input);

    const { error } = await supabase
      .from("users")
      .update({
        bio: validated.bio ? sanitizeText(validated.bio) : null,
        website_url: validated.websiteUrl || null,
        github_url: validated.githubUrl || null,
        twitter_url: validated.twitterUrl || null,
        instagram_url: validated.instagramUrl || null,
        discord_handle: validated.discordHandle
          ? sanitizeText(validated.discordHandle)
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("updateProfile error:", error.message);
      return actionError("Failed to update profile. Please try again.");
    }

    revalidatePath(`/profile/${user.username}`);
    revalidatePath("/dashboard/settings");
    return actionSuccess(undefined);
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return actionError("Failed to update profile. Please try again.");
  }
}
