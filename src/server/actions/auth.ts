"use server";

import { supabase } from "@/server/db";
import { nanoid } from "nanoid";

export async function createUserProfile(input: {
  authId: string;
  email: string;
  username: string;
  displayName: string;
}): Promise<{ error: string | null; alreadyExists?: boolean }> {
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
    username: input.username,
    display_name: input.displayName,
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
): Promise<boolean> {
  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", authId)
    .limit(1)
    .maybeSingle();

  return !!data;
}
