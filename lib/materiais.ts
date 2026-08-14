import type { createClient } from "@/lib/supabase/server";

export type MaterialAcessivel = {
  id: string;
  titulo: string;
  materia_id: string;
  fase_id: string | null;
  ordem: number;
  materias: { id: string; titulo: string; categoria: string } | null;
};

// Usado nas páginas de admin (preview "ver como aluno") — o admin bypassa a
// RLS de materiais, então filtramos por acesso na aplicação, igual já
// fazemos pra cronograma/planner/clube.
export async function getMateriaisParaAluno(
  supabase: Awaited<ReturnType<typeof createClient>>,
  alunoId: string
): Promise<MaterialAcessivel[]> {
  const [{ data: turmaMembros }, { data: rows }] = await Promise.all([
    supabase.from("turma_membros").select("turma_id").eq("aluno_id", alunoId),
    supabase
      .from("materiais")
      .select(
        "id, titulo, materia_id, fase_id, ordem, visivel_todos, materias(id, titulo, categoria), material_turmas(turma_id), material_alunos(aluno_id)"
      )
      .order("ordem"),
  ]);

  const turmaIdsDoAluno = new Set((turmaMembros ?? []).map((t) => t.turma_id));

  type Row = MaterialAcessivel & {
    visivel_todos: boolean;
    material_turmas: { turma_id: string }[];
    material_alunos: { aluno_id: string }[];
  };

  return ((rows ?? []) as unknown as Row[])
    .filter((row) => {
      if (row.visivel_todos) return true;
      const viaTurma = row.material_turmas.some((mt) => turmaIdsDoAluno.has(mt.turma_id));
      const viaAluno = row.material_alunos.some((ma) => ma.aluno_id === alunoId);
      return viaTurma || viaAluno;
    })
    .map((row) => ({
      id: row.id,
      titulo: row.titulo,
      materia_id: row.materia_id,
      fase_id: row.fase_id,
      ordem: row.ordem,
      materias: row.materias,
    }));
}
