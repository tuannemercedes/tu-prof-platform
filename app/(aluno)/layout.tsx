import { requireAluno } from "@/lib/dal";
import AlunoSidebar from "@/components/aluno-sidebar";
import { createClient } from "@/lib/supabase/server";

type MateriaRow = { materia_id: string; materias: { id: string; titulo: string; categoria: string } | null };

export default async function AlunoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAluno();

  const supabase = await createClient();
  const [{ data: materiaisRows }, { data: config }] = await Promise.all([
    supabase
      .from("materiais")
      .select("materia_id, materias(id, titulo, categoria)")
      .order("materia_id"),
    supabase.from("configuracoes").select("chave, valor"),
  ]);

  const materiasMap = new Map<string, { id: string; titulo: string; categoria: string }>();
  ((materiaisRows ?? []) as unknown as MateriaRow[]).forEach((row) => {
    if (row.materias) materiasMap.set(row.materias.id, row.materias);
  });

  const todas = [...materiasMap.values()];
  const trilhas = todas.filter((m) => m.categoria !== "fia");
  const fia = todas.filter((m) => m.categoria === "fia");

  const appTreinoUrl = config?.find((c) => c.chave === "app_treino_url")?.valor;
  const appTreinoLabel =
    config?.find((c) => c.chave === "app_treino_label")?.valor ?? "Acessar app de simulação";

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <AlunoSidebar
        nome={profile.nome || profile.email}
        trilhas={trilhas}
        fia={fia}
        appTreinoUrl={appTreinoUrl}
        appTreinoLabel={appTreinoLabel}
      />
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
