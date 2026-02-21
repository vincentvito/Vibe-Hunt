"use client";

import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  Gamepad2,
  Search,
  Plus,
  Trophy,
  ShoppingBag,
  Crosshair,
} from "lucide-react";

export function Navbar({
  notificationSlot,
}: {
  notificationSlot?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Gamepad2 className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold tracking-tight">VibeHunt</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden items-center gap-1 md:flex">
          <NavLink href="/" icon={<Gamepad2 className="h-4 w-4" />}>
            Launchpad
          </NavLink>
          <NavLink href="/marketplace" icon={<ShoppingBag className="h-4 w-4" />}>
            Marketplace
          </NavLink>
          <NavLink href="/bounties" icon={<Crosshair className="h-4 w-4" />}>
            Bounties
          </NavLink>
          <NavLink href="/leaderboard" icon={<Trophy className="h-4 w-4" />}>
            Leaderboard
          </NavLink>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/search"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Search className="h-5 w-5" />
          </Link>

          <SignedIn>
            {notificationSlot}
            <Link
              href="/games/submit"
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Launch Game</span>
            </Link>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: { avatarBox: "h-8 w-8" },
              }}
            />
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {icon}
      {children}
    </Link>
  );
}
