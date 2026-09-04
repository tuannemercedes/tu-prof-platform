import type { createClient } from "@/lib/supabase/server";

// Usado nas páginas de admin (preview "ver como aluno") — o admin bypassa a
// RLS do glossário, então checamos o acesso na aplicação, igual já fazemos
// pra materiais/cronograma/planner/clube.
export async function getGlossarioAcessoParaAluno(
  supabase: Awaited<ReturnType<typeof createClient>>,
  alunoId: string
): Promise<boolean> {
  const [{ data: config }, { data: membros }, { data: turmasAcesso }, { data: alunoAcesso }] = await Promise.all([
    supabase.from("glossario_config").select("visivel_todos").eq("id", 1).single(),
    supabase.from("turma_membros").select("turma_id").eq("aluno_id", alunoId),
    supabase.from("glossario_turmas").select("turma_id"),
    supabase.from("glossario_alunos").select("aluno_id").eq("aluno_id", alunoId),
  ]);

  if (config?.visivel_todos) return true;

  const turmaIds = new Set((membros ?? []).map((m) => m.turma_id));
  const temPorTurma = (turmasAcesso ?? []).some((t) => turmaIds.has(t.turma_id));
  const temIndividual = (alunoAcesso ?? []).length > 0;

  return temPorTurma || temIndividual;
}
