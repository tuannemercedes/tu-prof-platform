import { createClient } from "@/lib/supabase/server";
import { hojeISO, sequenciaDeDias, somarDias } from "@/lib/cartas";

// Na ficha do aluno: como ele está indo no jogo de Cartas e quais frases mais erra.
export default async function CartasFicha({ alunoId, idioma, primeiroNome }: { alunoId: string; idioma: string; primeiroNome: string }) {
  const supabase = await createClient();
  const [{ data: prog }, { data: dias }] = await Promise.all([
    supabase
      .from("cartas_progresso")
      .select("nivel, acertos, erros, cartas!inner(incorreta, correta, idioma)")
      .eq("aluno_id", alunoId)
      .eq("cartas.idioma", idioma),
    supabase.from("cartas_dias").select("dia, cartas").eq("aluno_id", alunoId).order("dia", { ascending: false }).limit(400),
  ]);
  type P = { nivel: number; acertos: number; erros: number; cartas: { incorreta: string; correta: string } };
  const lista = (prog ?? []) as unknown as P[];
  const listaDias = (dias ?? []).map((d) => d.dia as string);
  const hoje = hojeISO();
  const ultimos7 = (dias ?? []).filter((d) => d.dia >= somarDias(hoje, -6));
  const semana = ultimos7.reduce((s, d) => s + (d.cartas ?? 0), 0);
  const dominadas = lista.filter((p) => p.nivel >= 3).length;
  const dificeis = lista
    .filter((p) => p.erros > 0)
    .sort((a, b) => b.erros - b.acertos - (a.erros - a.acertos) || b.erros - a.erros)
    .slice(0, 8);

  return (
    <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-[22px] flex flex-col gap-3.5">
      <h2 className="m-0 font-serif font-semibold text-[26px]">Cartas</h2>
      {lista.length ? (
        <>
          <p className="m-0 text-sm text-[var(--text-secondary)]">
            {lista.length} cartas jogadas · {dominadas} dominadas · {semana} respostas nos últimos 7 dias · {sequenciaDeDias(listaDias, hoje)} dias
            seguidos
          </p>
          {dificeis.length > 0 && (
            <>
              <h3 className="m-0 text-sm font-semibold">O que {primeiroNome} mais erra (bom tema para a aula)</h3>
              <ul className="m-0 p-0 list-none divide-y divide-[var(--border)]">
                {dificeis.map((p, i) => (
                  <li key={i} className="py-2.5 flex items-start justify-between gap-3">
                    <span>
                      <span className="block text-[13px] text-[var(--text-faint)] line-through">{p.cartas.incorreta}</span>
                      <span className="block text-[15px] font-semibold">{p.cartas.correta}</span>
                    </span>
                    <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap">
                      errou {p.erros}× · acertou {p.acertos}×
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      ) : (
        <p className="m-0 text-sm text-[var(--text-secondary)]">{primeiroNome} ainda não jogou as Cartas.</p>
      )}
    </section>
  );
}
