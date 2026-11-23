import type { createClient } from "@/lib/supabase/server";
import { diaISO } from "@/lib/datas";

type Supa = Awaited<ReturnType<typeof createClient>>;

export type Contrato = {
  id: string;
  descricao: string | null;
  idioma: string;
  valor_mensal: number | null;
  max_acessos: number | null;
  aulas_mes: number | null;
  inicio: string | null;
  fim: string | null;
  observacoes: string | null;
};

export type Participante = { id: string; nome: string; email: string };

export type AulaGrupo = {
  id: string;
  turmaId: string;
  data: string | null;
  tema: string;
  resumo: string | null;
  status: string;
  presentes: string[]; // ids de quem foi
  temChamada: boolean;
};

export type Grupo = {
  id: string;
  nome: string;
  idioma: string;
  professorId: string | null;
  participantes: Participante[];
  aulas: AulaGrupo[];
};

export type Empresa = {
  id: string;
  nome: string;
  contato_nome: string | null;
  contato_email: string | null;
  contato_telefone: string | null;
  observacoes: string | null;
  contratos: Contrato[];
  grupos: Grupo[];
};

// Contrato que vale hoje (ou o mais recente, se nenhum estiver em vigor).
export function contratoAtual(contratos: Contrato[]) {
  const hoje = diaISO(new Date());
  const vigentes = contratos.filter((c) => (!c.inicio || c.inicio <= hoje) && (!c.fim || c.fim >= hoje));
  const ordem = (a: Contrato, b: Contrato) => ((a.inicio ?? "") < (b.inicio ?? "") ? 1 : -1);
  return [...vigentes].sort(ordem)[0] ?? [...contratos].sort(ordem)[0] ?? null;
}

export function moeda(v: number | null) {
  if (v == null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export function dataCurta(iso: string | null) {
  if (!iso) return "—";
  const [a, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
}

// Frequência: das aulas realizadas com chamada, em quantas a pessoa esteve.
export function frequencia(aulas: AulaGrupo[], alunoId?: string) {
  const comChamada = aulas.filter((a) => a.status === "realizada" && a.temChamada);
  if (!comChamada.length) return null;
  if (alunoId) {
    const foi = comChamada.filter((a) => a.presentes.includes(alunoId)).length;
    return { foi, de: comChamada.length, pct: Math.round((foi / comChamada.length) * 100) };
  }
  const media = comChamada.reduce((s, a) => s + a.presentes.length, 0) / comChamada.length;
  return { media: Math.round(media * 10) / 10, aulas: comChamada.length };
}

export async function getEmpresas(supabase: Supa, empresaId?: string): Promise<Empresa[]> {
  let q = supabase
    .from("empresas")
    .select(
      "id, nome, contato_nome, contato_email, contato_telefone, observacoes, contratos(id, descricao, idioma, valor_mensal, max_acessos, aulas_mes, inicio, fim, observacoes)"
    )
    .order("nome");
  if (empresaId) q = q.eq("id", empresaId);
  const { data: empresas } = await q;
  if (!empresas?.length) return [];

  const ids = empresas.map((e) => e.id);
  const { data: turmas } = await supabase
    .from("turmas")
    .select("id, nome, idioma, professor_id, empresa_id, turma_membros(aluno_id, profiles(id, nome, email))")
    .in("empresa_id", ids)
    .order("nome");
  const turmaIds = (turmas ?? []).map((t) => t.id);
  const [{ data: aulas }, { data: presencas }] = turmaIds.length
    ? await Promise.all([
        supabase
          .from("aulas")
          .select("id, turma_id, data, tema, resumo, status")
          .in("turma_id", turmaIds)
          .order("data", { ascending: true }),
        supabase.from("presencas").select("aula_id, aluno_id, presente"),
      ])
    : [{ data: [] }, { data: [] }];

  const chamada = new Map<string, string[]>();
  (presencas ?? []).forEach((p) => {
    if (!chamada.has(p.aula_id)) chamada.set(p.aula_id, []);
    if (p.presente) chamada.get(p.aula_id)!.push(p.aluno_id);
  });
  const comChamada = new Set((presencas ?? []).map((p) => p.aula_id));

  return empresas.map((e) => ({
    id: e.id,
    nome: e.nome,
    contato_nome: e.contato_nome,
    contato_email: e.contato_email,
    contato_telefone: e.contato_telefone,
    observacoes: e.observacoes,
    contratos: ((e.contratos ?? []) as Contrato[]).map((c) => ({ ...c, valor_mensal: c.valor_mensal == null ? null : Number(c.valor_mensal) })),
    grupos: (turmas ?? [])
      .filter((t) => t.empresa_id === e.id)
      .map((t) => ({
        id: t.id,
        nome: t.nome,
        idioma: t.idioma,
        professorId: t.professor_id,
        participantes: ((t.turma_membros ?? []) as unknown as { profiles: Participante | null }[])
          .map((m) => m.profiles)
          .filter((p): p is Participante => !!p)
          .map((p) => ({ id: p.id, nome: p.nome || p.email, email: p.email }))
          .sort((a, b) => a.nome.localeCompare(b.nome)),
        aulas: (aulas ?? [])
          .filter((a) => a.turma_id === t.id)
          .map((a) => ({
            id: a.id,
            turmaId: t.id,
            data: a.data,
            tema: a.tema,
            resumo: a.resumo,
            status: a.status,
            presentes: chamada.get(a.id) ?? [],
            temChamada: comChamada.has(a.id),
          })),
      })),
  }));
}
