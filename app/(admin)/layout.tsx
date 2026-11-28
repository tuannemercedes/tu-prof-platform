import { requireStaff } from "@/lib/dal";
import EquipeSidebar from "@/components/equipe-sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function EquipeLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireStaff();
  // Missões esperando comentário (o professor vê só as dos alunos dele, pela RLS).
  const supabase = await createClient();
  const { count: missoesPendentes } = await supabase
    .from("missao_entregas")
    .select("id", { count: "exact", head: true })
    .is("comentario_em", null)
    .eq("precisa_correcao", true);

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <EquipeSidebar nome={profile.nome || profile.email} papel={profile.role} contagens={{ missoes: missoesPendentes ?? 0 }} />
      <main className="flex-1 min-w-0 box-border px-4 sm:px-[clamp(20px,4vw,56px)] pt-6 sm:pt-9 pb-14">
        <div className="max-w-[1280px] mx-auto">
        {children}
        </div>
      </main>
    </div>
  );
}
