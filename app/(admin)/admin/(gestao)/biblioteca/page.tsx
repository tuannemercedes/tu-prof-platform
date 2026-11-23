import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { rotuloIdioma } from "@/lib/programas";
import BibliotecaAdicionar from "@/components/biblioteca-adicionar";
import { excluirItemBiblioteca } from "./actions";

const TIPO: Record<string, string> = {
  html: "Página",
  pdf: "PDF",
  video: "Vídeo",
  playlist: "Playlist",
  podcast: "Podcast",
  link_externo: "Link",
};

type Row = {
  id: string;
  titulo: string;
  tipo: string;
  idioma: string;
  visivel_todos: boolean;
  materias: { titulo: string; categoria: string } | null;
  material_turmas: { turmas: { nome: string } | null }[];
  material_alunos: { profiles: { nome: string | null; email: string } | null }[];
};

export default async function BibliotecaEquipePage() {
  const supabase = await createClient();
  const [{ data: itens }, { data: turmas }, { data: alunos }, { data: colecoes }, { count: termos }] = await Promise.all([
    supabase
      .from("materiais")
      .select(
        "id, titulo, tipo, idioma, visivel_todos, materias!inner(titulo, categoria), material_turmas(turmas(nome)), material_alunos(profiles(nome, email))"
      )
      .eq("materias.categoria", "fia")
      .order("created_at", { ascending: false }),
    supabase.from("turmas").select("id, nome").order("ordem").order("nome"),
    supabase.from("profiles").select("id, nome, email").eq("role", "aluno").order("nome"),
    supabase.from("materias").select("id, titulo").eq("categoria", "fia").order("ordem"),
    supabase.from("glossario_termos").select("*", { count: "exact", head: true }),
  ]);

  const quemVe = (r: Row) => {
    if (r.visivel_todos) return "Todos os alunos";
    const partes = [
      ...r.material_turmas.map((t) => t.turmas?.nome).filter(Boolean),
      ...r.material_alunos.map((a) => (a.profiles ? `Só ${a.profiles.nome || a.profiles.email}` : null)).filter(Boolean),
    ];
    return partes.join(", ") || "Ninguém ainda";
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="m-0 font-serif font-semibold text-[40px] leading-[1.05]">Biblioteca</h1>
        <p className="m-0 text-[15px] text-[var(--text-secondary)]">
          Materiais, FIA e glossário num lugar só. Para adicionar, é só colar o link.
        </p>
      </div>

      <BibliotecaAdicionar
        turmas={turmas ?? []}
        alunos={(alunos ?? []).map((a) => ({ id: a.id, nome: a.nome || a.email }))}
        colecoes={colecoes ?? []}
      />

      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-[22px] flex flex-col gap-3.5">
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <h2 className="m-0 font-serif font-semibold text-[26px]">Na biblioteca</h2>
          <div className="flex gap-4 text-sm font-semibold text-[var(--gold-text)]">
            <Link href="/admin/glossario">Glossário ({termos ?? 0} termos) →</Link>
            <Link href="/admin/fia">Coleções da FIA →</Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-[var(--text-secondary)] text-xs tracking-[0.06em] uppercase">
                <th className="py-2.5 px-2 font-semibold">Item</th>
                <th className="py-2.5 px-2 font-semibold">Tipo</th>
                <th className="py-2.5 px-2 font-semibold">Idioma</th>
                <th className="py-2.5 px-2 font-semibold">Quem vê</th>
                <th className="py-2.5 px-2" />
              </tr>
            </thead>
            <tbody>
              {((itens ?? []) as unknown as Row[]).map((r) => (
                <tr key={r.id} className="border-t border-[var(--border-soft)]">
                  <td className="py-3 px-2 font-semibold">{r.titulo}</td>
                  <td className="py-3 px-2">{TIPO[r.tipo] ?? r.tipo}</td>
                  <td className="py-3 px-2">{rotuloIdioma(r.idioma)}</td>
                  <td className="py-3 px-2 text-[var(--text-secondary)]">{quemVe(r)}</td>
                  <td className="py-3 px-2 text-right">
                    <form action={excluirItemBiblioteca}>
                      <input type="hidden" name="id" value={r.id} />
                      <button type="submit" className="text-xs text-[var(--text-faint)] hover:text-[var(--danger-text)]">
                        Excluir
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {!itens?.length && (
                <tr>
                  <td colSpan={5} className="py-4 px-2 text-[var(--text-secondary)]">
                    A biblioteca ainda está vazia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
