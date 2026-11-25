"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/dal";
import { hojeISO } from "@/lib/financeiro";

// Tudo aqui é só da admin (RLS: is_admin()).

const txt = (f: FormData, k: string) => String(f.get(k) ?? "").trim() || null;
// Aceita "1.234,56", "1234,56" e "1234.56"
function valor(f: FormData, k: string) {
  const s = String(f.get(k) ?? "").trim().replace(/[R$\s]/g, "");
  if (!s) return null;
  const n = Number(s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}
const inteiro = (f: FormData, k: string) => {
  const n = parseInt(String(f.get(k) ?? ""), 10);
  return Number.isFinite(n) ? n : null;
};
const atualizar = () => {
  revalidatePath("/admin/financeiro");
  revalidatePath("/admin");
};

export async function salvarPlano(formData: FormData) {
  await requireAdmin();
  const id = txt(formData, "id");
  const alunoId = txt(formData, "aluno_id");
  const supabase = await createClient();
  let cliente = txt(formData, "cliente");
  if (!cliente && alunoId) {
    const { data } = await supabase.from("profiles").select("nome, email").eq("id", alunoId).single();
    cliente = data?.nome || data?.email || null;
  }
  const valorMensal = valor(formData, "valor_mensal");
  const inicio = txt(formData, "inicio");
  if (!cliente || valorMensal == null || !inicio) return;
  const continuo = formData.get("continuo") === "1";
  const linha = {
    aluno_id: alunoId,
    cliente,
    produto: txt(formData, "produto"),
    whatsapp: txt(formData, "whatsapp"),
    valor_mensal: valorMensal,
    inicio,
    meses: continuo ? null : inteiro(formData, "meses"),
    dia_vencimento: Math.min(Math.max(inteiro(formData, "dia_vencimento") ?? 10, 1), 28),
    observacoes: txt(formData, "observacoes"),
  };
  const { error } = id ? await supabase.from("planos_alunos").update(linha).eq("id", id) : await supabase.from("planos_alunos").insert(linha);
  if (error) throw new Error("Não foi possível salvar.");
  // Mudou o valor: atualiza as mensalidades ainda não pagas daqui para frente.
  if (id) {
    await supabase
      .from("cobrancas")
      .update({ valor: valorMensal, cliente })
      .eq("plano_id", id)
      .is("pago_em", null)
      .gte("vencimento", hojeISO().slice(0, 8) + "01");
  }
  atualizar();
}

export async function encerrarPlano(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const reabrir = formData.get("reabrir") === "1";
  await supabase
    .from("planos_alunos")
    .update({ encerrado_em: reabrir ? null : txt(formData, "data") ?? hojeISO() })
    .eq("id", String(formData.get("id")));
  atualizar();
}

export async function excluirPlano(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("planos_alunos").delete().eq("id", String(formData.get("id")));
  atualizar();
}

export async function criarCobranca(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const planoId = txt(formData, "plano_id");
  let cliente = txt(formData, "cliente");
  if (planoId && !cliente) {
    const { data } = await supabase.from("planos_alunos").select("cliente").eq("id", planoId).single();
    cliente = data?.cliente ?? null;
  }
  const v = valor(formData, "valor");
  const vencimento = txt(formData, "vencimento");
  if (!cliente || v == null || !vencimento) return;
  const { error } = await supabase.from("cobrancas").insert({
    plano_id: planoId,
    cliente,
    descricao: txt(formData, "descricao") ?? "Cobrança avulsa",
    valor: v,
    vencimento,
    observacoes: txt(formData, "observacoes"),
  });
  if (error) throw new Error("Não foi possível salvar.");
  atualizar();
}

export async function marcarPago(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = String(formData.get("id"));
  if (formData.get("desfazer") === "1") {
    await supabase.from("cobrancas").update({ pago_em: null, valor_pago: null, forma: null }).eq("id", id);
  } else {
    await supabase
      .from("cobrancas")
      .update({ pago_em: txt(formData, "pago_em") ?? hojeISO(), valor_pago: valor(formData, "valor_pago"), forma: txt(formData, "forma") })
      .eq("id", id);
  }
  atualizar();
}

export async function excluirCobranca(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("cobrancas").delete().eq("id", String(formData.get("id")));
  atualizar();
}

export async function salvarDespesa(formData: FormData) {
  await requireAdmin();
  const v = valor(formData, "valor");
  const descricao = txt(formData, "descricao");
  if (!descricao || v == null) return;
  const supabase = await createClient();
  const { error } = await supabase.from("despesas").insert({
    descricao,
    categoria: txt(formData, "categoria") ?? "Outros",
    valor: v,
    data: txt(formData, "data") ?? hojeISO(),
    observacoes: txt(formData, "observacoes"),
  });
  if (error) throw new Error("Não foi possível salvar.");
  atualizar();
}

export async function excluirDespesa(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("despesas").delete().eq("id", String(formData.get("id")));
  atualizar();
}

export async function salvarDas(formData: FormData) {
  await requireAdmin();
  const competencia = `${String(formData.get("mes"))}-01`;
  const supabase = await createClient();
  if (formData.get("desfazer") === "1") {
    await supabase.from("das_mei").update({ pago_em: null }).eq("competencia", competencia);
  } else {
    await supabase
      .from("das_mei")
      .upsert({ competencia, valor: valor(formData, "valor") ?? 0, pago_em: txt(formData, "pago_em") ?? hojeISO() }, { onConflict: "competencia" });
  }
  atualizar();
}

export async function salvarConfigFinanceiro(formData: FormData) {
  await requireAdmin();
  const config = {
    limite_mei: valor(formData, "limite_mei") ?? 81000,
    pro_labore: valor(formData, "pro_labore") ?? 0,
    reserva_pct: valor(formData, "reserva_pct") ?? 10,
    das_valor: valor(formData, "das_valor") ?? 0,
  };
  const supabase = await createClient();
  await supabase.from("configuracoes").upsert({ chave: "financeiro", valor: JSON.stringify(config) }, { onConflict: "chave" });
  atualizar();
}
