import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/server/db";
import { Gamepad2, Eye, ChevronUp } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();

  let user: { id: string; display_name: string } | null = null;
  let totalGames = 0;
  let totalUpvotes = 0;
  let totalPlays = 0;

  try {
    const { data } = await supabase
      .from("users")
      .select("id, display_name")
      .eq("clerk_id", clerkId!)
      .limit(1)
      .single();
    user = data;
  } catch {
    // DB not connected yet
  }

  if (!user) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Welcome to VibeHunt</h1>
        <p className="mt-1 text-muted-foreground">
          Your account is being set up. Connect a database to get started.
        </p>
      </div>
    );
  }

  try {
    const { data: userGames } = await supabase
      .from("games")
      .select("upvote_count, play_count")
      .eq("creator_id", user.id);

    if (userGames) {
      totalGames = userGames.length;
      totalUpvotes = userGames.reduce((s, g) => s + (g.upvote_count ?? 0), 0);
      totalPlays = userGames.reduce((s, g) => s + (g.play_count ?? 0), 0);
    }
  } catch {
    // DB query failed
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
