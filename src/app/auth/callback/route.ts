import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { supabase as supabaseAdmin } from "@/server/db";
import { safeRedirect } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRedirect(searchParams.get("next") ?? "/");

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile, error: profileError } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("auth_id", user.id)
          .limit(1)
          .maybeSingle();

        if (profileError) {
          // DB error — don't redirect to complete-profile for existing users.
          // Let them through; downstream checks will catch missing profiles.
          console.error("Auth callback profile check error:", profileError.message);
        } else if (!profile) {
          return NextResponse.redirect(`${origin}/complete-profile`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_failed`);
}
