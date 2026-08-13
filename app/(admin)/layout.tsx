import { requireAdmin } from "@/lib/dal";
import AdminSidebar from "@/components/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAdmin();

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <AdminSidebar email={profile.email} />
      <main className="flex-1 p-4 sm:p-6 min-w-0">{children}</main>
    </div>
  );
}
