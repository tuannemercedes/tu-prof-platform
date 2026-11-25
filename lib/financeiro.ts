import type { createClient } from "@/lib/supabase/server";
import { diaISO, somarDias } from "@/lib/datas";

type Supa = Awaited<ReturnType<typeof createClient>>;

export const CATEGORIAS_DESPESA = ["Material didático", "Plataforma/Software", "Marketing", "Professores", "Taxas bancárias", "Impostos", "Aluguel", "Outros"];
export const FORMAS_PAGAMENTO = ["Pix", "Transferência", "Cartão", "Boleto", "Dinheiro"];

export type ConfigFinanceiro = { limite_mei: number; pro_labore: number; reserva_pct: number; das_valor: number };
export const CONFIG_PADRAO: ConfigFinanceiro = { limite_mei: 81000, pro_labore: 0, reserva_pct: 10, das_valor: 0 };

export type Plano = {
  id: string;
  aluno_id: string | null;
  cliente: string;
  produto: string | null;
  whatsapp: string | null;
  valor_mensal: number;
  inicio: string;
  meses: number | null;
  dia_vencimento: number;
  observacoes: string | null;
  encerrado_em: string | null;
};

export type Cobranca = {
  id: string;
  plano_id: string | null;
  contrato_id: string | null;
  cliente: string;
  descricao: string;
  valor: number;
  vencimento: string;
  competencia: string | null;
  pago_em: string | null;
  valor_pago: number | null;
  forma: string | null;
  observacoes: string | null;
};

export type Despesa = { id: string; descricao: string; categoria: string; valor: number; data: string; observacoes: string | null };

export const hojeISO = () => diaISO(new Date());
export const mesDe = (iso: string) => iso.slice(0, 7);
export const mesValido = (m?: string) => (m && /^\d{4}-\d{2}$/.test(m) ? m : mesDe(hojeISO()));
export function somarMeses(mes: string, n: number) {
  const [a, m] = mes.split("-").map(Number);
  const d = new Date(Date.UTC(a, m - 1 + n, 1));
  return d.toISOString().slice(0, 7);
}
export const nomeMes = (mes: string, curto = false) => {
  const [a, m] = mes.split("-").map(Number);
  const nome = new Intl.DateTimeFormat("pt-BR", { month: curto ? "short" : "long", timeZone: "UTC" }).format(new Date(Date.UTC(a, m - 1, 15))).replace(".", "");
  return curto ? nome : `${nome} de ${a}`;
};

// Último dia do contrato (null = contínuo).
export function fimDoPlano(p: Pick<Plano, "inicio" | "meses">) {
  if (!p.meses) return null;
  const [a, m, d] = p.inicio.split("-").map(Number);
  const fim = new Date(Date.UTC(a, m - 1 + p.meses, d));
  fim.setUTCDate(fim.getUTCDate() - 1);
  return fim.toISOString().slice(0, 10);
}

export type SituacaoPlano = "ativo" | "vencendo" | "encerrado";
export function situacaoPlano(p: Plano, hoje = hojeISO()): SituacaoPlano {
  const fim = fimDoPlano(p);
  if (p.encerrado_em && p.encerrado_em <= hoje) return "encerrado";
  if (fim && fim < hoje) return "encerrado";
  if (fim && fim <= somarDias(hoje, 30)) return "vencendo";
  return "ativo";
}

export const atrasada = (c: Cobranca, hoje = hojeISO()) => !c.pago_em && c.vencimento < hoje;
export const valorRecebido = (c: Cobranca) => (c.pago_em ? Number(c.valor_pago ?? c.valor) : 0);

export function lerConfig(valor: unknown): ConfigFinanceiro {
  try {
    const v = typeof valor === "string" ? JSON.parse(valor) : valor;
    return { ...CONFIG_PADRAO, ...(v && typeof v === "object" ? v : {}) };
  } catch {
    return CONFIG_PADRAO;
  }
}

// Tudo de um ano, para o painel e para os meses.
export async function getFinanceiro(supabase: Supa, ano: number) {
  await supabase.rpc("gerar_mensalidades");
  const ini = `${ano}-01-01`;
  const fim = `${ano + 1}-01-01`;
  const [{ data: planos }, { data: cobrancas }, { data: despesas }, { data: das }, { data: cfg }, { data: alunos }] = await Promise.all([
    supabase.from("planos_alunos").select("*").order("cliente"),
    // Do ano + qualquer atrasada de antes (para não sumir da vista).
    supabase.from("cobrancas").select("*").or(`and(vencimento.gte.${ini},vencimento.lt.${fim}),and(pago_em.is.null,vencimento.lt.${ini})`).order("vencimento"),
    supabase.from("despesas").select("*").gte("data", ini).lt("data", fim).order("data", { ascending: false }),
    supabase.from("das_mei").select("*").gte("competencia", ini).lt("competencia", fim),
    supabase.from("configuracoes").select("valor").eq("chave", "financeiro").maybeSingle(),
    supabase.from("profiles").select("id, nome, email").eq("role", "aluno").order("nome"),
  ]);
  const num = <T extends Record<string, unknown>>(l: T[] | null, ...k: (keyof T)[]) =>
    (l ?? []).map((x) => ({ ...x, ...Object.fromEntries(k.map((c) => [c, x[c] == null ? null : Number(x[c])])) })) as T[];
  return {
    planos: num((planos ?? []) as Plano[], "valor_mensal"),
    cobrancas: num((cobrancas ?? []) as Cobranca[], "valor", "valor_pago"),
    despesas: num((despesas ?? []) as Despesa[], "valor"),
    das: (das ?? []).map((d) => ({ competencia: d.competencia as string, valor: Number(d.valor), pago_em: d.pago_em as string | null })),
    config: lerConfig(cfg?.valor),
    alunos: (alunos ?? []).filter((a) => !a.email.endsWith(".invalid")),
  };
}
