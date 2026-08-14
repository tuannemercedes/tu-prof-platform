import type { createClient } from "@/lib/supabase/server";

export type CronogramaItem = {
  id: string;
  data: string | null;
  tema: string;
  descricao: string | null;
};

// Usado nas páginas de admin (preview "ver como aluno") — o admin bypassa a
// RLS de cronograma_itens, então filtramos por acesso na aplicação, igual
// já fazemos pra materiais.
export async function getCronogramaItensParaAluno(
  supabase: Awaited<ReturnType<typeof createClient>>,
  alunoId: string
): Promise<CronogramaItem[]> {
  const [{ data: turmaMembros }, { data: rows }] = await Promise.all([
    supabase.from("turma_membros").select("turma_id").eq("aluno_id", alunoId),
    supabase
      .from("cronograma_itens")
      .select(
        "id, data, tema, descricao, cronogramas!inner(cronograma_turmas(turma_id), cronograma_alunos(aluno_id))"
      )
      .order("data"),
  ]);

  const turmaIdsDoAluno = new Set((turmaMembros ?? []).map((t) => t.turma_id));

  type Row = CronogramaItem & {
    cronogramas: {
      cronograma_turmas: { turma_id: string }[];
      cronograma_alunos: { aluno_id: string }[];
    } | null;
  };

  return ((rows ?? []) as unknown as Row[])
    .filter((row) => {
      const c = row.cronogramas;
      if (!c) return false;
      const viaTurma = c.cronograma_turmas.some((ct) => turmaIdsDoAluno.has(ct.turma_id));
      const viaAluno = c.cronograma_alunos.some((ca) => ca.aluno_id === alunoId);
      return viaTurma || viaAluno;
    })
    .map((row) => ({ id: row.id, data: row.data, tema: row.tema, descricao: row.descricao }));
}

export function calcularJornada(itens: CronogramaItem[]) {
  const total = itens.length;
  if (total === 0) return { total: 0, semanaAtual: 0, proximaAula: null as CronogramaItem | null };

  const hoje = new Date().toISOString().slice(0, 10);
  const comData = itens.filter((i) => i.data);

  const semanaAtual = Math.min(
    Math.max(comData.filter((i) => i.data! <= hoje).length, 1),
    total
  );

  const proximaAula =
    comData
      .filter((i) => i.data! >= hoje)
      .sort((a, b) => (a.data! < b.data! ? -1 : 1))[0] ?? null;

  return { total, semanaAtual, proximaAula };
}
