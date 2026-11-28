import Link from "next/link";
import { diasUteisDesde, PRAZO_MISSAO_DIAS_UTEIS } from "@/lib/dias-uteis";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/dal";
import { getResumoEquipe } from "@/lib/equipe";
import { fimDoPlano } from "@/lib/financeiro";
import { dataCurta, moeda } from "@/lib/empresas";
import { diaISO, diaSemanaCurto, hojePorExtenso, hora, segundaDaSemana, somarDias } from "@/lib/datas";

const SITUACAO = {
  em_dia: { texto: "Em dia", bg: "var(--success-bg)", fg: "var(--success-text)" },
  atrasado: { texto: "Tarefas atrasadas", bg: "var(--danger-bg)", fg: "var(--danger-text)" },
  sem_aula: { texto: "Sem aula marcada", bg: "var(--warning-bg)", fg: "var(--warning-text)" },
} as const;

const card = "bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-[22px] flex flex-col gap-3.5";
const h2 = "m-0 font-serif font-semibold text-[26px]";

export default async function EquipeInicioPage({
  searchParams,
}: {
  searchParams: Promise<{ visao?: string }>;
}) {
  const { visao } = await searchParams;
  const profile = await getProfile();
  const supabase = await createClient();
  const ehAdmin = profile!.role === "admin";
  const visaoProfessor = !ehAdmin || visao === "professor";

  const { alunos, aulasSemana } = await getResumoEquipe(supabase, {
    soDe: !ehAdmin ? profile!.id : visaoProfessor ? "admin" : undefined,
  });

  let clubeSemana: { id: string; data: string; tema: string }[] = [];
  if (!visaoProfessor) {
    const segunda = segundaDaSemana(diaISO(new Date()));
    const proximaSegunda = somarDias(segunda, 7);
    const { data } = await supabase
      .from("clube_temas")
      .select("id, data, tema")
      .gte("data", segunda)
      .lt("data", proximaSegunda);
    clubeSemana = data ?? [];
  }

  // Financeiro (só na visão da fundadora): mensalidades em atraso e contratos perto do fim.
  let financeiro: { atrasadas: { cliente: string; valor: number; vencimento: string }[]; vencendo: { cliente: string; fim: string }[] } = {
    atrasadas: [],
    vencendo: [],
  };
  if (ehAdmin && !visaoProfessor) {
    const hoje = diaISO(new Date());
    await supabase.rpc("gerar_mensalidades");
    const [{ data: cob }, { data: planos }] = await Promise.all([
      supabase.from("cobrancas").select("cliente, valor, vencimento").is("pago_em", null).lt("vencimento", hoje).order("vencimento"),
      supabase.from("planos_alunos").select("cliente, inicio, meses, encerrado_em").is("encerrado_em", null).not("meses", "is", null),
    ]);
    financeiro = {
      atrasadas: (cob ?? []).map((c) => ({ ...c, valor: Number(c.valor) })),
      vencendo: (planos ?? [])
        .map((p) => ({ cliente: p.cliente, fim: fimDoPlano(p) ?? "" }))
        .filter((p) => p.fim && p.fim >= hoje && p.fim <= somarDias(hoje, 30)),
    };
  }

  const atrasados = alunos.filter((a) => a.tarefasAtrasadas > 0);
  const checkpoint = alunos.filter((a) => a.aulasDesdeCheckpoint >= 4);
  const semAula = alunos.filter((a) => !a.proximaAula);

  const kpis = visaoProfessor
    ? [
        { v: alunos.length, l: "Meus alunos" },
        { v: aulasSemana.length, l: "Minhas aulas na semana" },
        { v: checkpoint.length, l: "Checkpoints a fazer" },
        { v: atrasados.length, l: "Alunos com tarefas atrasadas" },
      ]
    : [
        { v: alunos.length, l: "Alunos ativos" },
        { v: aulasSemana.length, l: "Aulas esta semana" },
        { v: alunos.reduce((s, a) => s + a.tarefasAtrasadas, 0), l: "Tarefas atrasadas" },
        { v: checkpoint.length, l: "Checkpoints a fazer" },
      ];

  type Alerta = { chave: string; titulo: string; meta: string; acao: string; cor: string; href: string };
  // Missões esperando comentário (a RLS já limita o professor aos alunos dele).
  const { data: missoesAbertas } = await supabase
    .from("missao_entregas")
    .select("created_at")
    .is("comentario_em", null)
    .eq("precisa_correcao", true);
  const missoesAtrasadas = (missoesAbertas ?? []).filter((m) => diasUteisDesde(m.created_at) >= PRAZO_MISSAO_DIAS_UTEIS).length;

  const alertas: Alerta[] = [
    ...((missoesAbertas ?? []).length
      ? [
          {
            chave: "missoes",
            titulo: `${(missoesAbertas ?? []).length} ${(missoesAbertas ?? []).length === 1 ? "Missão espera" : "Missões esperam"} comentário`,
            meta: missoesAtrasadas ? `${missoesAtrasadas} passaram do prazo de ${PRAZO_MISSAO_DIAS_UTEIS} dias úteis` : `Prazo: ${PRAZO_MISSAO_DIAS_UTEIS} dias úteis`,
            acao: "Corrigir",
            cor: missoesAtrasadas ? "#c2553e" : "#d9b866",
            href: "/admin/missoes",
          },
        ]
      : []),
    ...financeiro.atrasadas.map((c, i) => ({
      chave: `fin-${i}`,
      titulo: `Pagamento em atraso: ${c.cliente}`,
      meta: `${moeda(c.valor)} · venceu em ${dataCurta(c.vencimento)}`,
      acao: "Ver",
      cor: "#c2553e",
      href: "/admin/financeiro?aba=cobrancas",
    })),
    ...financeiro.vencendo.map((p, i) => ({
      chave: `ven-${i}`,
      titulo: `Contrato de ${p.cliente} vence em ${dataCurta(p.fim)}`,
      meta: "Hora de conversar sobre a renovação",
      acao: "Ver",
      cor: "#c9a24d",
      href: "/admin/financeiro?aba=contratos&filtro=vencendo",
    })),
    ...alunos
      .filter((a) => a.pedidosRemarcacao > 0)
      .map((a) => ({
        chave: `pr-${a.id}`,
        titulo: `${a.nome} pediu para remarcar`,
        meta: a.pedidosRemarcacao === 1 ? "1 pedido de remarcação" : `${a.pedidosRemarcacao} pedidos de remarcação`,
        acao: "Responder",
        cor: "#c2553e",
        href: `/admin/alunos/${a.id}`,
      })),
    ...alunos
      .filter((a) => a.reposicoesPendentes > 0)
      .map((a) => ({
        chave: `rp-${a.id}`,
        titulo: `Reposição pendente: ${a.nome}`,
        meta: a.reposicoesPendentes === 1 ? "1 aula para repor" : `${a.reposicoesPendentes} aulas para repor`,
        acao: "Agendar",
        cor: "#c9a24d",
        href: `/admin/alunos/${a.id}`,
      })),
    ...atrasados.map((a) => ({
      chave: `at-${a.id}`,
      titulo: `${a.nome} está com tarefas atrasadas`,
      meta: `${a.tarefasAtrasadas} ${a.tarefasAtrasadas === 1 ? "tarefa" : "tarefas"} fora do prazo`,
      acao: "Ver aluno",
      cor: "#c2553e",
      href: `/admin/alunos/${a.id}`,
    })),
    ...checkpoint.map((a) => ({
      chave: `cp-${a.id}`,
      titulo: `Checkpoint de ${a.nome}`,
      meta: `Completou ${a.aulasDesdeCheckpoint} aulas desde o último`,
      acao: "Registrar",
      cor: "#c9a24d",
      href: `/admin/alunos/${a.id}?aba=evolucao`,
    })),
    ...semAula.map((a) => ({
      chave: `sa-${a.id}`,
      titulo: `${a.nome} está sem próxima aula`,
      meta: "Nenhuma aula agendada",
      acao: "Marcar aula",
      cor: "#16284a",
      href: `/admin/alunos/${a.id}`,
    })),
  ].slice(0, 8);

  const tag = (bg: string, fg: string) => ({ background: bg, color: fg });
  const primeiroNome = (profile!.nome || "").split(" ")[0];

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-wrap gap-4 items-end justify-between">
        <div className="flex flex-col gap-1.5">
          <p className="m-0 text-[13px] text-[var(--text-secondary)]">{hojePorExtenso()}</p>
          <h1 className="m-0 font-serif font-semibold text-[40px] leading-[1.05]">
            Olá{primeiroNome ? `, ${primeiroNome}` : ""}
          </h1>
        </div>
        {ehAdmin && (
          <div role="group" aria-label="Ver a tela como" className="flex bg-[var(--surface-3)] rounded-xl p-1 gap-1">
            {[
              { href: "/admin", label: "Visão da fundadora", on: !visaoProfessor },
              { href: "/admin?visao=professor", label: "Visão do professor", on: visaoProfessor },
            ].map((b) => (
              <Link
                key={b.href}
                href={b.href}
                aria-current={b.on ? "page" : undefined}
                className={`h-10 px-3.5 rounded-[9px] text-sm font-medium flex items-center ${
                  b.on ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-secondary)]"
                }`}
              >
                {b.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
        {kpis.map((k) => (
          <div key={k.l} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-[18px] flex flex-col gap-1.5">
            <span className="font-serif text-[38px] font-semibold leading-none">{k.v}</span>
            <span className="text-sm text-[var(--text-secondary)]">{k.l}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-5 items-start [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
        <section className={card}>
          <h2 className={h2}>Precisa da sua atenção</h2>
          {alertas.length ? (
            alertas.map((a) => (
              <Link key={a.chave} href={a.href} className="flex gap-3.5 items-center p-3 rounded-xl bg-[var(--surface-2)]">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: a.cor }} />
                <span className="flex-1 flex flex-col gap-0.5 min-w-0">
                  <span className="text-[15px] font-semibold">{a.titulo}</span>
                  <span className="text-[13px] text-[var(--text-secondary)]">{a.meta}</span>
                </span>
                <span className="text-[13px] font-semibold text-[var(--gold-text)] whitespace-nowrap">{a.acao}</span>
              </Link>
            ))
          ) : (
            <p className="m-0 text-sm text-[var(--text-secondary)]">Tudo em ordem por aqui.</p>
          )}
        </section>

        <section className={card}>
          <h2 className={h2}>Aulas desta semana</h2>
          {aulasSemana.length || clubeSemana.length ? (
            <>
              {aulasSemana.map((c) => (
                <Link key={c.id} href={c.href} className="flex gap-3.5 items-center py-2.5 border-b border-[var(--border-soft)]">
                  <span className="w-16 text-[13px] text-[var(--text-secondary)]">
                    {diaSemanaCurto(c.data).charAt(0) + diaSemanaCurto(c.data).slice(1).toLowerCase()} {hora(c.data)}
                  </span>
                  <span className="flex-1 flex flex-col gap-0.5 min-w-0">
                    <span className="text-[15px] font-semibold">{c.alunoNome}</span>
                    <span className="text-[13px] text-[var(--text-secondary)]">{c.tema}</span>
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-[10px]" style={tag("var(--warning-bg)", "var(--warning-text)")}>
                    {c.programa}
                  </span>
                </Link>
              ))}
              {clubeSemana.map((c) => (
                <Link key={c.id} href="/admin/clube" className="flex gap-3.5 items-center py-2.5 border-b border-[var(--border-soft)]">
                  <span className="w-16 text-[13px] text-[var(--text-secondary)]">
                    {new Intl.DateTimeFormat("pt-BR", { weekday: "short", timeZone: "UTC" }).format(new Date(c.data + "T12:00:00Z")).replace(".", "")}
                  </span>
                  <span className="flex-1 flex flex-col gap-0.5">
                    <span className="text-[15px] font-semibold">Club Hispano</span>
                    <span className="text-[13px] text-[var(--text-secondary)]">{c.tema}</span>
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-[10px]" style={tag("#0e1b33", "#d9b866")}>
                    Club
                  </span>
                </Link>
              ))}
            </>
          ) : (
            <p className="m-0 text-sm text-[var(--text-secondary)]">Nenhuma aula marcada nesta semana.</p>
          )}
        </section>
      </div>

      <section className={card}>
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <h2 className={h2}>{visaoProfessor ? "Meus alunos" : "Todos os alunos"}</h2>
          {ehAdmin && (
            <Link
              href="/admin/alunos#adicionar"
              className="h-11 px-[18px] rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold text-sm flex items-center"
            >
              Matricular aluno
            </Link>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-[var(--text-secondary)] text-xs tracking-[0.06em] uppercase">
                <th className="py-2.5 px-2 font-semibold">Aluno</th>
                <th className="py-2.5 px-2 font-semibold">Programa</th>
                <th className="py-2.5 px-2 font-semibold">Professor</th>
                <th className="py-2.5 px-2 font-semibold">Tarefas</th>
                <th className="py-2.5 px-2 font-semibold">Situação</th>
              </tr>
            </thead>
            <tbody>
              {alunos.length ? (
                alunos.map((a) => {
                  const s = SITUACAO[a.situacao];
                  return (
                    <tr key={a.id} className="border-t border-[var(--border-soft)]">
                      <td className="py-3 px-2">
                        <Link href={`/admin/alunos/${a.id}`} className="font-semibold">
                          {a.nome}
                        </Link>
                      </td>
                      <td className="py-3 px-2">{a.programas.map((p) => p.nome).join(", ") || "—"}</td>
                      <td className="py-3 px-2 text-[var(--text-secondary)]">{a.professorNome}</td>
                      <td className="py-3 px-2">{a.tarefasTotal ? `${a.tarefasFeitas} de ${a.tarefasTotal}` : "—"}</td>
                      <td className="py-3 px-2">
                        <span className="inline-flex h-[26px] items-center px-2.5 rounded-[13px] text-xs font-semibold" style={tag(s.bg, s.fg)}>
                          {s.texto}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 px-2 text-[var(--text-secondary)]">
                    Nenhum aluno ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
