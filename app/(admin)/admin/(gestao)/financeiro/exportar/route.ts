import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/dal";

// Exporta o financeiro: pagamentos ou despesas do ano em .csv (abre no Excel/Sheets) ou backup completo em .json.
const cel = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const br = (n: unknown) => (n == null || n === "" ? "" : Number(n).toFixed(2).replace(".", ","));
const dataBr = (d: unknown) => (d ? String(d).slice(0, 10).split("-").reverse().join("/") : "");

function csv(linhas: unknown[][]) {
  // ; e BOM: o Excel em português abre direto com acentos e colunas certas.
  return "﻿" + linhas.map((l) => l.map(cel).join(";")).join("\r\n");
}

export async function GET(req: Request) {
  const eu = await getProfile();
  if (eu?.role !== "admin") return new Response("não autorizado", { status: 401 });
  const url = new URL(req.url);
  const tipo = url.searchParams.get("tipo") ?? "csv";
  const ano = Number(url.searchParams.get("ano")) || new Date().getFullYear();
  const supabase = await createClient();

  if (tipo === "json") {
    const [planos, cobrancas, despesas, das] = await Promise.all([
      supabase.from("planos_alunos").select("*"),
      supabase.from("cobrancas").select("*"),
      supabase.from("despesas").select("*"),
      supabase.from("das_mei").select("*"),
    ]);
    const corpo = JSON.stringify(
      { exportado_em: new Date().toISOString(), planos: planos.data, cobrancas: cobrancas.data, despesas: despesas.data, das_mei: das.data },
      null,
      2
    );
    return new Response(corpo, {
      headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="tuprof-financeiro-backup-${new Date().toISOString().slice(0, 10)}.json"` },
    });
  }

  const ini = `${ano}-01-01`;
  const fim = `${ano + 1}-01-01`;
  if (tipo === "despesas") {
    const { data } = await supabase.from("despesas").select("*").gte("data", ini).lt("data", fim).order("data");
    const corpo = csv([["Data", "Descrição", "Categoria", "Valor (R$)", "Observações"], ...(data ?? []).map((d) => [dataBr(d.data), d.descricao, d.categoria, br(d.valor), d.observacoes])]);
    return new Response(corpo, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="tuprof-despesas-${ano}.csv"` } });
  }

  const { data } = await supabase.from("cobrancas").select("*").gte("vencimento", ini).lt("vencimento", fim).order("vencimento");
  const corpo = csv([
    ["Vencimento", "Cliente", "Descrição", "Valor (R$)", "Situação", "Recebido em", "Valor recebido (R$)", "Forma", "Observações"],
    ...(data ?? []).map((c) => [
      dataBr(c.vencimento),
      c.cliente,
      c.descricao,
      br(c.valor),
      c.pago_em ? "Pago" : "Em aberto",
      dataBr(c.pago_em),
      c.pago_em ? br(c.valor_pago ?? c.valor) : "",
      c.forma,
      c.observacoes,
    ]),
  ]);
  return new Response(corpo, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="tuprof-pagamentos-${ano}.csv"` } });
}
