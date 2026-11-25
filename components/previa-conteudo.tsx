import type { Previa } from "@/lib/previa";

const rotulo = "m-0 text-xs tracking-[0.1em] uppercase text-[var(--gold-text)] font-semibold";

// Como o aluno lê a prévia da aula.
export default function PreviaConteudo({ previa }: { previa: Previa }) {
  return (
    <div className="flex flex-col gap-4">
      {previa.objetivo && (
        <section className="bg-[var(--navy)] text-[var(--on-navy)] rounded-[18px] p-5 flex flex-col gap-1.5">
          <p className="m-0 text-xs tracking-[0.1em] uppercase text-[var(--gold-light)] font-semibold">Objetivo</p>
          <p className="m-0 font-serif text-[24px] leading-snug font-semibold">{previa.objetivo}</p>
        </section>
      )}
      {previa.situacao && (
        <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-5 flex flex-col gap-1.5">
          <p className={rotulo}>A situação</p>
          <p className="m-0 text-[15px] leading-relaxed whitespace-pre-line">{previa.situacao}</p>
        </section>
      )}
      {previa.expressoes && previa.expressoes.length > 0 && (
        <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-5 flex flex-col gap-2">
          <p className={rotulo}>Expressões-chave</p>
          <ul className="m-0 p-0 list-none divide-y divide-[var(--border-soft)]">
            {previa.expressoes.map((e, i) => (
              <li key={i} className="py-2.5 flex flex-col gap-0.5">
                <span className="font-serif text-[20px] font-semibold leading-snug">{e.frase}</span>
                {e.traducao && <span className="text-sm text-[var(--text-secondary)]">{e.traducao}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
      {previa.erro && (
        <section className="bg-[var(--danger-bg)] rounded-[18px] p-5 flex flex-col gap-1.5">
          <p className="m-0 text-xs tracking-[0.1em] uppercase text-[var(--danger-text)] font-semibold">Cuidado com</p>
          <p className="m-0 text-[15px] leading-relaxed">{previa.erro}</p>
        </section>
      )}
      {previa.preparo && (
        <section className="bg-[var(--warning-bg)] rounded-[18px] p-5 flex flex-col gap-1.5">
          <p className="m-0 text-xs tracking-[0.1em] uppercase text-[var(--warning-text)] font-semibold">Para chegar preparado</p>
          <p className="m-0 text-[15px] leading-relaxed">{previa.preparo}</p>
        </section>
      )}
    </div>
  );
}
