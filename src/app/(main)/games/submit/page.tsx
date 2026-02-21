import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Rocket } from "lucide-react";
import { GameSubmitForm } from "@/components/games/game-submit-form";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Launch a Game",
  description: "Submit your vibecoded game to VibeHunt",
};

export default async function SubmitGamePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <Rocket className="h-4 w-4" />
          Launch a Game
        </div>
        <h1 className="mt-4 text-2xl font-bold">Submit Your Game</h1>
        <p className="mt-1 text-muted-foreground">
          Share your creation with the VibeHunt community. Games with playable
          web builds get the most engagement.
        </p>
      </div>

      <GameSubmitForm />
    </div>
  );
}
