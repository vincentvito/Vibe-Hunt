import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Gamepad2,
  LayoutDashboard,
  Settings,
  DollarSign,
  ShoppingBag,
  HandCoins,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabaseAuth = await createServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="mx-auto flex w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        {/* Sidebar */}
        <aside className="hidden w-56 flex-shrink-0 md:block">
          <nav className="space-y-1">
            <SidebarLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>
              Overview
            </SidebarLink>
            <SidebarLink href="/dashboard/games" icon={<Gamepad2 className="h-4 w-4" />}>
              My Games
            </SidebarLink>
            <SidebarLink href="/dashboard/listings" icon={<ShoppingBag className="h-4 w-4" />}>
              Listings
            </SidebarLink>
            <SidebarLink href="/dashboard/offers" icon={<HandCoins className="h-4 w-4" />}>
              Offers
            </SidebarLink>
            <SidebarLink href="/dashboard/earnings" icon={<DollarSign className="h-4 w-4" />}>
              Earnings
            </SidebarLink>
            <SidebarLink href="/dashboard/settings" icon={<Settings className="h-4 w-4" />}>
              Settings
            </SidebarLink>
          </nav>
        </aside>

        {/* Content */}
        <div className="min-w-0 flex-1 md:ml-8">{children}</div>
      </div>
    </div>
  );
}

function SidebarLink({
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
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {icon}
      {children}
    </Link>
  );
}
