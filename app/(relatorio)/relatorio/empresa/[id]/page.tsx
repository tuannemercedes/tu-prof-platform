import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { contratoAtual, dataCurta, getEmpresas } from "@/lib/empresas";
import { diaISO, somarDias } from "@/lib/datas";
import { lerCompetencias, NIVEIS } from "@/lib/evolucao";
import { rotuloIdioma } from "@/lib/programas";
import Logo from "@/components/logo";
import { lerPrevia } from "@/lib/previa";
import { BotaoImprimir, Comentario } from "@/components/relatorio-acoes";

// Relatório para o RH: frequência, temas trabalhados e evolução no período.
// A fundadora revisa, escreve o comentário e salva em PDF pelo navegador.

const rotuloNivel = (v: number | null) => {
  if (v == null) return "—";
  const n = NIVEIS.reduce((a, b) => (Math.abs(b.valor - v) < Math.abs(a.valor - v) ? b : a));
  return n.rotulo;
};

export default async function RelatorioEmpresa({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ de?: string; ate?: string }>;
}) {
  await requireAdmin();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const [empresa] = await getEmpresas(supabase, id);
  if (!empresa) notFound();

  const hoje = diaISO(new Date());
  const c = contratoAtual(empresa.contratos);
  const ate = sp.ate || hoje;
  const de = sp.de || (c?.inicio && c.inicio <= ate ? c.inicio : somarDias(ate, -30));
  const noPeriodo = (iso: string | null) => !!iso && diaISO(iso) >= de && diaISO(iso) <= ate;

  const participantes = empresa.grupos.flatMap((g) => g.participantes.map((p) => p.id));
  const [{ data: cps }, { data: cfg }] = await Promise.all([
    participantes.length
      ? supabase.from("checkpoints").select("aluno_id, data, niveis").in("aluno_id", participantes).lte("data", ate).order("data")
      : Promise.resolve({ data: [] as { aluno_id: string; data: string; niveis: unknown }[] }),
    supabase.from("configuracoes").select("valor").eq("chave", "competencias").maybeSingle(),
  ]);
  const competencias = lerCompetencias(cfg?.valor);

  // Evolução: para cada pessoa, o primeiro checkpoint e o último até o fim do período.
  const porAluno = new Map<string, { data: string; niveis: Record<string, number> }[]>();
  (cps ?? []).forEach((cp) => {
    porAluno.set(cp.aluno_id, [...(porAluno.get(cp.aluno_id) ?? []), { data: cp.data, niveis: (cp.niveis ?? {}) as Record<string, number> }]);
  });
  const media = (vals: number[]) => (vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null);
  const evolucao = competencias.map((comp) => {
    const inicio: number[] = [];
    const agora: number[] = [];
    porAluno.forEach((lista) => {
      const a = lista[0]?.niveis[comp];
      const b = lista[lista.length - 1]?.niveis[comp];
      if (a) inicio.push(Number(a));
      if (b) agora.push(Number(b));
    });
    return { comp, inicio: media(inicio), agora: media(agora), avancaram: [...porAluno.values()].filter((l) => l.length > 1 && (l[l.length - 1].niveis[comp] ?? 0) > (l[0].niveis[comp] ?? 0)).length };
  });
  const temEvolucao = porAluno.size > 0;

  const grupos = empresa.grupos.map((g) => {
    const realizadas = g.aulas.filter((a) => a.status === "realizada" && noPeriodo(a.data));
    const comChamada = realizadas.filter((a) => a.temChamada);
    const linhas = g.participantes.map((p) => {
      const foi = comChamada.filter((a) => a.presentes.includes(p.id)).length;
      return { ...p, foi, de: comChamada.length, pct: comChamada.length ? Math.round((foi / comChamada.length) * 100) : null };
    });
    const mediaPresentes = comChamada.length ? comChamada.reduce((s, a) => s + a.presentes.length, 0) / comChamada.length : null;
    return { g, realizadas, comChamada, linhas, mediaPresentes };
  });

  const totalAulas = grupos.reduce((s, x) => s + x.realizadas.length, 0);
  const presencaGeral = (() => {
    const todas = grupos.flatMap((x) => x.linhas.filter((l) => l.de > 0));
    const foi = todas.reduce((s, l) => s + l.foi, 0);
    const de = todas.reduce((s, l) => s + l.de, 0);
    return de ? Math.round((foi / de) * 100) : null;
  })();
  const comPrevia = grupos.flatMap((x) => x.realizadas.filter((a) => lerPrevia(a.previa)).map((a) => ({ a, total: x.g.participantes.length })));
  const preparo = (() => {
    const de = comPrevia.reduce((s, x) => s + x.total, 0);
    const foi = comPrevia.reduce((s, x) => s + x.a.vistas.length, 0);
    return de ? Math.round((foi / de) * 100) : null;
  })();
  const ativos = grupos.reduce((s, x) => s + x.linhas.filter((l) => l.foi > 0).length, 0);
  const temas = grupos
    .flatMap((x) => x.realizadas.map((a) => ({ ...a, grupo: x.g.nome, total: x.g.participantes.length })))
    .sort((a, b) => ((a.data ?? "") < (b.data ?? "") ? -1 : 1));

  const th = "text-left text-[11px] uppercase tracking-[0.08em] text-[#5b6372] font-semibold py-2 pr-3";
  const td = "py-2 pr-3 border-t border-[#e7e2d6] text-[14px]";

  return (
    <div className="min-h-screen bg-[#f3efe6] print:bg-white text-[#0e1b33]">
      <div className="print:hidden max-w-[820px] mx-auto px-5 pt-6 flex flex-wrap items-end justify-between gap-3">
        <Link href={`/admin/empresas/${empresa.id}`} className="text-sm font-semibold text-[#8a6a1f]">
          ← Voltar para {empresa.nome}
        </Link>
        <form className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs font-semibold">
            De
            <input type="date" name="de" defaultValue={de} className="h-10 rounded-lg border border-[#c8c2b4] bg-white px-2 text-sm" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold">
            Até
            <input type="date" name="ate" defaultValue={ate} className="h-10 rounded-lg border border-[#c8c2b4] bg-white px-2 text-sm" />
          </label>
          <button type="submit" className="h-10 px-4 rounded-lg border border-[#0e1b33] text-sm font-semibold">
            Atualizar
          </button>
          <BotaoImprimir />
        </form>
      </div>

      <article className="max-w-[820px] mx-auto my-6 print:my-0 bg-white rounded-2xl print:rounded-none shadow-[0_8px_24px_rgba(14,27,51,0.08)] print:shadow-none overflow-hidden">
        <header className="bg-[#0e1b33] text-white px-10 py-8 flex flex-col gap-4 print:[-webkit-print-color-adjust:exact] print:[print-color-adjust:exact]">
          <Logo className="text-[28px]" />
          <div className="flex flex-col gap-1">
            <span className="text-xs tracking-[0.14em] uppercase text-[#e3c77d] font-semibold">Relatório de acompanhamento</span>
            <h1 className="m-0 font-serif font-semibold text-[38px] leading-tight">{empresa.nome}</h1>
            <span className="text-sm text-[#b9c0cf]">
              {c?.descricao ? `${c.descricao} · ` : ""}
              {c ? `${rotuloIdioma(c.idioma)} · ` : ""}
              Período de {dataCurta(de)} a {dataCurta(ate)}
            </span>
          </div>
        </header>

        <div className="px-10 py-8 flex flex-col gap-9">
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { v: totalAulas, l: totalAulas === 1 ? "aula realizada" : "aulas realizadas" },
              { v: presencaGeral != null ? `${presencaGeral}%` : "—", l: "frequência geral" },
              { v: `${ativos}`, l: "participantes ativos" },
              preparo != null
                ? { v: `${preparo}%`, l: "abriram a prévia antes da aula" }
                : { v: empresa.grupos.length, l: empresa.grupos.length === 1 ? "grupo" : "grupos" },
            ].map((k) => (
              <div key={k.l} className="rounded-xl bg-[#f6f2e8] p-4 flex flex-col gap-1 print:[-webkit-print-color-adjust:exact] print:[print-color-adjust:exact]">
                <span className="font-serif font-semibold text-[32px] leading-none">{k.v}</span>
                <span className="text-[12px] text-[#5b6372]">{k.l}</span>
              </div>
            ))}
          </section>

          <section className="flex flex-col gap-2.5">
            <h2 className="m-0 font-serif font-semibold text-[26px]">Comentário da Tu Prof</h2>
            <p className="m-0 text-xs text-[#5b6372] print:hidden">
              Clique no quadro e escreva a leitura do período antes de salvar o PDF. Esse texto não fica gravado.
            </p>
            <Comentario inicial="" />
          </section>

          {temEvolucao && (
            <section className="flex flex-col gap-2.5 break-inside-avoid">
              <h2 className="m-0 font-serif font-semibold text-[26px]">Evolução do grupo</h2>
              <p className="m-0 text-sm text-[#5b6372]">
                Média dos checkpoints individuais: como o grupo começou e onde está agora, por competência.
              </p>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={th}>Competência</th>
                    <th className={th}>No início</th>
                    <th className={th}>Agora</th>
                    <th className={th}>Pessoas que avançaram</th>
                  </tr>
                </thead>
                <tbody>
                  {evolucao.map((e) => (
                    <tr key={e.comp}>
                      <td className={`${td} font-semibold`}>{e.comp}</td>
                      <td className={td}>{rotuloNivel(e.inicio)}</td>
                      <td className={td}>{rotuloNivel(e.agora)}</td>
                      <td className={td}>{e.avancaram}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {grupos.map(({ g, comChamada, linhas, mediaPresentes, realizadas }) => (
            <section key={g.id} className="flex flex-col gap-2.5 break-inside-avoid">
              <h2 className="m-0 font-serif font-semibold text-[26px]">Frequência · {g.nome}</h2>
              <p className="m-0 text-sm text-[#5b6372]">
                {realizadas.length} {realizadas.length === 1 ? "aula" : "aulas"} no período
                {mediaPresentes != null ? ` · média de ${Math.round(mediaPresentes * 10) / 10} pessoas por aula` : ""}
                {comChamada.length < realizadas.length ? ` · ${realizadas.length - comChamada.length} sem chamada registrada` : ""}
              </p>
              {linhas.length ? (
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className={th}>Participante</th>
                      <th className={th}>Presenças</th>
                      <th className={th}>Frequência</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linhas.map((l) => (
                      <tr key={l.id}>
                        <td className={td}>{l.nome}</td>
                        <td className={td}>{l.de ? `${l.foi} de ${l.de}` : "—"}</td>
                        <td className={`${td} font-semibold`} style={{ color: l.pct != null && l.pct < 60 ? "#b4432e" : undefined }}>
                          {l.pct != null ? `${l.pct}%` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="m-0 text-sm text-[#5b6372]">Sem participantes cadastrados.</p>
              )}
            </section>
          ))}

          <section className="flex flex-col gap-2.5">
            <h2 className="m-0 font-serif font-semibold text-[26px]">O que trabalhamos</h2>
            {temas.length ? (
              <ol className="m-0 p-0 list-none flex flex-col">
                {temas.map((a) => (
                  <li key={a.id} className="py-3 border-t border-[#e7e2d6] flex gap-4 break-inside-avoid">
                    <span className="w-[76px] shrink-0 text-[13px] text-[#5b6372]">{a.data ? dataCurta(diaISO(a.data)) : ""}</span>
                    <span className="flex flex-col gap-0.5">
                      <span className="text-[15px] font-semibold">{a.tema}</span>
                      {a.resumo && <span className="text-[14px] text-[#3b4352] leading-relaxed">{a.resumo}</span>}
                      <span className="text-[12px] text-[#8a6a1f]">
                        {[
                          empresa.grupos.length > 1 ? a.grupo : null,
                          a.temChamada ? `${a.presentes.length} de ${a.total} presentes` : null,
                          lerPrevia(a.previa) ? `prévia aberta por ${a.vistas.length} de ${a.total}` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="m-0 text-sm text-[#5b6372]">Nenhuma aula registrada no período.</p>
            )}
          </section>

          <footer className="pt-6 border-t border-[#e7e2d6] flex justify-between text-[12px] text-[#5b6372]">
            <span>Tu Prof · Comunicação profissional e internacional</span>
            <span>Emitido em {dataCurta(hoje)}</span>
          </footer>
        </div>
      </article>
    </div>
  );
}
