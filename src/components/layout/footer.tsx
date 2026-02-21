import Link from "next/link";
import { Gamepad2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Gamepad2 className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">VibeHunt</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Discover, play, and trade vibecoded games.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Discover</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground">
                  Launchpad
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-foreground">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-foreground">
                  Search
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Trade</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/marketplace" className="hover:text-foreground">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/bounties" className="hover:text-foreground">
                  Bounties
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Creators</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/games/submit" className="hover:text-foreground">
                  Launch a Game
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-foreground">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} VibeHunt. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
