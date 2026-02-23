import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabase } from "@/server/db";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const { data: user } = await supabase
    .from("users")
    .select(
      "id, bio, website_url, github_url, twitter_url, instagram_url, discord_handle"
    )
    .eq("clerk_id", clerkId)
    .limit(1)
    .single();

  if (!user) redirect("/sign-in");

  return (
    <div>
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-muted-foreground">
        Update your profile information
      </p>
      <div className="mt-6">
        <ProfileSettingsForm
          initialData={{
            bio: user.bio ?? "",
            websiteUrl: user.website_url ?? "",
            githubUrl: user.github_url ?? "",
            twitterUrl: user.twitter_url ?? "",
            instagramUrl: user.instagram_url ?? "",
            discordHandle: user.discord_handle ?? "",
          }}
        />
      </div>
    </div>
  );
}
