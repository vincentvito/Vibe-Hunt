"use server";

import { supabase } from "@/server/db";
import { nanoid } from "nanoid";
import { completeProfileSchema } from "@/lib/validators";
import { sanitizeText } from "@/lib/sanitize";

export async function createUserProfile(input: {
  authId: string;
  email: string;
  username: string;
  displayName: string;
}): Promise<{ error: string | null; alreadyExists?: boolean }> {
  // Validate username and displayName server-side
  const parsed = completeProfileSchema.safeParse({
    username: input.username,
    displayName: input.displayName,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Check if profile already exists for this auth_id
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", input.authId)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return { error: null, alreadyExists: true };
  }

  const { error } = await supabase.from("users").insert({
    id: nanoid(),
    auth_id: input.authId,
    email: input.email,
    username: parsed.data.username,
    display_name: sanitizeText(parsed.data.displayName),
  });

  if (error) {
    if (error.code === "23505") {
      if (error.message.includes("auth_id")) {
        // Duplicate auth_id — profile was created between our check and insert
        return { error: null, alreadyExists: true };
      }
      return { error: "An account with this information already exists." };
    }
    return { error: error.message };
  }

  return { error: null };
}

export async function checkUserProfileExists(
  authId: string
): Promise<{ exists: boolean; error?: string }> {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", authId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("checkUserProfileExists query error:", error.message);
    return { exists: false, error: error.message };
  }

  return { exists: !!data };
}
