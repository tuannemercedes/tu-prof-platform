import type { createClient } from "@/lib/supabase/server";
import { getTarefasDoAluno } from "@/lib/tarefas";

export type Novidade = {
  id: string;
  tipo: "material" | "clube" | "planner" | "correcao" | "aula" | "tarefa" | "missao";
  titulo: string;
  href: string;
  criadoEm: string;
};

export async function getNovidadesParaAluno(
  supabase: Awaited<ReturnType<typeof createClient>>,
  alunoId: string,
  desde: string
): Promise<Novidade[]> {
  const [
    { data: turmaMembros },
    { data: materiaisRows },
    { data: clubeConfig },
    { data: clubeTemas },
    { data: plannerRows },
    { data: correcoes },
  ] = await Promise.all([
    supabase.from("turma_membros").select("turma_id").eq("aluno_id", alunoId),
    supabase
      .from("materiais")
      .select(
        "id, titulo, materia_id, created_at, visivel_todos, material_turmas(turma_id), material_alunos(aluno_id)"
      )
      .gt("created_at", desde),
    supabase.from("clube_config").select("visivel_todos").eq("id", 1).maybeSingle(),
    supabase.from("clube_temas").select("id, tema, created_at").gt("created_at", desde),
    supabase
      .from("planner_itens")
      .select(
        "id, texto, created_at, planner_dias!inner(planner_id, planners!inner(visivel_todos, planner_turmas(turma_id), planner_alunos(aluno_id)))"
      )
      .gt("created_at", desde),
    supabase
      .from("missao_entregas")
      .select("id, comentario_em, comentario_nome, material_id, materiais(titulo, materia_id)")
      .eq("aluno_id", alunoId)
      .gt("comentario_em", desde),
  ]);

  const turmaIds = new Set((turmaMembros ?? []).map((t) => t.turma_id));
  const novidades: Novidade[] = [];

  type MatRow = {
    id: string;
    titulo: string;
    materia_id: string;
    created_at: string;
    visivel_todos: boolean;
    material_turmas: { turma_id: string }[];
    material_alunos: { aluno_id: string }[];
  };
  ((materiaisRows ?? []) as unknown as MatRow[]).forEach((m) => {
    const acessivel =
      m.visivel_todos ||
      m.material_turmas.some((mt) => turmaIds.has(mt.turma_id)) ||
      m.material_alunos.some((ma) => ma.aluno_id === alunoId);
    if (acessivel) {
      novidades.push({
        id: m.id,
        tipo: "material",
        titulo: `Novo material: ${m.titulo}`,
        href: `/aluno/materias/${m.materia_id}`,
        criadoEm: m.created_at,
      });
    }
  });

  let temClube = clubeConfig?.visivel_todos ?? false;
  if (!temClube) {
    const [{ data: clubeTurmas }, { data: clubeAlunos }] = await Promise.all([
      supabase.from("clube_turmas").select("turma_id"),
      supabase.from("clube_alunos").select("aluno_id").eq("aluno_id", alunoId),
    ]);
    temClube =
      (clubeTurmas ?? []).some((ct) => turmaIds.has(ct.turma_id)) || (clubeAlunos ?? []).length > 0;
  }
  if (temClube) {
    (clubeTemas ?? []).forEach((t) => {
      novidades.push({
        id: t.id,
        tipo: "clube",
        titulo: `Novo tema no clube: ${t.tema}`,
        href: "/aluno/clube",
        criadoEm: t.created_at,
      });
    });
  }

  type PlanRow = {
    id: string;
    texto: string;
    created_at: string;
    planner_dias: {
      planner_id: string;
      planners: {
        visivel_todos: boolean;
        planner_turmas: { turma_id: string }[];
        planner_alunos: { aluno_id: string }[];
      } | null;
    } | null;
  };
  ((plannerRows ?? []) as unknown as PlanRow[]).forEach((p) => {
    const planner = p.planner_dias?.planners;
    if (!planner) return;
    const acessivel =
      planner.visivel_todos ||
      planner.planner_turmas.some((pt) => turmaIds.has(pt.turma_id)) ||
      planner.planner_alunos.some((pa) => pa.aluno_id === alunoId);
    if (acessivel) {
      novidades.push({
        id: p.id,
        tipo: "planner",
        titulo: `Nova tarefa: ${p.texto}`,
        href: "/aluno/planner",
        criadoEm: p.created_at,
      });
    }
  });

  type CorrRow = { id: string; comentario_em: string; comentario_nome: string | null; material_id: string; materiais: { titulo: string; materia_id: string } | null };
  ((correcoes ?? []) as unknown as CorrRow[]).forEach((c) => {
    if (!c.materiais) return;
    novidades.push({
      id: c.id,
      tipo: "correcao",
      titulo: `${c.comentario_nome ?? "A equipe"} comentou a sua Missão: ${c.materiais.titulo.replace(/^Missão Chave · /, "")}`,
      href: `/aluno/materias/${c.materiais.materia_id}#material-${c.material_id}`,
      criadoEm: c.comentario_em,
    });
  });

  return novidades.sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1));
}

