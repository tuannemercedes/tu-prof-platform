import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { dataCurta, moeda } from "@/lib/empresas";
import SubmitButton from "@/components/submit-button";
import ConfirmarExclusao from "@/components/confirmar-exclusao";
import {
  CATEGORIAS_DESPESA,
  FORMAS_PAGAMENTO,
  atrasada,
  fimDoPlano,
  getFinanceiro,
  hojeISO,
  mesDe,
  mesValido,
  nomeMes,
  situacaoPlano,
  somarMeses,
  valorRecebido,
  type Cobranca,
  type Plano,
} from "@/lib/financeiro";
import {
  criarCobranca,
  encerrarPlano,
  excluirCobranca,
  excluirDespesa,
  excluirPlano,
  marcarPago,
  salvarConfigFinanceiro,
  salvarDas,
  salvarDespesa,
  salvarPlano,
} from "./actions";

const card = "bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-5 flex flex-col gap-3.5";
const h2 = "m-0 font-serif font-semibold text-[24px]";
const campo = "h-[42px] rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[15px] font-normal";
const rotulo = "flex flex-col gap-1.5 text-[13px] font-semibold";
const botao = "h-[42px] px-4 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold text-sm whitespace-nowrap";
const botaoLinha = "h-9 px-3 rounded-lg border border-[var(--border-strong)] text-[13px] font-semibold hover:bg-[var(--surface-2)]";

const ABAS = [
  { v: "painel", l: "Visão geral" },
  { v: "cobrancas", l: "Cobranças" },
  { v: "contratos", l: "Contratos" },
  { v: "despesas", l: "Despesas" },
  { v: "ajustes", l: "Ajustes e backup" },
];

const ROTULO_SITUACAO = { ativo: "Ativo", vencendo: "Vence em breve", encerrado: "Encerrado" };
const COR_SITUACAO = {
  ativo: "bg-[var(--success-bg)] text-[var(--success-text)]",
  vencendo: "bg-[var(--warning-bg)] text-[var(--gold-text)]",
  encerrado: "bg-[var(--surface-3)] text-[var(--text-secondary)]",
};

const soma = (l: number[]) => l.reduce((s, v) => s + v, 0);

