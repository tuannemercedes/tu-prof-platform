import type { createClient } from "@/lib/supabase/server";
import type { Liberados } from "@/lib/visao";

export type MaterialStatus = { id: string; titulo: string; concluido: boolean };
export type Fase = { id: string; titulo: string; ordem: number; materiais: MaterialStatus[] };
export type Trilha = {
  id: string;
  titulo: string;
  categoria: string;
  ordem: number;
  capa_path: string | null;
  descricao: string | null;
  fases: Fase[];
  materiaisSemFase: MaterialStatus[];
  total: number;
  concluidos: number;
};

type MaterialRow = {
  id: string;
  titulo: string;
  materia_id: string;
  fase_id: string | null;
  ordem: number;
  idioma: string;
  materias: { id: string; titulo: string; categoria: string; ordem: number; capa_path: string | null; descricao: string | null } | null;
};

// Monta as trilhas (matérias) que o aluno logado enxerga, com o progresso dele.
// A RLS já filtra os materiais liberados para ele.
export async function getTrilhasDoAluno(
  supabase: Awaited<ReturnType<typeof createClient>>,
  alunoId: string,
  idioma?: string,
  lib: Liberados = null
): Promise<Trilha[]> {
  const [{ data: materiaisRows }, { data: fasesRows }, { data: progresso }] = await Promise.all([
    supabase
      .from("materiais")
      .select("id, titulo, materia_id, fase_id, ordem, idioma, materias(id, titulo, categoria, ordem, capa_path, descricao)")
      .order("ordem")
      .order("created_at"),
    supabase.from("fases").select("id, materia_id, titulo, ordem").order("ordem"),
    supabase.from("progresso").select("material_id, concluido").eq("aluno_id", alunoId),
  ]);

  const progressoMap = new Map((progresso ?? []).map((p) => [p.material_id, p.concluido]));
  const rows = (materiaisRows ?? []) as unknown as MaterialRow[];

  type Build = Omit<Trilha, "fases"> & { fasesMap: Map<string, Fase> };
  const mapa = new Map<string, Build>();

  rows.forEach((row) => {
    if (!row.materias) return;
    if (lib && !lib.materiais.has(row.id)) return;
    if (idioma && row.idioma !== idioma && row.idioma !== "espanhol_ingles") return;
    if (!mapa.has(row.materias.id)) {
      mapa.set(row.materias.id, {
        id: row.materias.id,
        titulo: row.materias.titulo,
        categoria: row.materias.categoria,
        ordem: row.materias.ordem,
        capa_path: row.materias.capa_path,
        descricao: row.materias.descricao,
        fasesMap: new Map(),
        materiaisSemFase: [],
        total: 0,
        concluidos: 0,
      });
    }
    const trilha = mapa.get(row.materias.id)!;
    const concluido = progressoMap.get(row.id) ?? false;
    const entry = { id: row.id, titulo: row.titulo, concluido };
    trilha.total += 1;
    if (concluido) trilha.concluidos += 1;

    if (row.fase_id) {
      if (!trilha.fasesMap.has(row.fase_id)) {
        const info = fasesRows?.find((f) => f.id === row.fase_id);
        trilha.fasesMap.set(row.fase_id, {
          id: row.fase_id,
          titulo: info?.titulo ?? "Fase",
          ordem: info?.ordem ?? 0,
          materiais: [],
        });
      }
      trilha.fasesMap.get(row.fase_id)!.materiais.push(entry);
    } else {
      trilha.materiaisSemFase.push(entry);
    }
  });

  return [...mapa.values()]
    .sort((a, b) => a.ordem - b.ordem || a.titulo.localeCompare(b.titulo))
    .map(({ fasesMap, ...t }) => ({
      ...t,
      fases: [...fasesMap.values()].sort((a, b) => a.ordem - b.ordem),
    }));
}

export function pct(concluidos: number, total: number) {
  return total ? Math.round((concluidos / total) * 100) : 0;
}
