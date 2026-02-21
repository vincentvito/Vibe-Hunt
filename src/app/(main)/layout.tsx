import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CategoryBar } from "@/components/layout/category-bar";
import { NotificationBellServer } from "@/components/social/notification-bell-server";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar notificationSlot={<NotificationBellServer />} />
      <main className="flex-1">{children}</main>
      <CategoryBar />
      <Footer />
    </div>
  );
}
