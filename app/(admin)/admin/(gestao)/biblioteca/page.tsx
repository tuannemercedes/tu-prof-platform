import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { rotuloIdioma } from "@/lib/programas";
import { capaDoItem, TIPO_ROTULO } from "@/lib/capas";
import BibliotecaAdicionar from "@/components/biblioteca-adicionar";
import { excluirItemBiblioteca } from "./actions";

type Row = {
  id: string;
  titulo: string;
  tipo: string;
  url: string | null;
  capa_url: string | null;
  capa_path: string | null;
  idioma: string;
  visivel_todos: boolean;
  materias: { titulo: string; categoria: string } | null;
  material_turmas: { turmas: { nome: string } | null }[];
  material_alunos: { profiles: { nome: string | null; email: string } | null }[];
};

export default async function AcervoEquipePage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; idioma?: string }>;
}) {
  const { area = "fia", idioma = "todos" } = await searchParams;
  const supabase = await createClient();
  const [{ data: itens }, { data: turmas }, { data: alunos }, { data: colecoes }, { count: termos }] = await Promise.all([
    supabase
      .from("materiais")
      .select(
        "id, titulo, tipo, url, capa_url, capa_path, idioma, visivel_todos, materias!inner(titulo, categoria), material_turmas(turmas(nome)), material_alunos(profiles(nome, email))"
      )
      .in("materias.categoria", ["fia", "biblioteca"])
      .order("created_at", { ascending: false }),
    supabase.from("turmas").select("id, nome").order("ordem").order("nome"),
    supabase.from("profiles").select("id, nome, email").eq("role", "aluno").order("nome"),
    supabase.from("materias").select("id, titulo, categoria").in("categoria", ["fia", "biblioteca"]).order("ordem"),
    supabase.from("glossario_termos").select("*", { count: "exact", head: true }),
  ]);

  const lista = ((itens ?? []) as unknown as Row[]).filter(
    (r) => r.materias?.categoria === area && (idioma === "todos" || r.idioma === idioma || r.idioma === "espanhol_ingles")
  );

  const quemVe = (r: Row) => {
    if (r.visivel_todos) return "Todos os alunos";
    const partes = [
      ...r.material_turmas.map((t) => t.turmas?.nome).filter(Boolean),
      ...r.material_alunos.map((a) => (a.profiles ? `Só ${a.profiles.nome || a.profiles.email}` : null)).filter(Boolean),
    ];
    return partes.join(", ") || "Ninguém ainda";
  };

  const link = (a: string, i: string) => `/admin/biblioteca?area=${a}&idioma=${i}`;
  const chip = (on: boolean) =>
    `h-10 px-4 rounded-full text-sm font-medium flex items-center border ${
      on ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)]" : "bg-[var(--surface)] border-[var(--border-strong)]"
    }`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="m-0 font-serif font-semibold text-[40px] leading-[1.05]">Acervo</h1>
        <p className="m-0 text-[15px] text-[var(--text-secondary)]">
          FIA para praticar (séries, filmes, podcasts, playlists) e Biblioteca para estudar (leituras, PDFs, glossário).
          Para adicionar, é só colar o link.
        </p>
      </div>

      <BibliotecaAdicionar
        turmas={turmas ?? []}
        alunos={(alunos ?? []).map((a) => ({ id: a.id, nome: a.nome || a.email }))}
        colecoes={colecoes ?? []}
      />

      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-[22px] flex flex-col gap-4">
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <div className="flex gap-2">
            <Link href={link("fia", idioma)} className={chip(area === "fia")}>
              FIA
            </Link>
            <Link href={link("biblioteca", idioma)} className={chip(area === "biblioteca")}>
              Biblioteca
            </Link>
          </div>
          <div className="flex gap-2">
            {[
              { v: "todos", l: "Todos os idiomas" },
              { v: "espanhol", l: "Espanhol" },
              { v: "ingles", l: "Inglês" },
            ].map((i) => (
              <Link key={i.v} href={link(area, i.v)} className={chip(idioma === i.v)}>
                {i.l}
              </Link>
            ))}
          </div>
        </div>

        {area === "biblioteca" && (
          <Link href="/admin/glossario" className="text-sm font-semibold text-[var(--gold-text)]">
            Glossário ({termos ?? 0} termos), também aparece na Biblioteca →
          </Link>
        )}

        {lista.length ? (
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(190px,1fr))]">
            {lista.map((r) => {
              const capa = capaDoItem({
                url: r.url,
                capa_url: r.capa_url,
                capa_publica: r.capa_path ? supabase.storage.from("capas").getPublicUrl(r.capa_path).data.publicUrl : null,
              });
              return (
                <div key={r.id} className="flex flex-col gap-2">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--navy)]">
                    {capa ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={capa} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <span className="absolute inset-0 p-3 flex items-end font-serif text-lg font-semibold leading-tight text-[var(--gold-light)]">
                        {r.titulo}
                      </span>
                    )}
                    <span className="absolute top-2 left-2 text-[11px] font-semibold px-2 py-1 rounded-lg bg-[var(--navy)]/85 text-[var(--gold-light)]">
                      {TIPO_ROTULO[r.tipo] ?? r.tipo}
                    </span>
                  </div>
                  <span className="text-sm font-semibold leading-snug line-clamp-2">{r.titulo}</span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {rotuloIdioma(r.idioma)} · {quemVe(r)}
                  </span>
                  <form action={excluirItemBiblioteca}>
                    <input type="hidden" name="id" value={r.id} />
                    <button type="submit" className="text-xs text-[var(--text-faint)] hover:text-[var(--danger-text)]">
                      Excluir
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="m-0 text-sm text-[var(--text-secondary)]">
            Nenhum item {area === "fia" ? "na FIA" : "na Biblioteca"} {idioma !== "todos" ? `em ${rotuloIdioma(idioma)}` : ""} ainda.
          </p>
        )}
      </section>
    </div>
  );
}
