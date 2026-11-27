import { urlCapa } from "@/lib/capas";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTrilhasDoAluno, pct } from "@/lib/trilhas";
import CabecalhoPagina from "@/components/cabecalho-pagina";
import { doIdioma } from "@/lib/idioma";
import { getLiberados, rota, type Visao } from "@/lib/visao";

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

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {trilhas.map((t, i) => {
              const p = pct(t.concluidos, t.total);
              const capa = urlCapa(supabase, t.capa_path);
              const atual = i === trilhas.findIndex((x) => x.concluidos < x.total);
              return (
                <Link
                  key={t.id}
                  href={rota(v, `/materias/${t.id}`)}
                  className="modulo-card group relative block rounded-[20px] overflow-hidden aspect-[4/5] sm:aspect-[3/4]"
                >
                  {capa ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={capa} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="capa-padrao absolute inset-0" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060d18] via-[#060d18]/55 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="rounded-full bg-black/45 backdrop-blur px-2.5 py-1 text-[11px] font-semibold text-white tracking-wide">
                      Módulo {i + 1}
                    </span>
                    {atual && (
                      <span className="botao-ouro rounded-full px-2.5 py-1 text-[11px] font-semibold">Continue aqui</span>
                    )}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col gap-2 text-white">
                    <span className="font-serif font-semibold text-[22px] leading-tight">{t.titulo}</span>
                    {t.descricao && <span className="text-[13px] text-white/75 line-clamp-2">{t.descricao}</span>}
                    <div className="flex items-center gap-2.5 pt-1">
                      <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
                        <div className="h-full rounded-full bg-[linear-gradient(90deg,#e9cf8a,#c9a24d)]" style={{ width: `${p}%` }} />
                      </div>
                      <span className="text-xs text-white/80 whitespace-nowrap">
                        {p === 100 ? "Concluído" : `${t.concluidos} de ${t.total}`}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