export default async function FinanceiroPage({ searchParams }: { searchParams: Promise<{ aba?: string; mes?: string; filtro?: string }> }) {
  const { aba = "painel", mes: mesParam, filtro = "ativos" } = await searchParams;
  const mes = mesValido(mesParam);
  const ano = Number(mes.slice(0, 4));
  const hoje = hojeISO();
  const supabase = await createClient();
  const f = await getFinanceiro(supabase, ano);
  const { planos, cobrancas, despesas, das, config, alunos } = f;

  const doMes = (m: string) => cobrancas.filter((c) => mesDe(c.vencimento) === m);
  const despesasDoMes = (m: string) => soma(despesas.filter((d) => mesDe(d.data) === m).map((d) => d.valor));
  const atrasadas = cobrancas.filter((c) => atrasada(c, hoje));
  const vencendo = planos.filter((p) => situacaoPlano(p, hoje) === "vencendo");
  const link = (extra: Record<string, string>) => `/admin/financeiro?${new URLSearchParams({ aba, mes, ...extra })}`;

  // Faturamento do ano (pelo dia em que o dinheiro entrou), para o limite do MEI.
  const recebidoAno = soma(cobrancas.filter((c) => c.pago_em?.startsWith(String(ano))).map(valorRecebido));
  const mesesPassados = ano === Number(hoje.slice(0, 4)) ? Number(hoje.slice(5, 7)) : 12;
  const projecao = mesesPassados ? (recebidoAno / mesesPassados) * 12 : 0;
  const pctMei = config.limite_mei ? Math.min(100, (recebidoAno / config.limite_mei) * 100) : 0;

  const meses = Array.from({ length: 12 }, (_, i) => `${ano}-${String(i + 1).padStart(2, "0")}`);
  const linhaMes = (m: string) => {
    const l = doMes(m);
    const previsto = soma(l.map((c) => c.valor));
    const recebido = soma(l.map(valorRecebido));
    const atrasado = soma(l.filter((c) => atrasada(c, hoje)).map((c) => c.valor));
    const desp = despesasDoMes(m);
    const dasMes = das.find((d) => d.competencia.startsWith(m));
    return { m, previsto, recebido, atrasado, desp, das: dasMes?.pago_em ? dasMes.valor : 0, resultado: recebido - desp - (dasMes?.pago_em ? dasMes.valor : 0) };
  };
  const atual = linhaMes(mes);
  const dasAtual = das.find((d) => d.competencia.startsWith(mes));
  const reserva = Math.max(0, (atual.recebido * config.reserva_pct) / 100);
  const sobra = atual.recebido - atual.desp - (dasAtual?.valor ?? config.das_valor) - config.pro_labore - reserva;

  const navMes = (
    <div className="flex items-center gap-2">
      <Link href={link({ mes: somarMeses(mes, -1) })} className={botaoLinha + " flex items-center"} aria-label="Mês anterior">
        ←
      </Link>
      <span className="font-serif text-[22px] font-semibold capitalize min-w-[190px] text-center">{nomeMes(mes)}</span>
      <Link href={link({ mes: somarMeses(mes, 1) })} className={botaoLinha + " flex items-center"} aria-label="Próximo mês">
        →
      </Link>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="m-0 font-serif font-semibold text-[40px] leading-[1.05]">Financeiro</h1>
        <p className="m-0 text-[15px] text-[var(--text-secondary)]">Contratos e mensalidades, despesas e o limite do MEI. Só você vê esta área.</p>
      </div>

      <nav aria-label="Seções do financeiro" className="flex gap-1.5 border-b border-[var(--border)] overflow-x-auto">
        {ABAS.map((a) => (
          <Link
            key={a.v}
            href={`/admin/financeiro?aba=${a.v}&mes=${mes}`}
            aria-current={aba === a.v ? "page" : undefined}
            className={`px-3.5 h-11 flex items-center text-sm border-b-2 -mb-px whitespace-nowrap ${
              aba === a.v ? "border-[var(--gold)] font-semibold" : "border-transparent text-[var(--text-secondary)]"
            }`}
          >
            {a.l}
            {a.v === "cobrancas" && atrasadas.length > 0 && (
              <span className="ml-1.5 text-[11px] rounded-full px-1.5 bg-[var(--danger-text)] text-white">{atrasadas.length}</span>
            )}
          </Link>
        ))}
      </nav>

      {aba === "painel" && (
        <>
          {navMes}
          <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(170px,1fr))]">
            {[
              { v: atual.previsto, l: "Previsto no mês" },
              { v: atual.recebido, l: "Recebido" },
              { v: soma(atrasadas.map((c) => c.valor)), l: "Em atraso (total)", alerta: atrasadas.length > 0 },
              { v: atual.desp, l: "Despesas do mês" },
            ].map((k) => (
              <div key={k.l} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-[18px] flex flex-col gap-1.5">
                <span className={`font-serif text-[30px] font-semibold leading-none ${k.alerta ? "text-[var(--danger-text)]" : ""}`}>{moeda(k.v)}</span>
                <span className="text-sm text-[var(--text-secondary)]">{k.l}</span>
              </div>
            ))}
          </div>

          <div className="grid gap-5 items-start [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
            <section className={card}>
              <h2 className={h2}>Para onde vai o dinheiro</h2>
              <p className="m-0 text-sm text-[var(--text-secondary)]">
                Empresa e salário separados: o que entrou em {nomeMes(mes)}, menos os custos, dividido pela regra dos Ajustes.
              </p>
              <dl className="m-0 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-[15px]">
                <dt>Recebido</dt>
                <dd className="m-0 text-right font-semibold">{moeda(atual.recebido)}</dd>
                <dt className="text-[var(--text-secondary)]">− Despesas</dt>
                <dd className="m-0 text-right">{moeda(atual.desp)}</dd>
                <dt className="text-[var(--text-secondary)]">− DAS do MEI</dt>
                <dd className="m-0 text-right">{moeda(dasAtual?.valor ?? config.das_valor)}</dd>
                <dt className="text-[var(--text-secondary)]">− Seu pró-labore</dt>
                <dd className="m-0 text-right">{moeda(config.pro_labore)}</dd>
                <dt className="text-[var(--text-secondary)]">− Reserva ({config.reserva_pct}% do recebido)</dt>
                <dd className="m-0 text-right">{moeda(reserva)}</dd>
                <dt className="font-semibold pt-2 border-t border-[var(--border-soft)]">Fica na empresa para reinvestir</dt>
                <dd className={`m-0 text-right font-semibold pt-2 border-t border-[var(--border-soft)] ${sobra < 0 ? "text-[var(--danger-text)]" : ""}`}>{moeda(sobra)}</dd>
              </dl>
              {config.pro_labore === 0 && (
                <p className="m-0 text-xs text-[var(--text-secondary)]">
                  Defina seu pró-labore fixo em <Link href="/admin/financeiro?aba=ajustes" className="underline">Ajustes</Link>.
                </p>
              )}
            </section>

            <section className={card}>
              <h2 className={h2}>MEI em {ano}</h2>
              <div className="flex flex-col gap-1.5">
                <div className="h-3 rounded-full bg-[var(--surface-3)] overflow-hidden">
                  <div className={`h-full ${pctMei > 85 ? "bg-[var(--danger-text)]" : "bg-[var(--gold)]"}`} style={{ width: `${pctMei}%` }} />
                </div>
                <span className="text-sm">
                  <b>{moeda(recebidoAno)}</b> de {moeda(config.limite_mei)} ({pctMei.toFixed(0)}%)
                </span>
                <span className="text-[13px] text-[var(--text-secondary)]">
                  No ritmo atual, o ano fecha em cerca de {moeda(projecao)}.
                  {projecao > config.limite_mei ? " Passa do limite: vale conversar com a contadora sobre a mudança de enquadramento." : ""}
                </span>
              </div>
              <div className="flex flex-col gap-2 pt-3 border-t border-[var(--border-soft)]">
                <span className="text-[13px] font-semibold">DAS de {nomeMes(mes)}</span>
                {dasAtual?.pago_em ? (
                  <form action={salvarDas} className="flex items-center gap-3 text-sm">
                    <input type="hidden" name="mes" value={mes} />
                    <input type="hidden" name="desfazer" value="1" />
                    <span className="text-[var(--success-text)] font-semibold">
                      ✓ Pago em {dataCurta(dasAtual.pago_em)} · {moeda(dasAtual.valor)}
                    </span>
                    <button type="submit" className="text-xs underline text-[var(--text-secondary)]">
                      Desfazer
                    </button>
                  </form>
                ) : (
                  <form action={salvarDas} className="flex flex-wrap items-end gap-2">
                    <input type="hidden" name="mes" value={mes} />
                    <label className={rotulo}>
                      Valor
                      <input name="valor" defaultValue={config.das_valor ? String(config.das_valor).replace(".", ",") : ""} required inputMode="decimal" className={`${campo} w-28`} />
                    </label>
                    <label className={rotulo}>
                      Pago em
                      <input type="date" name="pago_em" defaultValue={hoje} className={campo} />
                    </label>
                    <SubmitButton className={botao} pendingText="Salvando..." savedText="✓ Pago">
                      Marcar como pago
                    </SubmitButton>
                  </form>
                )}
              </div>
            </section>

            <section className={card}>
              <h2 className={h2}>Atenção</h2>
              {atrasadas.length === 0 && vencendo.length === 0 && <p className="m-0 text-sm text-[var(--text-secondary)]">Nada pendente. Tudo em dia.</p>}
              {atrasadas.map((c) => (
                <Link key={c.id} href={`/admin/financeiro?aba=cobrancas&mes=${mesDe(c.vencimento)}`} className="flex gap-3 items-center p-3 rounded-xl bg-[var(--surface-2)]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-[var(--danger-text)]" />
                  <span className="flex-1 flex flex-col">
                    <span className="text-[15px] font-semibold">
                      {c.cliente} · {moeda(c.valor)}
                    </span>
                    <span className="text-[13px] text-[var(--text-secondary)]">
                      {c.descricao} · venceu em {dataCurta(c.vencimento)}
                    </span>
                  </span>
                </Link>
              ))}
              {vencendo.map((p) => (
                <Link key={p.id} href="/admin/financeiro?aba=contratos&filtro=vencendo" className="flex gap-3 items-center p-3 rounded-xl bg-[var(--surface-2)]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-[var(--gold)]" />
                  <span className="flex-1 flex flex-col">
                    <span className="text-[15px] font-semibold">Contrato de {p.cliente} vence em {dataCurta(fimDoPlano(p))}</span>
                    <span className="text-[13px] text-[var(--text-secondary)]">Hora de conversar sobre a renovação.</span>
                  </span>
                </Link>
              ))}
            </section>
          </div>

          <section className={card}>
            <h2 className={h2}>Ano de {ano}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse min-w-[640px]">
                <thead>
                  <tr className="text-left text-[13px] text-[var(--text-secondary)]">
                    {["Mês", "Previsto", "Recebido", "Em atraso", "Despesas", "DAS", "Resultado"].map((t) => (
                      <th key={t} className={`py-2 font-semibold ${t === "Mês" ? "" : "text-right"}`}>
                        {t}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {meses.map(linhaMes).map((l) => (
                    <tr key={l.m} className={`border-t border-[var(--border-soft)] ${l.m === mes ? "bg-[var(--surface-2)]" : ""}`}>
                      <td className="py-2 capitalize">
                        <Link href={`/admin/financeiro?aba=cobrancas&mes=${l.m}`} className="underline-offset-2 hover:underline">
                          {nomeMes(l.m, true)}
                        </Link>
                      </td>
                      <td className="py-2 text-right">{l.previsto ? moeda(l.previsto) : "—"}</td>
                      <td className="py-2 text-right">{l.recebido ? moeda(l.recebido) : "—"}</td>
                      <td className={`py-2 text-right ${l.atrasado ? "text-[var(--danger-text)] font-semibold" : ""}`}>{l.atrasado ? moeda(l.atrasado) : "—"}</td>
                      <td className="py-2 text-right">{l.desp ? moeda(l.desp) : "—"}</td>
                      <td className="py-2 text-right">{l.das ? moeda(l.das) : "—"}</td>
                      <td className={`py-2 text-right font-semibold ${l.resultado < 0 ? "text-[var(--danger-text)]" : ""}`}>{l.recebido || l.desp ? moeda(l.resultado) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {aba === "cobrancas" && (
        <div className="grid gap-5 items-start [grid-template-columns:repeat(auto-fit,minmax(340px,1fr))]">
          <div className="flex flex-col gap-5">
            {navMes}
            {atrasadas.filter((c) => mesDe(c.vencimento) !== mes).length > 0 && (
              <section className="rounded-[18px] border border-[var(--danger-text)] p-5 flex flex-col gap-2">
                <h2 className="m-0 font-serif font-semibold text-[20px] text-[var(--danger-text)]">Em atraso de outros meses</h2>
                {atrasadas
                  .filter((c) => mesDe(c.vencimento) !== mes)
                  .map((c) => (
                    <LinhaCobranca key={c.id} c={c} hoje={hoje} />
                  ))}
              </section>
            )}
            <section className={card}>
              <h2 className={h2}>Cobranças de {nomeMes(mes)}</h2>
              {doMes(mes).length ? (
                doMes(mes).map((c) => <LinhaCobranca key={c.id} c={c} hoje={hoje} />)
              ) : (
                <p className="m-0 text-sm text-[var(--text-secondary)]">Nenhuma cobrança neste mês. As mensalidades aparecem sozinhas para os contratos ativos.</p>
              )}
              <p className="m-0 text-sm pt-2 border-t border-[var(--border-soft)]">
                Previsto <b>{moeda(atual.previsto)}</b> · Recebido <b>{moeda(atual.recebido)}</b>
              </p>
            </section>
          </div>
          <form action={criarCobranca} className={card}>
            <h2 className={h2}>Cobrança avulsa</h2>
            <p className="m-0 text-sm text-[var(--text-secondary)]">Material, aula extra, taxa de matrícula, um workshop... Mensalidades não precisam: entram sozinhas.</p>
            <label className={rotulo}>
              De quem
              <select name="plano_id" className={campo} defaultValue="">
                <option value="">Outra pessoa (escreva abaixo)</option>
                {planos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.cliente}
                    {p.produto ? ` · ${p.produto}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <input name="cliente" placeholder="Nome (se não estiver na lista)" aria-label="Nome" className={campo} />
            <input name="descricao" required placeholder="O que é (ex.: workshop de apresentações)" aria-label="Descrição" className={campo} />
            <div className="flex flex-wrap gap-2">
              <label className={rotulo}>
                Valor (R$)
                <input name="valor" required inputMode="decimal" placeholder="0,00" className={`${campo} w-32`} />
              </label>
              <label className={rotulo}>
                Vencimento
                <input type="date" name="vencimento" required defaultValue={hoje} className={campo} />
              </label>
            </div>
            <input name="observacoes" placeholder="Observações (opcional)" aria-label="Observações" className={campo} />
            <div>
              <SubmitButton className={botao} pendingText="Salvando..." savedText="✓ Criada">
                Criar cobrança
              </SubmitButton>
            </div>
          </form>
        </div>
      )}

      {aba === "contratos" && (
        <div className="grid gap-5 items-start [grid-template-columns:repeat(auto-fit,minmax(340px,1fr))]">
          <section className={card}>
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <h2 className={h2}>Contratos</h2>
              <div role="group" aria-label="Filtrar" className="flex gap-1 bg-[var(--surface-3)] rounded-xl p-1">
                {[
                  ["ativos", "Ativos"],
                  ["vencendo", "Vencendo"],
                  ["encerrados", "Encerrados"],
                  ["todos", "Todos"],
                ].map(([v, l]) => (
                  <Link
                    key={v}
                    href={`/admin/financeiro?aba=contratos&filtro=${v}`}
                    aria-current={filtro === v ? "page" : undefined}
                    className={`h-8 px-2.5 rounded-lg text-[13px] flex items-center ${filtro === v ? "bg-[var(--surface)] font-semibold shadow-sm" : "text-[var(--text-secondary)]"}`}
                  >
                    {l}
                  </Link>
                ))}
              </div>
            </div>
            {(() => {
              const lista = planos.filter((p) => {
                const s = situacaoPlano(p, hoje);
                if (filtro === "ativos") return s !== "encerrado";
                if (filtro === "vencendo") return s === "vencendo";
                if (filtro === "encerrados") return s === "encerrado";
                return true;
              });
              if (!lista.length) return <p className="m-0 text-sm text-[var(--text-secondary)]">Nenhum contrato aqui.</p>;
              return lista.map((p) => <LinhaPlano key={p.id} p={p} hoje={hoje} alunos={alunos} />);
            })()}
            <p className="m-0 text-sm pt-2 border-t border-[var(--border-soft)]">
              Receita mensal recorrente: <b>{moeda(soma(planos.filter((p) => situacaoPlano(p, hoje) !== "encerrado").map((p) => p.valor_mensal)))}</b>
            </p>
          </section>
          <section className={card}>
            <h2 className={h2}>Novo contrato</h2>
            <FormPlano alunos={alunos} />
          </section>
        </div>
      )}

      {aba === "despesas" && (
        <div className="grid gap-5 items-start [grid-template-columns:repeat(auto-fit,minmax(340px,1fr))]">
          <section className={card}>
            <h2 className={h2}>Despesas de {ano}</h2>
            {despesas.length ? (
              despesas.map((d) => (
                <div key={d.id} className="flex items-start gap-3 py-2 border-t border-[var(--border-soft)]">
                  <span className="flex-1 flex flex-col">
                    <span className="text-[15px] font-semibold">{d.descricao}</span>
                    <span className="text-[13px] text-[var(--text-secondary)]">
                      {dataCurta(d.data)} · {d.categoria}
                      {d.observacoes ? ` · ${d.observacoes}` : ""}
                    </span>
                  </span>
                  <span className="text-[15px] font-semibold">{moeda(d.valor)}</span>
                  <form action={excluirDespesa}>
                    <input type="hidden" name="id" value={d.id} />
                    <ConfirmarExclusao rotulo="×" aviso="Excluir esta despesa?" />
                  </form>
                </div>
              ))
            ) : (
              <p className="m-0 text-sm text-[var(--text-secondary)]">Nenhuma despesa lançada neste ano.</p>
            )}
            <div className="pt-2 border-t border-[var(--border-soft)] flex flex-col gap-1 text-sm">
              <b>Total no ano: {moeda(soma(despesas.map((d) => d.valor)))}</b>
              {CATEGORIAS_DESPESA.map((c) => {
                const t = soma(despesas.filter((d) => d.categoria === c).map((d) => d.valor));
                return t ? (
                  <span key={c} className="text-[var(--text-secondary)]">
                    {c}: {moeda(t)}
                  </span>
                ) : null;
              })}
            </div>
          </section>
          <form action={salvarDespesa} className={card}>
            <h2 className={h2}>Nova despesa</h2>
            <input name="descricao" required placeholder="Ex.: Canva, anúncio no LinkedIn" aria-label="Descrição" className={campo} />
            <div className="flex flex-wrap gap-2">
              <label className={rotulo}>
                Categoria
                <select name="categoria" className={campo}>
                  {CATEGORIAS_DESPESA.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className={rotulo}>
                Valor (R$)
                <input name="valor" required inputMode="decimal" placeholder="0,00" className={`${campo} w-32`} />
              </label>
              <label className={rotulo}>
                Data
                <input type="date" name="data" defaultValue={hoje} className={campo} />
              </label>
            </div>
            <input name="observacoes" placeholder="Observações (opcional)" aria-label="Observações" className={campo} />
            <div>
              <SubmitButton className={botao} pendingText="Salvando..." savedText="✓ Lançada">
                Lançar despesa
              </SubmitButton>
            </div>
          </form>
        </div>
      )}

      {aba === "ajustes" && (
        <div className="grid gap-5 items-start [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
          <form action={salvarConfigFinanceiro} className={card}>
            <h2 className={h2}>Regras do dinheiro</h2>
            <p className="m-0 text-sm text-[var(--text-secondary)]">
              Seu salário é o pró-labore fixo: o resto do que entra fica na empresa. A reserva é um colchão para meses fracos e impostos.
            </p>
            {[
              { n: "pro_labore", l: "Pró-labore mensal (R$)", v: config.pro_labore },
              { n: "reserva_pct", l: "Reserva (% do recebido)", v: config.reserva_pct },
              { n: "das_valor", l: "Valor do DAS do MEI (R$)", v: config.das_valor },
              { n: "limite_mei", l: "Limite anual do MEI (R$)", v: config.limite_mei },
            ].map((c) => (
              <label key={c.n} className={rotulo}>
                {c.l}
                <input name={c.n} inputMode="decimal" defaultValue={String(c.v).replace(".", ",")} className={campo} />
              </label>
            ))}
            <div>
              <SubmitButton className={botao}>Salvar</SubmitButton>
            </div>
          </form>
          <section className={card}>
            <h2 className={h2}>Exportar</h2>
            <p className="m-0 text-sm text-[var(--text-secondary)]">Para a contadora ou para guardar uma cópia no Google Drive.</p>
            <a href={`/admin/financeiro/exportar?tipo=csv&ano=${ano}`} className={`${botaoLinha} flex items-center self-start`}>
              Pagamentos de {ano} (planilha .csv)
            </a>
            <a href={`/admin/financeiro/exportar?tipo=despesas&ano=${ano}`} className={`${botaoLinha} flex items-center self-start`}>
              Despesas de {ano} (planilha .csv)
            </a>
            <a href="/admin/financeiro/exportar?tipo=json" className={`${botaoLinha} flex items-center self-start`}>
              Backup completo (.json)
            </a>
          </section>
        </div>
      )}
    </div>
  );
}

function LinhaCobranca({ c, hoje }: { c: Cobranca; hoje: string }) {
  const late = atrasada(c, hoje);
  return (
    <details className="group rounded-xl border border-[var(--border)]">
      <summary className="list-none cursor-pointer flex items-center gap-3 p-3">
        <span
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${c.pago_em ? "bg-[var(--success-text)]" : late ? "bg-[var(--danger-text)]" : "border border-[var(--border-strong)]"}`}
          aria-hidden="true"
        />
        <span className="flex-1 min-w-0 flex flex-col">
          <span className="text-[15px] font-semibold truncate">{c.cliente}</span>
          <span className="text-[13px] text-[var(--text-secondary)]">
            {c.descricao} · {c.pago_em ? `recebido em ${dataCurta(c.pago_em)}${c.forma ? ` (${c.forma})` : ""}` : `vence ${dataCurta(c.vencimento)}`}
            {late ? " · em atraso" : ""}
          </span>
        </span>
        <span className="text-[15px] font-semibold">{moeda(c.pago_em ? valorRecebido(c) : c.valor)}</span>
      </summary>
      <div className="border-t border-[var(--border-soft)] p-3 flex flex-col gap-3">
        {c.pago_em ? (
          <form action={marcarPago}>
            <input type="hidden" name="id" value={c.id} />
            <input type="hidden" name="desfazer" value="1" />
            <button type="submit" className={botaoLinha}>
              Desfazer recebimento
            </button>
          </form>
        ) : (
          <form action={marcarPago} className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="id" value={c.id} />
            <label className={rotulo}>
              Recebido em
              <input type="date" name="pago_em" defaultValue={hoje} className={campo} />
            </label>
            <label className={rotulo}>
              Valor
              <input name="valor_pago" inputMode="decimal" defaultValue={String(c.valor).replace(".", ",")} className={`${campo} w-28`} />
            </label>
            <label className={rotulo}>
              Forma
              <select name="forma" className={campo}>
                {FORMAS_PAGAMENTO.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </label>
            <SubmitButton className={botao} pendingText="Salvando..." savedText="✓ Recebido">
              Recebido
            </SubmitButton>
          </form>
        )}
        {c.observacoes && <p className="m-0 text-[13px] text-[var(--text-secondary)]">{c.observacoes}</p>}
        <form action={excluirCobranca}>
          <input type="hidden" name="id" value={c.id} />
          <ConfirmarExclusao rotulo="Excluir cobrança" aviso="Excluir esta cobrança? Se for mensalidade, ela não volta a ser criada para este mês." />
        </form>
      </div>
    </details>
  );
}

function FormPlano({ p, alunos }: { p?: Plano; alunos: { id: string; nome: string | null; email: string }[] }) {
  return (
    <form action={salvarPlano} className="flex flex-col gap-3">
      {p && <input type="hidden" name="id" value={p.id} />}
      <label className={rotulo}>
        Aluno da plataforma
        <select name="aluno_id" defaultValue={p?.aluno_id ?? ""} className={campo}>
          <option value="">Não está na plataforma (escreva o nome abaixo)</option>
          {alunos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome || a.email}
            </option>
          ))}
        </select>
      </label>
      <input name="cliente" defaultValue={p?.cliente ?? ""} placeholder="Nome (se não estiver na plataforma)" aria-label="Nome" className={campo} />
      <div className="flex flex-wrap gap-2">
        <label className={`${rotulo} flex-1 min-w-[160px]`}>
          Produto
          <input name="produto" defaultValue={p?.produto ?? ""} list="produtos-tuprof" placeholder="Mentoria individual" className={campo} />
        </label>
        <label className={rotulo}>
          WhatsApp
          <input name="whatsapp" defaultValue={p?.whatsapp ?? ""} inputMode="tel" placeholder="(71) 9...." className={`${campo} w-40`} />
        </label>
      </div>
      <datalist id="produtos-tuprof">
        {["Mentoria individual", "Mentoria em dupla", "Espanhol Chave", "O Portal", "Club Hispano", "Preparação DELE"].map((x) => (
          <option key={x} value={x} />
        ))}
      </datalist>
      <div className="flex flex-wrap gap-2">
        <label className={rotulo}>
          Mensalidade (R$)
          <input name="valor_mensal" required inputMode="decimal" defaultValue={p ? String(p.valor_mensal).replace(".", ",") : ""} placeholder="0,00" className={`${campo} w-32`} />
        </label>
        <label className={rotulo}>
          Início
          <input type="date" name="inicio" required defaultValue={p?.inicio ?? hojeISO()} className={campo} />
        </label>
        <label className={rotulo}>
          Vence todo dia
          <input type="number" name="dia_vencimento" min={1} max={28} defaultValue={p?.dia_vencimento ?? 10} className={`${campo} w-20`} />
        </label>
      </div>
      <div className="flex flex-wrap gap-3 items-end">
        <label className={rotulo}>
          Duração (meses)
          <input type="number" name="meses" min={1} defaultValue={p?.meses ?? 3} className={`${campo} w-24`} />
        </label>
        <label className="flex items-center gap-2 text-sm h-[42px]">
          <input type="checkbox" name="continuo" value="1" defaultChecked={p ? !p.meses : false} className="w-[18px] h-[18px]" />
          Contínuo, sem data para acabar
        </label>
      </div>
      <input name="observacoes" defaultValue={p?.observacoes ?? ""} placeholder="Observações (opcional)" aria-label="Observações" className={campo} />
      <div>
        <SubmitButton className={botao}>{p ? "Salvar contrato" : "Criar contrato"}</SubmitButton>
      </div>
    </form>
  );
}

function LinhaPlano({ p, hoje, alunos }: { p: Plano; hoje: string; alunos: { id: string; nome: string | null; email: string }[] }) {
  const s = situacaoPlano(p, hoje);
  const fim = fimDoPlano(p);
  return (
    <details className="rounded-xl border border-[var(--border)]">
      <summary className="list-none cursor-pointer flex items-center gap-3 p-3">
        <span className="flex-1 min-w-0 flex flex-col">
          <span className="text-[15px] font-semibold">
            {p.cliente}
            <span className={`ml-2 text-[11px] font-semibold rounded-md px-1.5 py-0.5 ${COR_SITUACAO[s]}`}>{ROTULO_SITUACAO[s]}</span>
          </span>
          <span className="text-[13px] text-[var(--text-secondary)]">
            {p.produto ? `${p.produto} · ` : ""}
            {dataCurta(p.inicio)} → {p.encerrado_em ? `encerrado em ${dataCurta(p.encerrado_em)}` : fim ? dataCurta(fim) : "contínuo"} · vence dia {p.dia_vencimento}
          </span>
        </span>
        <span className="text-[15px] font-semibold">{moeda(p.valor_mensal)}/mês</span>
      </summary>
      <div className="border-t border-[var(--border-soft)] p-3 flex flex-col gap-3">
        {p.whatsapp && (
          <a href={`https://wa.me/55${p.whatsapp.replace(/\D/g, "").replace(/^55/, "")}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[var(--gold-text)]">
            Abrir WhatsApp →
          </a>
        )}
        {p.aluno_id && (
          <Link href={`/admin/alunos/${p.aluno_id}`} className="text-sm font-semibold text-[var(--gold-text)]">
            Abrir ficha do aluno →
          </Link>
        )}
        <FormPlano p={p} alunos={alunos} />
        <div className="flex flex-wrap gap-3 items-center pt-2 border-t border-[var(--border-soft)]">
          <form action={encerrarPlano}>
            <input type="hidden" name="id" value={p.id} />
            {p.encerrado_em && <input type="hidden" name="reabrir" value="1" />}
            <button type="submit" className={botaoLinha}>
              {p.encerrado_em ? "Reabrir contrato" : "Encerrar hoje"}
            </button>
          </form>
          <form action={excluirPlano}>
            <input type="hidden" name="id" value={p.id} />
            <ConfirmarExclusao rotulo="Excluir" aviso="Excluir o contrato e todas as cobranças dele (inclusive as pagas)? Para parar de cobrar, use “Encerrar”." />
          </form>
        </div>
      </div>
    </details>
  );
}
