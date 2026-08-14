import type { createClient } from "@/lib/supabase/server";

export type PlannerItem = { id: string; texto: string; concluido: boolean; link_url: string | null };
export type PlannerDia = {
  id: string;
  semana: number;
  titulo: string;
  conteudo_html: string | null;
  planner_itens: PlannerItem[];
};

// Usado nas páginas de admin (preview "ver como aluno") — o admin bypassa a
// RLS de planner_dias, então filtramos por acesso na aplicação, igual já
// fazemos pra materiais e cronograma.
export async function getPlannerDiasParaAluno(
  supabase: Awaited<ReturnType<typeof createClient>>,
  alunoId: string
): Promise<PlannerDia[]> {
  const [{ data: turmaMembros }, { data: rows }] = await Promise.all([
    supabase.from("turma_membros").select("turma_id").eq("aluno_id", alunoId),
    supabase
      .from("planner_dias")
      .select(
        "id, semana, titulo, conteudo_html, planner_itens(id, texto, concluido, link_url), planners!inner(visivel_todos, planner_turmas(turma_id), planner_alunos(aluno_id))"
      )
      .order("semana")
      .order("ordem"),
  ]);

  const turmaIdsDoAluno = new Set((turmaMembros ?? []).map((t) => t.turma_id));

  type Row = PlannerDia & {
    planners: {
      visivel_todos: boolean;
      planner_turmas: { turma_id: string }[];
      planner_alunos: { aluno_id: string }[];
    } | null;
  };

  return ((rows ?? []) as unknown as Row[])
    .filter((row) => {
      const p = row.planners;
      if (!p) return false;
      if (p.visivel_todos) return true;
      const viaTurma = p.planner_turmas.some((pt) => turmaIdsDoAluno.has(pt.turma_id));
      const viaAluno = p.planner_alunos.some((pa) => pa.aluno_id === alunoId);
      return viaTurma || viaAluno;
    })
    .map((row) => ({
      id: row.id,
      semana: row.semana,
      titulo: row.titulo,
      conteudo_html: row.conteudo_html,
      planner_itens: row.planner_itens,
    }));
}
