import type { createClient } from "@/lib/supabase/server";
import { lerCompetencias } from "@/lib/evolucao";

type Supa = Awaited<ReturnType<typeof createClient>>;

// Dados do relatório mensal de um aluno. "mes" no formato AAAA-MM.
// Funciona com a sessão da equipe (vê tudo do aluno) ou do próprio aluno (RLS).

export function mesValido(m?: string | null) {
  return m && /^\d{4}-\d{2}$/.test(m) ? m : null;
}
export function mesAtual() {
  const d = new Date(Date.now() - 3 * 3600 * 1000);
  return d.toISOString().slice(0, 7);
}
export function mesAnterior(m: string) {
  const [a, mm] = m.split("-").map(Number);
  const d = new Date(Date.UTC(a, mm - 2, 1));
  return d.toISOString().slice(0, 7);
}
export function proximoMes(m: string) {
  const [a, mm] = m.split("-").map(Number);
  return new Date(Date.UTC(a, mm, 1)).toISOString().slice(0, 7);
}
export function nomeDoMes(m: string) {
  const [a, mm] = m.split("-").map(Number);
  const nome = new Intl.DateTimeFormat("pt-BR", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(a, mm - 1, 15)));
  return `${nome} de ${a}`;
}

export type RelatorioAluno = Awaited<ReturnType<typeof getRelatorioAluno>>;

export async function getRelatorioAluno(supabase: Supa, alunoId: string, mes: string) {
  const ini = `${mes}-01T03:00:00Z`;
  const fim = `${proximoMes(mes)}-01T03:00:00Z`;
  const diaIni = `${mes}-01`;
  const diaFim = `${proximoMes(mes)}-01`;

  const [{ data: aluno }, { data: membros }] = await Promise.all([
    supabase.from("profiles").select("id, nome, email, objetivo").eq("id", alunoId).maybeSingle(),
    supabase.from("turma_membros").select("turma_id, turmas(nome, empresa_id)").eq("aluno_id", alunoId),
  ]);
  const turmas = (membros ?? []).map((m) => m.turma_id as string);
  const programas = (membros ?? [])
    .map((m) => (m.turmas as unknown as { nome: string } | null)?.nome)
    .filter(Boolean) as string[];
  const filtro = turmas.length ? `aluno_id.eq.${alunoId},turma_id.in.(${turmas.join(",")})` : `aluno_id.eq.${alunoId}`;

  const [{ data: aulas }, { data: presencas }, { data: tarefas }, { data: entregas }, { data: checkpoints }, { data: cfg }, { data: relatorio }, { data: certificados }] =
    await Promise.all([
      supabase.from("aulas").select("id, data, tema, resumo, status, aluno_id, turma_id").or(filtro).gte("data", ini).lt("data", fim).order("data"),
      supabase.from("presencas").select("aula_id, presente").eq("aluno_id", alunoId),
      supabase.from("tarefas").select("id, texto, prazo, created_at").or(filtro).or(`and(prazo.gte.${diaIni},prazo.lt.${diaFim}),and(prazo.is.null,created_at.gte.${ini},created_at.lt.${fim})`).order("prazo"),
      supabase.from("tarefa_entregas").select("tarefa_id, concluida, resposta, arquivo_path, comentario").eq("aluno_id", alunoId),
      supabase.from("checkpoints").select("data, titulo, niveis, comentario").eq("aluno_id", alunoId).lt("data", diaFim).order("data"),
      supabase.from("configuracoes").select("valor").eq("chave", "competencias").maybeSingle(),
      supabase.from("relatorios_mensais").select("id, comentario, publicado_em").eq("aluno_id", alunoId).eq("mes", diaIni).maybeSingle(),
      supabase.from("certificados").select("codigo, titulo").eq("aluno_id", alunoId).gte("emitido_em", diaIni).lt("emitido_em", diaFim),
    ]);

  const presenca = new Map((presencas ?? []).map((p) => [p.aula_id, p.presente]));
  const realizadas = (aulas ?? []).filter((a) => a.status === "realizada");
  // Aula de grupo conta se a pessoa estava presente (ou se não houve chamada).
  const minhas = realizadas.filter((a) => a.aluno_id === alunoId || presenca.get(a.id) !== false);
  const faltas = realizadas.filter((a) => a.turma_id && presenca.get(a.id) === false).length;

  const entregaDe = new Map((entregas ?? []).map((e) => [e.tarefa_id, e]));
  const listaTarefas = (tarefas ?? []).map((t) => {
    const e = entregaDe.get(t.id);
    return { id: t.id, texto: t.texto, prazo: t.prazo, feita: !!e?.concluida, comentario: e?.comentario ?? null };
  });

  const cps = checkpoints ?? [];
  const primeiro = cps[0];
  const ultimo = cps[cps.length - 1];
  const competencias = lerCompetencias(cfg?.valor);
  const evolucao =
    primeiro && ultimo
      ? competencias.map((c) => ({
          competencia: c,
          inicio: Number((primeiro.niveis as Record<string, number>)?.[c] ?? 0) || null,
          agora: Number((ultimo.niveis as Record<string, number>)?.[c] ?? 0) || null,
        }))
      : [];
  const checkpointDoMes = cps.filter((c) => c.data >= diaIni && c.data < diaFim).pop() ?? null;

  return {
    mes,
    aluno: aluno ? { id: aluno.id, nome: aluno.nome || aluno.email, objetivo: aluno.objetivo } : null,
    programas,
    aulas: minhas.map((a) => ({ id: a.id, data: a.data!, tema: a.tema, resumo: a.resumo, grupo: !!a.turma_id })),
    faltas,
    agendadas: (aulas ?? []).filter((a) => a.status === "agendada").length,
    tarefas: listaTarefas,
    evolucao,
    desdeCheckpoint: primeiro?.data ?? null,
    checkpointDoMes,
    relatorio: relatorio ?? null,
    certificados: certificados ?? [],
  };
}
