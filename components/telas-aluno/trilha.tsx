import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTrilhasDoAluno, pct, type MaterialStatus } from "@/lib/trilhas";
import CabecalhoPagina from "@/components/cabecalho-pagina";
import { doIdioma } from "@/lib/idioma";
import { getLiberados, rota, type Visao } from "@/lib/visao";

function Bolinha({ feito }: { feito: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`w-2.5 h-2.5 shrink-0 rounded-full ${
        feito ? "bg-[var(--gold)]" : "bg-[var(--surface-3)] border border-[var(--border-strong)]"
      }`}
    />
  );
}

function ListaMateriais({ v, trilhaId, materiais }: { v: Visao; trilhaId: string; materiais: MaterialStatus[] }) {
  return (
    <ul className="divide-y divide-[var(--border-soft)]">
      {materiais.map((m) => (
        <li key={m.id}>
          <Link
            href={rota(v, `/materias/${trilhaId}`, `#material-${m.id}`)}
            className="flex items-center gap-3 min-h-12 py-2 text-sm hover:text-[var(--gold-text)]"
          >
            <Bolinha feito={m.concluido} />
            <span className="flex-1">{m.titulo}</span>
            <span className="sr-only">{m.concluido ? "concluído" : "a fazer"}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function TelaTrilha({ v }: { v: Visao }) {
  const supabase = await createClient();
  const idioma = v.idioma;
  const lib = await getLiberados(supabase, v);
  const [todas, { data: programas }, { data: ordemPrograma }] = await Promise.all([
    getTrilhasDoAluno(supabase, v.alunoId, idioma, lib),
    supabase.from("turma_membros").select("turma_id, turmas(nome, idioma)").eq("aluno_id", v.alunoId),
    supabase.from("programa_materias").select("materia_id, ordem"),
  ]);
  const ordem = new Map((ordemPrograma ?? []).map((o) => [o.materia_id, o.ordem]));
  const trilhas = todas
    .filter((t) => t.categoria === "trilha")
    .sort((a, b) => (ordem.get(a.id) ?? 999) - (ordem.get(b.id) ?? 999));
  const nomePrograma = (programas ?? [])
    .map((p) => p.turmas as unknown as { nome: string; idioma: string } | null)
    .filter((p) => p && doIdioma(p.idioma, idioma))
    .map((p) => p!.nome)[0];

  const total = trilhas.reduce((a, t) => a + t.total, 0);
  const feitos = trilhas.reduce((a, t) => a + t.concluidos, 0);
  const geral = pct(feitos, total);

  return (
    <div>
      <CabecalhoPagina sobretitulo="Minha trilha" titulo={nomePrograma ?? "O caminho do seu programa"} />

      {trilhas.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">
          Sua trilha ainda não foi liberada. Assim que a sua professora liberar, ela aparece aqui.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-5 rounded-[20px] bg-[var(--navy)] text-[var(--on-navy)] p-5">
            <div
              className="w-16 h-16 shrink-0 rounded-full flex items-center justify-center"
              style={{ background: `conic-gradient(var(--gold) 0 ${geral}%, var(--navy-2) ${geral}% 100%)` }}
              aria-hidden="true"
            >
              <span className="w-[50px] h-[50px] rounded-full bg-[var(--navy)] flex items-center justify-center text-sm font-semibold">
                {geral}%
              </span>
            </div>
            <div>
              <p className="text-[15px] font-semibold">
                {feitos} de {total} aulas concluídas
              </p>
              <p className="text-sm text-[var(--on-navy-muted)]">
                {v.objetivo ? `Meta: ${v.objetivo}` : "Continue no seu ritmo."}
              </p>
            </div>
          </div>

          {trilhas.map((t, i) => {
            const p = pct(t.concluidos, t.total);
            return (
              <details
                key={t.id}
                open={i === 0}
                className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden"
              >
                <summary className="flex items-center gap-4 p-4 cursor-pointer list-none min-h-[72px]">
                  <span className="w-9 h-9 shrink-0 rounded-full bg-[var(--navy)] text-[var(--gold-light)] font-serif text-lg font-semibold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[15px] font-semibold">{t.titulo}</span>
                    <span className="block text-xs text-[var(--text-secondary)]">
                      {t.concluidos} de {t.total} · {p}%
                    </span>
                  </span>
                  <svg
                    className="transition-transform group-open:rotate-180 text-[var(--text-secondary)]"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <div className="border-t border-[var(--border-soft)] px-4 pb-4 space-y-4">
                  {t.fases.map((fase) => (
                    <div key={fase.id} className="pt-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                        {fase.titulo}
                      </p>
                      <ListaMateriais v={v} trilhaId={t.id} materiais={fase.materiais} />
                    </div>
                  ))}
                  {t.materiaisSemFase.length > 0 && (
                    <div className="pt-1">
                      <ListaMateriais v={v} trilhaId={t.id} materiais={t.materiaisSemFase} />
                    </div>
                  )}
                  <Link
                    href={rota(v, `/materias/${t.id}`)}
                    className="inline-block text-sm font-semibold text-[var(--gold-text)]"
                  >
                    Abrir o módulo completo →
                  </Link>
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
