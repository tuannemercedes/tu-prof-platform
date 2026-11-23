import { createClient } from "@/lib/supabase/server";
import { diaCurtoComMes } from "@/lib/datas";
import { lerCompetencias, nivel } from "@/lib/evolucao";
import { nomeDoProfessor, type Visao } from "@/lib/visao";

export default async function TelaEvolucao({ v }: { v: Visao }) {
  const supabase = await createClient();
  const idioma = v.idioma;

  const [{ data: checkpoints }, { data: cfg }, professor] = await Promise.all([
    supabase
      .from("checkpoints")
      .select("id, data, titulo, niveis, comentario")
      .eq("aluno_id", v.alunoId)
      .or(`idioma.is.null,idioma.eq.${idioma}`)
      .order("data", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("configuracoes").select("valor").eq("chave", "competencias").maybeSingle(),
    nomeDoProfessor(supabase, v),
  ]);

  const lista = checkpoints ?? [];
  const ultimo = lista[0];
  const niveis = (ultimo?.niveis ?? {}) as Record<string, number>;
  const competencias = [...new Set([...lerCompetencias(cfg?.valor), ...Object.keys(niveis)])];
  const avancos = (c: (typeof lista)[number], antes?: (typeof lista)[number]) => {
    if (!antes) return 0;
    const a = (antes.niveis ?? {}) as Record<string, number>;
    const n = (c.niveis ?? {}) as Record<string, number>;
    return Object.keys(n).filter((k) => (n[k] ?? 0) > (a[k] ?? 0)).length;
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="space-y-1.5">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--gold-text)]">Minha evolução</p>
        <h1 className="m-0 font-serif font-semibold text-[34px] leading-[1.05]">O que mudou desde o início</h1>
      </div>

      {ultimo ? (
        <>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-[18px] flex flex-col gap-4">
            <div className="flex justify-between items-baseline">
              <span className="text-[15px] font-semibold">Último checkpoint</span>
              <span className="text-xs text-[var(--text-secondary)]">{diaCurtoComMes(ultimo.data)}</span>
            </div>
            {competencias.map((nome) => {
              const n = nivel(niveis[nome]);
              const v = n?.valor ?? 0;
              return (
                <div key={nome} className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span>{nome}</span>
                    <span className="font-semibold" style={{ color: n?.texto ?? "var(--text-secondary)" }}>
                      {n?.rotulo ?? "Sem avaliação"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1" aria-hidden="true">
                    {[1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className="h-2 rounded"
                        style={{ background: v >= i && n ? n.barra : "var(--surface-3)" }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {ultimo.comentario && (
            <div className="bg-[var(--navy)] text-[var(--on-navy)] rounded-[18px] p-[18px] flex flex-col gap-2.5">
              <span className="text-xs tracking-[0.1em] uppercase text-[var(--gold-light)] font-semibold">
                Comentário {professor ? `de ${professor.split(" ")[0]}` : "da professora"}
              </span>
              <p className="m-0 text-[15px] leading-relaxed whitespace-pre-line">{ultimo.comentario}</p>
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            <h2 className="m-0 font-serif font-semibold text-2xl">Histórico</h2>
            {lista.map((c, i) => {
              const a = avancos(c, lista[i + 1]);
              return (
                <div
                  key={c.id}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-[14px] p-3.5 flex justify-between items-center gap-3"
                >
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold">{c.titulo || `Checkpoint ${lista.length - i}`}</span>
                    <span className="text-xs text-[var(--text-secondary)]">{diaCurtoComMes(c.data)}</span>
                  </span>
                  <span className="text-[13px] font-semibold text-[var(--warning-text)]">
                    {i === lista.length - 1 ? "Ponto de partida" : a ? `${a} ${a === 1 ? "avanço" : "avanços"}` : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-5">
          <p className="m-0 text-[15px] font-semibold">Seu primeiro checkpoint está a caminho</p>
          <p className="mt-1.5 mb-0 text-sm text-[var(--text-secondary)]">
            Depois das primeiras aulas, a sua professora registra aqui como você está em cada competência.
          </p>
        </div>
      )}

      <div className="border border-dashed border-[var(--gold)] rounded-[14px] p-4 flex gap-3.5 items-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold-text)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="9" r="6" />
          <path d="M8.5 14L7 22l5-3 5 3-1.5-8" />
        </svg>
        <span className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold">Certificado Tu Prof</span>
          <span className="text-xs text-[var(--text-secondary)]">Disponível ao final do seu programa</span>
        </span>
      </div>
    </div>
  );
}
