"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Gamepad2,
  Search,
  Plus,
  Trophy,
  ShoppingBag,
  Crosshair,
  Menu,
  X,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { UserMenu } from "@/components/layout/user-menu";

const NAV_LINKS = [
  { href: "/", label: "Launchpad", icon: Gamepad2 },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/bounties", label: "Bounties", icon: Crosshair },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
] as const;

export function Navbar({
  notificationSlot,
}: {
  notificationSlot?: React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md" ref={menuRef}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Gamepad2 className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold tracking-tight">VibeHunt</span>
        </Link>

        {/* Nav links (desktop) */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} icon={<link.icon className="h-4 w-4" />}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/search"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Search className="h-5 w-5" />
          </Link>

          {isLoaded && isSignedIn && (
            <>
              {notificationSlot}
              <Link
                href="/games/submit"
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Launch Game</span>
              </Link>
              <UserMenu />
            </>
          )}

          {isLoaded && !isSignedIn && (
            <Link
              href="/sign-in"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Sign In
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <nav className="border-t border-border bg-card px-4 py-3 md:hidden">
          <div className="space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {isLoaded && isSignedIn && (
            <>
              <div className="my-2 border-t border-border" />
              <div className="space-y-1">
                <Link
                  href="/games/submit"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Plus className="h-4 w-4" />
                  Launch Game
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </div>
            </>
          )}

          {isLoaded && !isSignedIn && (
            <>
              <div className="my-2 border-t border-border" />
              <Link
                href="/sign-in"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-muted"
              >
                Sign In
              </Link>
            </>
          )}
        </nav>
      )}
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
