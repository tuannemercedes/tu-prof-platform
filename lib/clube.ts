import type { createClient } from "@/lib/supabase/server";

// Usado nas páginas de admin (preview "ver como aluno") — o admin bypassa a
// RLS do clube, então checamos o acesso na aplicação, igual já fazemos pra
// materiais/cronograma/planner.
export async function getClubeAcessoParaAluno(
  supabase: Awaited<ReturnType<typeof createClient>>,
  alunoId: string
): Promise<boolean> {
  const [{ data: config }, { data: membros }, { data: turmasAcesso }, { data: alunoAcesso }] = await Promise.all([
    supabase.from("clube_config").select("visivel_todos").eq("id", 1).single(),
    supabase.from("turma_membros").select("turma_id").eq("aluno_id", alunoId),
    supabase.from("clube_turmas").select("turma_id"),
    supabase.from("clube_alunos").select("aluno_id").eq("aluno_id", alunoId),
  ]);

  if (config?.visivel_todos) return true;

  const turmaIds = new Set((membros ?? []).map((m) => m.turma_id));
  const temPorTurma = (turmasAcesso ?? []).some((t) => turmaIds.has(t.turma_id));
  const temIndividual = (alunoAcesso ?? []).length > 0;

  return temPorTurma || temIndividual;
}

type AlunoBasico = { id: string; nome: string; email: string };

// Lista de todos os alunos que têm acesso ao clube agora (via "todos",
// turma ou individual) — usado pra montar o resumo de confirmações no
// painel do admin.
export async function getAlunosComAcessoClube(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<AlunoBasico[]> {
  const [{ data: config }, { data: turmasAcesso }, { data: alunoAcesso }, { data: todosAlunos }] =
    await Promise.all([
      supabase.from("clube_config").select("visivel_todos").eq("id", 1).single(),
      supabase.from("clube_turmas").select("turma_id"),
      supabase.from("clube_alunos").select("aluno_id"),
      supabase.from("profiles").select("id, nome, email").eq("role", "aluno").order("nome"),
    ]);

  const alunos = todosAlunos ?? [];
  if (config?.visivel_todos) return alunos;

  const turmaIds = (turmasAcesso ?? []).map((t) => t.turma_id);
  const alunoIdsIndividuais = new Set((alunoAcesso ?? []).map((a) => a.aluno_id));

  let alunoIdsPorTurma = new Set<string>();
  if (turmaIds.length > 0) {
    const { data: membros } = await supabase
      .from("turma_membros")
      .select("aluno_id")
      .in("turma_id", turmaIds);
    alunoIdsPorTurma = new Set((membros ?? []).map((m) => m.aluno_id));
  }

  return alunos.filter((a) => alunoIdsIndividuais.has(a.id) || alunoIdsPorTurma.has(a.id));
}

export type ResumoRsvpTema = {
  confirmados: AlunoBasico[];
  recusados: AlunoBasico[];
  pendentes: AlunoBasico[];
};

// Cruza os alunos com acesso ao clube com as respostas registradas pra um
// tema (encontro) específico, pra mentora ver quem vai, quem não vai e
// quem ainda não respondeu.
export async function getResumoRsvpTema(
  supabase: Awaited<ReturnType<typeof createClient>>,
  temaId: string
): Promise<ResumoRsvpTema> {
  const [alunosComAcesso, { data: rsvps }] = await Promise.all([
    getAlunosComAcessoClube(supabase),
    supabase.from("clube_rsvps").select("aluno_id, confirmado").eq("tema_id", temaId),
  ]);

  const rsvpMap = new Map((rsvps ?? []).map((r) => [r.aluno_id, r.confirmado]));

  const confirmados: AlunoBasico[] = [];
  const recusados: AlunoBasico[] = [];
  const pendentes: AlunoBasico[] = [];

  for (const aluno of alunosComAcesso) {
    const status = rsvpMap.get(aluno.id);
    if (status === true) confirmados.push(aluno);
    else if (status === false) recusados.push(aluno);
    else pendentes.push(aluno);
  }

  return { confirmados, recusados, pendentes };
}
