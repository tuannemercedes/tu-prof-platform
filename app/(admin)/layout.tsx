import { requireStaff } from "@/lib/dal";
import EquipeSidebar from "@/components/equipe-sidebar";

export default async function EquipeLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireStaff();

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <EquipeSidebar nome={profile.nome || profile.email} papel={profile.role} />
      <main className="flex-1 min-w-0 box-border px-4 sm:px-[clamp(20px,4vw,56px)] pt-6 sm:pt-9 pb-14">
        <div className="max-w-[1280px] mx-auto">
        {children}
        </div>
      </main>
    </div>
  );
}
