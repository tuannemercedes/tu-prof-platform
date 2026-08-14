import type { createClient } from "@/lib/supabase/server";

// Usado nas páginas de admin (preview "ver como aluno") — o admin bypassa a
// RLS do clube, então checamos o acesso na aplicação, igual já fazemos pra
// materiais/cronograma/planner.
export async function getClubeAcessoParaAluno(
  supabase: Awaited<ReturnType<typeof createClient>>,
  alunoId: string
): Promise<boolean> {
  const [{ data: membros }, { data: turmasAcesso }, { data: alunoAcesso }] = await Promise.all([
    supabase.from("turma_membros").select("turma_id").eq("aluno_id", alunoId),
    supabase.from("clube_turmas").select("turma_id"),
    supabase.from("clube_alunos").select("aluno_id").eq("aluno_id", alunoId),
  ]);

  const turmaIds = new Set((membros ?? []).map((m) => m.turma_id));
  const temPorTurma = (turmasAcesso ?? []).some((t) => turmaIds.has(t.turma_id));
  const temIndividual = (alunoAcesso ?? []).length > 0;

  return temPorTurma || temIndividual;
}
