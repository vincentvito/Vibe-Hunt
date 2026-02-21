import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/server/db";

export async function getCurrentUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const { data: user } = await supabase
    .from("users")
    .select("id, role, username, display_name")
    .eq("clerk_id", clerkId)
    .limit(1)
    .single();

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new Error("Forbidden: admin access required");
  }
  return user;
}
