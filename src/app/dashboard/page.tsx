import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { supabase } from "@/server/db";
import { Gamepad2, Eye, ChevronUp } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabaseAuth = await createServerClient();
  const {
    data: { user: authUser },
  } = await supabaseAuth.auth.getUser();

  if (!authUser) {
    redirect("/sign-in");
  }

  const { data: user } = await supabase
    .from("users")
    .select("id, display_name")
    .eq("auth_id", authUser.id)
    .limit(1)
    .maybeSingle();

  if (!user) {
    redirect("/complete-profile");
  }

  let totalGames = 0;
  let totalUpvotes = 0;
  let totalPlays = 0;

  const { data: userGames } = await supabase
    .from("games")
    .select("upvote_count, play_count")
    .eq("creator_id", user.id);

  if (userGames) {
    totalGames = userGames.length;
    totalUpvotes = userGames.reduce((s, g) => s + (g.upvote_count ?? 0), 0);
    totalPlays = userGames.reduce((s, g) => s + (g.play_count ?? 0), 0);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">
        Welcome back, {user.display_name}
      </h1>
      <p className="mt-1 text-muted-foreground">
        Here&apos;s an overview of your games
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Gamepad2 className="h-5 w-5 text-primary" />}
          label="Games"
          value={totalGames}
        />
        <StatCard
          icon={<ChevronUp className="h-5 w-5 text-primary" />}
          label="Total Upvotes"
          value={totalUpvotes}
        />
        <StatCard
          icon={<Eye className="h-5 w-5 text-primary" />}
          label="Total Plays"
          value={totalPlays}
        />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold">{value.toLocaleString()}</p>
    </div>
  );
}
