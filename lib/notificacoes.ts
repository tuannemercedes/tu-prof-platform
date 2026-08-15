import type { createClient } from "@/lib/supabase/server";

export type Novidade = {
  id: string;
  tipo: "material" | "clube" | "planner";
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

  return novidades.sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1));
}
