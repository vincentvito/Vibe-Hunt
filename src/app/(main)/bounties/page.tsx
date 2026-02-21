import { Crosshair } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bounties",
  description: "Request custom games and find developers to build them",
};

export default function BountiesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold">Bounties</h1>
      <p className="mt-1 text-muted-foreground">
        Post game requests and find developers to build them
      </p>

      <div className="mt-16 py-16 text-center">
        <Crosshair className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Coming Soon</h2>
        <p className="mt-1 text-muted-foreground">
          The bounty board is launching soon. Post &quot;I want a game like X&quot;
          and devs will bid to build it.
        </p>
      </div>
    </div>
  );
}
