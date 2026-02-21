import { ShoppingBag } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Buy and sell vibecoded game projects",
};

export default function MarketplacePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold">The Exit Engine</h1>
      <p className="mt-1 text-muted-foreground">
        Buy and sell game IP, codebases, and assets
      </p>

      <div className="mt-16 py-16 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Coming Soon</h2>
        <p className="mt-1 text-muted-foreground">
          The marketplace is launching in the next sprint. List your game&apos;s
          IP, codebase, and assets for sale.
        </p>
      </div>
    </div>
  );
}
