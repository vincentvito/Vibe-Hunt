"use server";

import { supabase } from "@/server/db";
import { nanoid } from "nanoid";

export async function createUserProfile(input: {
  authId: string;
  email: string;
  username: string;
  displayName: string;
}) {
  const { error } = await supabase.from("users").insert({
    id: nanoid(),
    auth_id: input.authId,
    email: input.email,
    username: input.username,
    display_name: input.displayName,
  });

  if (error) {
    if (error.code === "23505") {
      if (error.message.includes("username")) {
        return { error: "Username is already taken" };
      }
      if (error.message.includes("email")) {
        return { error: "Email is already registered" };
      }
      return { error: "Account already exists" };
    }
    return { error: error.message };
  }

  return { error: null };
}