// O que está esperando o aluno agora (não some quando ele abre o sino; some quando ele resolve):
// aula nas próximas 24 h, tarefa vencendo ou vencida, e a Missão da aula que ele já começou.
export async function getPendenciasDoAluno(supabase: Awaited<ReturnType<typeof createClient>>, alunoId: string): Promise<Novidade[]> {
  const agora = new Date();
  const amanha = new Date(agora.getTime() + 24 * 3600 * 1000);
  const [{ data: aulas }, tarefas, { data: feitos }, { data: membros }] = await Promise.all([
    supabase
      .from("aulas")
      .select("id, data, tema")
      .eq("aluno_id", alunoId)
      .eq("status", "agendada")
      .gte("data", agora.toISOString())
      .lte("data", amanha.toISOString())
      .order("data"),
    getTarefasDoAluno(supabase, alunoId),
    supabase.from("progresso").select("material_id, concluido, materiais(fase_id)").eq("aluno_id", alunoId),
    supabase.from("turma_membros").select("turma_id").eq("aluno_id", alunoId),
  ]);
  const out: Novidade[] = [];
  const hora = (iso: string) => new Date(iso).toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" });
  const dia = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

  (aulas ?? []).forEach((a) => {
    if (!a.data) return;
    out.push({
      id: a.id,
      tipo: "aula",
      titulo: `Aula ${dia(a.data) === dia(agora.toISOString()) ? "hoje" : "amanhã"} às ${hora(a.data)}${a.tema ? `: ${a.tema}` : ""}`,
      href: "/aluno/plano",
      criadoEm: a.data,
    });
  });

  const limite = new Date(agora.getTime() + 2 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  tarefas
    .filter((t) => !t.concluida && t.prazo && t.prazo <= limite)
    .forEach((t) => {
      out.push({
        id: t.id,
        tipo: "tarefa",
        titulo: `${t.prazo! < agora.toISOString().slice(0, 10) ? "Tarefa atrasada" : "Tarefa para entregar"}: ${t.texto.length > 60 ? `${t.texto.slice(0, 60)}…` : t.texto}`,
        href: "/aluno/plano",
        criadoEm: `${t.prazo}T12:00:00Z`,
      });
    });

  // Missões: nas etapas em que o aluno já concluiu alguma coisa, a Missão ainda não feita.
  type Prog = { material_id: string; concluido: boolean; materiais: { fase_id: string | null } | null };
  const progresso = (feitos ?? []) as unknown as Prog[];
  const concluidos = new Set(progresso.filter((p) => p.concluido).map((p) => p.material_id));
  const fases = [...new Set(progresso.filter((p) => p.concluido && p.materiais?.fase_id).map((p) => p.materiais!.fase_id!))];
  if (fases.length) {
    const turmas = new Set((membros ?? []).map((m) => m.turma_id));
    const { data: missoes } = await supabase
      .from("materiais")
      .select("id, titulo, materia_id, created_at, material_turmas(turma_id)")
      .eq("tipo", "missao")
      .in("fase_id", fases);
    type MRow = { id: string; titulo: string; materia_id: string; created_at: string; material_turmas: { turma_id: string }[] };
    ((missoes ?? []) as unknown as MRow[])
      .filter((m) => !concluidos.has(m.id) && m.material_turmas.some((t) => turmas.has(t.turma_id)))
      .slice(0, 5)
      .forEach((m) => {
        out.push({
          id: m.id,
          tipo: "missao",
          titulo: `Missão para fazer: ${m.titulo.replace(/^Missão Chave · /, "")}`,
          href: `/aluno/materias/${m.materia_id}#material-${m.id}`,
          criadoEm: m.created_at,
        });
      });
  }
  return out;
}
