import { requireStaff } from "@/lib/dal";
import EquipeSidebar from "@/components/equipe-sidebar";

export default async function EquipeLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireStaff();

  return (
    <div className="min-h-screen flex flex-wrap">
      <EquipeSidebar nome={profile.nome || profile.email} papel={profile.role} />
      <main className="flex-[999_1_560px] min-w-0 box-border px-5 sm:px-[clamp(20px,4vw,56px)] pt-9 pb-14">
        {children}
      </main>
    </div>
  );
}
