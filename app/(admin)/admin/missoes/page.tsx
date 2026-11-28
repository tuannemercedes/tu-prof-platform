import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/dal";
import SubmitButton from "@/components/submit-button";
import { dataHora } from "@/lib/data-hora";
import { comentarMissao } from "./actions";
import { diasUteisDesde, PRAZO_MISSAO_DIAS_UTEIS } from "@/lib/dias-uteis";

type Filtro = "pendentes" | "comentadas" | "todas";

function horasDesde(iso: string) {
  return (Date.now() - new Date(iso).getTime()) / 36e5;
}

function espera(iso: string) {
  const h = horasDesde(iso);
  if (h < 1) return "agora há pouco";
  if (h < 24) return `há ${Math.floor(h)} h`;
  const d = Math.floor(h / 24);
  return d === 1 ? "há 1 dia" : `há ${d} dias`;
}

export default async function MissoesPage({ searchParams }: { searchParams: Promise<{ f?: string; aluno?: string }> }) {
  await requireStaff();
  const { f, aluno } = await searchParams;
  const filtro: Filtro = f === "comentadas" || f === "todas" ? f : "pendentes";
  const supabase = await createClient();

  let q = supabase
    .from("missao_entregas")
    .select(
      "id, created_at, texto, audio_path, comentario, comentario_em, comentario_nome, precisa_correcao, aluno_id, aluno:profiles!missao_entregas_aluno_id_fkey(nome), material:materiais(titulo, materia_id, fase:fases(titulo), materia:materias(titulo))",
    )
    .order("created_at", { ascending: filtro === "pendentes" })
    .limit(100);
  if (filtro === "pendentes") q = q.is("comentario_em", null).eq("precisa_correcao", true);
  if (filtro === "comentadas") q = q.not("comentario_em", "is", null);
  if (aluno) q = q.eq("aluno_id", aluno);
  const [{ data: entregas }, { count: pendentes }] = await Promise.all([
    q,
    supabase.from("missao_entregas").select("id", { count: "exact", head: true }).is("comentario_em", null).eq("precisa_correcao", true),
  ]);

  const lista = await Promise.all(
    (entregas ?? []).map(async (e) => ({
      ...e,
      audioUrl: e.audio_path ? ((await supabase.storage.from("entregas").createSignedUrl(e.audio_path, 3600)).data?.signedUrl ?? null) : null,
    })),
  );
  type Rel<T> = T | T[] | null;
  const um = <T,>(x: Rel<T>) => (Array.isArray(x) ? x[0] : x) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="m-0 font-serif font-semibold text-[40px] leading-[1.05]">Missões</h1>
        <p className="m-0 text-[15px] text-[var(--text-secondary)] max-w-2xl">
          As Missões que os alunos entregaram nas aulas. Ouça, deixe um comentário curto de correção e ele aparece para o aluno na própria aula
          (e chega por e-mail). O combinado é comentar em até {PRAZO_MISSAO_DIAS_UTEIS} dias úteis; as mais antigas aparecem primeiro. Missões de
          «só marcar que fez» não entram aqui: aparecem em Todas.
        </p>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {[
          { v: "pendentes", l: `Aguardando comentário${pendentes ? ` · ${pendentes}` : ""}` },
          { v: "comentadas", l: "Comentadas" },
          { v: "todas", l: "Todas" },
        ].map((x) => (
          <Link
            key={x.v}
            href={`/admin/missoes?f=${x.v}${aluno ? `&aluno=${aluno}` : ""}`}
            aria-current={filtro === x.v ? "page" : undefined}
            className={`h-9 px-3.5 rounded-full text-sm font-semibold flex items-center border ${
              filtro === x.v ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)]" : "bg-[var(--surface)] border-[var(--border-strong)]"
            }`}
          >
            {x.l}
          </Link>
        ))}
        {aluno && (
          <Link href={`/admin/missoes?f=${filtro}`} className="h-9 px-3.5 rounded-full text-sm font-semibold flex items-center gap-2 border border-[var(--border-strong)]">
            Só de {um(lista[0]?.aluno as Rel<{ nome: string | null }>)?.nome ?? "um aluno"} <span aria-hidden="true">✕</span>
          </Link>
        )}
      </div>

      {lista.length ? (
        <div className="flex flex-col gap-4">
          {lista.map((e) => {
            const al = um(e.aluno as Rel<{ nome: string | null }>);
            const mat = um(e.material as Rel<{ titulo: string; materia_id: string; fase: Rel<{ titulo: string }>; materia: Rel<{ titulo: string }> }>);
            const atrasada = !e.comentario_em && e.precisa_correcao && diasUteisDesde(e.created_at) >= PRAZO_MISSAO_DIAS_UTEIS;
            return (
              <article key={e.id} className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-3">
                <header className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex flex-col">
                    <Link href={`/admin/alunos/${e.aluno_id}`} className="font-semibold text-[16px] hover:underline">
                      {al?.nome ?? "Aluno"}
                    </Link>
                    <span className="text-[13px] text-[var(--text-secondary)]">
                      {um(mat?.materia ?? null)?.titulo} · {um(mat?.fase ?? null)?.titulo ?? mat?.titulo}
                    </span>
                  </div>
                  <span className={`text-xs font-semibold ${atrasada ? "text-[var(--warning-text)]" : "text-[var(--text-secondary)]"}`}>
                    {e.precisa_correcao ? "Enviada em" : "Marcou como feita em"} {dataHora(e.created_at)} · {espera(e.created_at)}
                    {atrasada ? " · passou do prazo" : ""}
                  </span>
                </header>
                {e.audioUrl && <audio src={e.audioUrl} controls preload="none" className="w-full" />}
                {e.texto && <p className="m-0 text-[15px] whitespace-pre-wrap rounded-xl bg-[var(--surface-2)] px-4 py-3">{e.texto}</p>}
                <form action={comentarMissao} className="flex flex-col gap-2">
                  <input type="hidden" name="id" value={e.id} />
                  <textarea
                    name="comentario"
                    rows={3}
                    defaultValue={e.comentario ?? ""}
                    placeholder="Comentário de correção para o aluno: o que ficou bom e um ponto para treinar."
                    aria-label={`Comentário para ${al?.nome ?? "o aluno"}`}
                    className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-[15px]"
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <SubmitButton className="h-10 px-4 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-semibold" pendingText="Salvando...">
                      {e.comentario ? "Atualizar comentário" : "Enviar comentário"}
                    </SubmitButton>
                    {e.comentario_em && (
                      <span className="text-xs text-[var(--text-secondary)]">
                        Comentado por {e.comentario_nome ?? "equipe"} em {dataHora(e.comentario_em)}
                      </span>
                    )}
                    <Link href={`/admin/missoes?f=todas&aluno=${e.aluno_id}`} className="text-xs text-[var(--gold-text)] font-semibold ml-auto">
                      Ver todas deste aluno
                    </Link>
                  </div>
                </form>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[18px] border border-dashed border-[var(--border-strong)] p-8 text-center text-sm text-[var(--text-secondary)]">
          {filtro === "pendentes" ? "Nenhuma Missão aguardando comentário. Tudo em dia." : "Nenhuma Missão por aqui ainda."}
        </div>
      )}
    </div>
  );
}
