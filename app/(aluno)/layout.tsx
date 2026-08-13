import { requireAluno } from "@/lib/dal";
import AlunoSidebar from "@/components/aluno-sidebar";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/dal";

type MateriaRow = {
  id: string;
  titulo: string;
  materia_id: string;
  fase_id: string | null;
  ordem: number;
  materias: { id: string; titulo: string; categoria: string } | null;
};

export default async function AlunoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAluno();
  const user = await getUser();

  const supabase = await createClient();
  const [{ data: materiaisRows }, { data: fasesRows }, { data: progresso }, { data: config }] =
    await Promise.all([
      supabase
        .from("materiais")
        .select("id, titulo, materia_id, fase_id, ordem, materias(id, titulo, categoria)")
        .order("ordem"),
      supabase.from("fases").select("id, materia_id, titulo, ordem").order("ordem"),
      supabase.from("progresso").select("material_id, concluido").eq("aluno_id", user!.id),
      supabase.from("configuracoes").select("chave, valor"),
    ]);

  const progressoMap = new Map((progresso ?? []).map((p) => [p.material_id, p.concluido]));
  const rows = (materiaisRows ?? []) as unknown as MateriaRow[];

  type TrilhaBuild = {
    id: string;
    titulo: string;
    categoria: string;
    fasesMap: Map<string, { id: string; titulo: string; ordem: number; materiais: { id: string; titulo: string; concluido: boolean }[] }>;
    materiaisSemFase: { id: string; titulo: string; concluido: boolean }[];
  };

  const trilhasMap = new Map<string, TrilhaBuild>();

  rows.forEach((row) => {
    if (!row.materias) return;
    if (!trilhasMap.has(row.materias.id)) {
      trilhasMap.set(row.materias.id, {
        id: row.materias.id,
        titulo: row.materias.titulo,
        categoria: row.materias.categoria,
        fasesMap: new Map(),
        materiaisSemFase: [],
      });
    }
    const trilha = trilhasMap.get(row.materias.id)!;
    const materialEntry = {
      id: row.id,
      titulo: row.titulo,
      concluido: progressoMap.get(row.id) ?? false,
    };

    if (row.fase_id) {
      if (!trilha.fasesMap.has(row.fase_id)) {
        const faseInfo = fasesRows?.find((f) => f.id === row.fase_id);
        trilha.fasesMap.set(row.fase_id, {
          id: row.fase_id,
          titulo: faseInfo?.titulo ?? "Fase",
          ordem: faseInfo?.ordem ?? 0,
          materiais: [],
        });
      }
      trilha.fasesMap.get(row.fase_id)!.materiais.push(materialEntry);
    } else {
      trilha.materiaisSemFase.push(materialEntry);
    }
  });

  const todas = [...trilhasMap.values()];
  const trilhas = todas
    .filter((t) => t.categoria !== "fia")
    .map((t) => ({
      id: t.id,
      titulo: t.titulo,
      fases: [...t.fasesMap.values()].sort((a, b) => a.ordem - b.ordem),
      materiaisSemFase: t.materiaisSemFase,
    }));
  const fia = todas.filter((t) => t.categoria === "fia").map((t) => ({ id: t.id, titulo: t.titulo }));

  const appUrl = config?.find((c) => c.chave === "app_treino_url")?.valor;
  const appLabel = config?.find((c) => c.chave === "app_treino_label")?.valor;
  const contatoUrl = config?.find((c) => c.chave === "contato_url")?.valor;
  const contatoLabel = config?.find((c) => c.chave === "contato_label")?.valor;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <AlunoSidebar
        nome={profile.nome || profile.email}
        trilhas={trilhas}
        fia={fia}
        appUrl={appUrl}
        appLabel={appLabel}
        contatoUrl={contatoUrl}
        contatoLabel={contatoLabel}
      />
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
