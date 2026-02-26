import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { supabase } from "@/server/db";

export type CurrentUser = {
  id: string;
  role: string;
  username: string;
  display_name: string;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabaseAuth = await createServerClient();
  const {
    data: { user: authUser },
  } = await supabaseAuth.auth.getUser();
  if (!authUser) return null;

  const { data: user } = await supabase
    .from("users")
    .select("id, role, username, display_name")
    .eq("auth_id", authUser.id)
    .limit(1)
    .maybeSingle();

  return user;
}

export async function requireAuth(): Promise<CurrentUser> {
  const supabaseAuth = await createServerClient();
  const {
    data: { user: authUser },
  } = await supabaseAuth.auth.getUser();

  if (!authUser) {
    throw new Error("Unauthorized");
  }

  const { data: user } = await supabase
    .from("users")
    .select("id, role, username, display_name")
    .eq("auth_id", authUser.id)
    .limit(1)
    .maybeSingle();

  if (!user) {
    redirect("/complete-profile");
  }

  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireAuth();
  if (user.role !== "admin") {
    throw new Error("Forbidden: admin access required");
  }
  return user;
}
