import type { createClient } from "@/lib/supabase/server";
import { diaISO, segundaDaSemana, somarDias } from "@/lib/datas";

type Supa = Awaited<ReturnType<typeof createClient>>;

export type ResumoAluno = {
  id: string;
  nome: string;
  email: string;
  professorId: string | null;
  professorNome: string;
  programas: { id: string; nome: string; idioma: string }[];
  tarefasTotal: number;
  tarefasFeitas: number;
  tarefasAtrasadas: number;
  proximaAula: string | null;
  aulasDesdeCheckpoint: number;
  situacao: "em_dia" | "atrasado" | "sem_aula";
};

export type AulaSemana = { id: string; data: string; alunoId: string; alunoNome: string; tema: string; programa: string };

// Visão geral dos alunos que a pessoa logada pode ver (a RLS já filtra:
// admin vê todos, professor só os dele). `soDe` filtra por professor responsável
// ("visão do professor" da admin = alunos sem professor definido, que são dela).
export async function getResumoEquipe(supabase: Supa, opcoes: { soDe?: string | "admin" } = {}) {
  const hoje = diaISO(new Date());
  const segunda = segundaDaSemana(hoje);
  const proximaSegunda = somarDias(segunda, 7);

  const [{ data: perfis }, { data: membros }, { data: tarefas }, { data: entregas }, { data: aulas }, { data: checkpoints }] =
    await Promise.all([
      supabase.from("profiles").select("id, nome, email, role, professor_id").order("nome"),
      supabase.from("turma_membros").select("aluno_id, turma_id, turmas(id, nome, idioma)"),
      supabase.from("tarefas").select("id, aluno_id, turma_id, prazo"),
      supabase.from("tarefa_entregas").select("tarefa_id, aluno_id, concluida"),
      supabase.from("aulas").select("id, aluno_id, data, tema, status").order("data"),
      supabase.from("checkpoints").select("aluno_id, data").order("data", { ascending: false }),
    ]);

  const todos = perfis ?? [];
  const nomeDe = new Map(todos.map((p) => [p.id, p.nome || p.email]));
  const adminNome = todos.find((p) => p.role === "admin")?.nome ?? "Você";

  let alunos = todos.filter((p) => p.role === "aluno");
  if (opcoes.soDe === "admin") alunos = alunos.filter((a) => !a.professor_id);
  else if (opcoes.soDe) alunos = alunos.filter((a) => a.professor_id === opcoes.soDe);

  const progDe = new Map<string, { id: string; nome: string; idioma: string }[]>();
  (membros ?? []).forEach((m) => {
    const t = m.turmas as unknown as { id: string; nome: string; idioma: string } | null;
    if (!t) return;
    progDe.set(m.aluno_id, [...(progDe.get(m.aluno_id) ?? []), t]);
  });

  const feitas = new Set((entregas ?? []).filter((e) => e.concluida).map((e) => `${e.tarefa_id}:${e.aluno_id}`));

  const resumo: ResumoAluno[] = alunos.map((a) => {
    const turmas = new Set((progDe.get(a.id) ?? []).map((t) => t.id));
    const minhas = (tarefas ?? []).filter((t) => t.aluno_id === a.id || (t.turma_id && turmas.has(t.turma_id)));
    const ok = minhas.filter((t) => feitas.has(`${t.id}:${a.id}`));
    const atrasadas = minhas.filter((t) => t.prazo && t.prazo < hoje && !feitas.has(`${t.id}:${a.id}`));
    const doAluno = (aulas ?? []).filter((x) => x.aluno_id === a.id);
    const proxima = doAluno.find((x) => x.status === "agendada" && x.data && diaISO(x.data) >= hoje)?.data ?? null;
    const ultimoCp = (checkpoints ?? []).find((c) => c.aluno_id === a.id)?.data ?? "0000-00-00";
    const desde = doAluno.filter((x) => x.status === "realizada" && x.data && diaISO(x.data) > ultimoCp).length;

    return {
      id: a.id,
      nome: a.nome || a.email,
      email: a.email,
      professorId: a.professor_id,
      professorNome: a.professor_id ? nomeDe.get(a.professor_id) ?? "Professor" : adminNome,
      programas: progDe.get(a.id) ?? [],
      tarefasTotal: minhas.length,
      tarefasFeitas: ok.length,
      tarefasAtrasadas: atrasadas.length,
      proximaAula: proxima,
      aulasDesdeCheckpoint: desde,
      situacao: atrasadas.length ? "atrasado" : proxima ? "em_dia" : "sem_aula",
    };
  });

  const ids = new Set(resumo.map((r) => r.id));
  const aulasSemana: AulaSemana[] = (aulas ?? [])
    .filter((x) => x.data && ids.has(x.aluno_id) && diaISO(x.data) >= segunda && diaISO(x.data) < proximaSegunda)
    .map((x) => ({
      id: x.id,
      data: x.data!,
      alunoId: x.aluno_id,
      alunoNome: nomeDe.get(x.aluno_id) ?? "",
      tema: x.tema,
      programa: progDe.get(x.aluno_id)?.[0]?.nome ?? "Aula",
    }));

  return { alunos: resumo, aulasSemana, hoje, segunda, proximaSegunda };
}
