import type { ReactNode } from "react";
import { NIVEIS } from "@/lib/evolucao";
import { nomeDoMes, type RelatorioAluno } from "@/lib/relatorio-aluno";
import { diaCurtoComMes } from "@/lib/datas";

// O relatório mensal de um aluno, no visual dos documentos Tu Prof (imprime em A4).
const rotuloNivel = (v: number | null) => (v ? NIVEIS.find((n) => n.valor === v)?.rotulo ?? "—" : "—");
const th = "text-left text-[11px] uppercase tracking-[0.08em] text-[#5b6372] font-semibold py-2 pr-3";
const td = "py-2 pr-3 border-t border-[#e7e2d6] text-[14px]";
const h2 = "m-0 font-serif font-semibold text-[24px]";

export default function RelatorioAlunoDoc({ r, comentario }: { r: RelatorioAluno; comentario: ReactNode }) {
  const feitas = r.tarefas.filter((t) => t.feita).length;
  return (
    <article className="max-w-[820px] w-full mx-auto bg-white text-[#0e1b33] rounded-2xl print:rounded-none shadow-[0_8px_24px_rgba(14,27,51,0.08)] print:shadow-none overflow-hidden">
      <header className="bg-[#0e1b33] text-white px-8 sm:px-10 py-8 flex flex-col gap-4 [-webkit-print-color-adjust:exact] [print-color-adjust:exact]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-tuprof.png" alt="Tu Prof" className="w-[150px] h-auto" />
        <div className="flex flex-col gap-1">
          <span className="text-xs tracking-[0.14em] uppercase text-[#e3c77d] font-semibold">Relatório de {nomeDoMes(r.mes)}</span>
          <h1 className="m-0 font-serif font-semibold text-[34px] leading-tight">{r.aluno?.nome}</h1>
          {r.programas.length > 0 && <span className="text-sm text-[#b9c0cf]">{r.programas.join(" · ")}</span>}
        </div>
      </header>

      <div className="px-8 sm:px-10 py-8 flex flex-col gap-8">
        <section className="grid grid-cols-3 gap-3">
          {[
            { v: r.aulas.length, l: r.aulas.length === 1 ? "aula no mês" : "aulas no mês" },
            { v: r.tarefas.length ? `${feitas}/${r.tarefas.length}` : "—", l: "tarefas feitas" },
            { v: r.checkpointDoMes ? "✓" : "—", l: "checkpoint do mês" },
          ].map((k) => (
            <div key={k.l} className="rounded-xl bg-[#f6f2e8] p-4 flex flex-col gap-1 [-webkit-print-color-adjust:exact] [print-color-adjust:exact]">
              <span className="font-serif font-semibold text-[30px] leading-none">{k.v}</span>
              <span className="text-[12px] text-[#5b6372]">{k.l}</span>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-2.5">
          <h2 className={h2}>Comentário da professora</h2>
          {comentario}
        </section>

        {r.evolucao.length > 0 && (
          <section className="flex flex-col gap-2 break-inside-avoid">
            <h2 className={h2}>Sua evolução</h2>
            <p className="m-0 text-sm text-[#5b6372]">
              Desde o primeiro checkpoint{r.desdeCheckpoint ? ` (${diaCurtoComMes(r.desdeCheckpoint)})` : ""} até hoje.
            </p>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={th}>Competência</th>
                  <th className={th}>No início</th>
                  <th className={th}>Agora</th>
                </tr>
              </thead>
              <tbody>
                {r.evolucao.map((e) => (
                  <tr key={e.competencia}>
                    <td className={`${td} font-semibold`}>{e.competencia}</td>
                    <td className={td}>{rotuloNivel(e.inicio)}</td>
                    <td className={`${td} font-semibold`} style={{ color: e.agora && e.inicio && e.agora > e.inicio ? "#1f6b3a" : undefined }}>
                      {rotuloNivel(e.agora)}
                      {e.agora && e.inicio && e.agora > e.inicio ? " ↑" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <section className="flex flex-col gap-2">
          <h2 className={h2}>O que trabalhamos</h2>
          {r.aulas.length ? (
            <ol className="m-0 p-0 list-none">
              {r.aulas.map((a) => (
                <li key={a.id} className="py-3 border-t border-[#e7e2d6] flex gap-4 break-inside-avoid">
                  <span className="w-[64px] shrink-0 text-[13px] text-[#5b6372]">{diaCurtoComMes(a.data)}</span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[15px] font-semibold">
                      {a.tema}
                      {a.grupo ? <span className="text-[12px] font-normal text-[#8a6a1f]"> · em grupo</span> : null}
                    </span>
                    {a.resumo && <span className="text-[14px] text-[#3b4352] leading-relaxed">{a.resumo}</span>}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="m-0 text-sm text-[#5b6372]">Nenhuma aula registrada neste mês.</p>
          )}
          {r.faltas > 0 && <p className="m-0 text-[13px] text-[#5b6372]">Faltas em aulas de grupo: {r.faltas}.</p>}
        </section>

        {r.tarefas.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className={h2}>Tarefas</h2>
            <ul className="m-0 p-0 list-none">
              {r.tarefas.map((t) => (
                <li key={t.id} className="py-2.5 border-t border-[#e7e2d6] flex gap-3 break-inside-avoid">
                  <span className={`w-5 shrink-0 font-semibold ${t.feita ? "text-[#1f6b3a]" : "text-[#b4432e]"}`}>{t.feita ? "✓" : "○"}</span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[14px]">{t.texto}</span>
                    {t.comentario && <span className="text-[13px] text-[#5b6372] italic">Retorno: {t.comentario}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {r.certificados.length > 0 && (
          <section className="rounded-xl bg-[#0e1b33] text-white p-5 flex flex-col gap-1 [-webkit-print-color-adjust:exact] [print-color-adjust:exact]">
            <span className="text-xs tracking-[0.12em] uppercase text-[#e3c77d] font-semibold">Conquista do mês</span>
            {r.certificados.map((c) => (
              <span key={c.codigo} className="font-serif text-[20px] font-semibold">🎓 {c.titulo}</span>
            ))}
          </section>
        )}

        <footer className="pt-5 border-t border-[#e7e2d6] flex justify-between text-[12px] text-[#5b6372]">
          <span>Tu Prof · Comunicação profissional e internacional</span>
          <span>{nomeDoMes(r.mes)}</span>
        </footer>
      </div>
    </article>
  );
}
