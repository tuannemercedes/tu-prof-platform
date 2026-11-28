import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { urlCapa } from "@/lib/capas";
import { rotuloIdioma } from "@/lib/programas";
import SubmitButton from "@/components/submit-button";
import { criarModuloNoPrograma } from "./actions";

const campo = "h-[42px] rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[15px]";

export default async function ModulosPage({ searchParams }: { searchParams: Promise<{ idioma?: string }> }) {
  const { idioma = "todos" } = await searchParams;
  const supabase = await createClient();
  const [{ data: materias }, { data: vinculos }, { data: turmas }] = await Promise.all([
    supabase.from("materias").select("id, titulo, descricao, capa_path, materiais(count)").eq("categoria", "trilha").order("ordem").order("titulo"),
    supabase.from("programa_materias").select("turma_id, materia_id"),
    supabase.from("turmas").select("id, nome, idioma").order("nome"),
  ]);

  const programasDe = (id: string) =>
    (vinculos ?? [])
      .filter((v) => v.materia_id === id)
      .map((v) => (turmas ?? []).find((t) => t.id === v.turma_id))
      .filter((t): t is NonNullable<typeof t> => !!t);
  const lista = (materias ?? []).filter(
    (m) =>
      idioma === "todos" ||
      programasDe(m.id).some((t) => t.idioma === idioma || t.idioma === "espanhol_ingles") ||
      (idioma === "sem" && !programasDe(m.id).length),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-4 items-end justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="m-0 font-serif font-semibold text-[40px] leading-[1.05]">Módulos</h1>
          <p className="m-0 text-[15px] text-[var(--text-secondary)] max-w-2xl">
            Cada módulo tem capa, etapas e aulas (vídeo, página interativa, PDF, link). Inclua o módulo num programa para os alunos verem na Trilha.
          </p>
        </div>
        <form action={criarModuloNoPrograma} className="flex flex-wrap gap-2">
          <input name="titulo" required placeholder="Nome do novo módulo" aria-label="Nome do novo módulo" className={campo} />
          <select name="turma_id" defaultValue="" aria-label="Programa" className={campo}>
            <option value="">Sem programa por enquanto</option>
            {(turmas ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                No programa: {t.nome}
              </option>
            ))}
          </select>
          <SubmitButton
            className="h-11 px-[18px] rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold text-sm"
            pendingText="Criando..."
          >
            Criar módulo
          </SubmitButton>
        </form>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {[
          { v: "todos", l: "Todos" },
          { v: "espanhol", l: "Espanhol" },
          { v: "ingles", l: "Inglês" },
          { v: "sem", l: "Fora de programas" },
        ].map((f) => (
          <Link
            key={f.v}
            href={`/admin/materias?idioma=${f.v}`}
            aria-current={idioma === f.v ? "page" : undefined}
            className={`h-9 px-3.5 rounded-full text-sm font-semibold flex items-center border ${
              idioma === f.v
                ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)]"
                : "bg-[var(--surface)] border-[var(--border-strong)]"
            }`}
          >
            {f.l}
          </Link>
        ))}
      </div>

      {lista.length ? (
        <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
          {lista.map((m) => {
            const capa = urlCapa(supabase, m.capa_path);
            const progs = programasDe(m.id);
            const n = (m.materiais as unknown as { count: number }[])[0]?.count ?? 0;
            return (
              <Link
                key={m.id}
                href={`/admin/materias/${m.id}`}
                className="group flex flex-col rounded-[18px] overflow-hidden border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--gold)] transition-colors"
              >
                <div className="aspect-video overflow-hidden">
                  {capa ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={capa} alt="" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                  ) : (
                    <div className="capa-padrao w-full h-full" />
                  )}
                </div>
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <span className="font-serif text-[18px] font-semibold leading-tight">{m.titulo}</span>
                  {m.descricao && <span className="text-[13px] text-[var(--text-secondary)] line-clamp-2">{m.descricao}</span>}
                  <span className="mt-auto pt-1 flex flex-wrap gap-1.5 text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-[var(--surface-2)] font-semibold">
                      {n} {n === 1 ? "aula" : "aulas"}
                    </span>
                    {progs.length ? (
                      progs.map((t) => (
                        <span key={t.id} className="px-2 py-0.5 rounded-md bg-[var(--info-bg)] text-[var(--info-text)]">
                          {t.nome} · {rotuloIdioma(t.idioma)}
                        </span>
                      ))
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-[var(--warning-bg)] text-[var(--warning-text)]">fora de programas</span>
                    )}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-[var(--text-secondary)]">Nenhum módulo aqui ainda.</p>
      )}
    </div>
  );
}
