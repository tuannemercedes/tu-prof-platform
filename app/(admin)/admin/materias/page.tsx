import { createClient } from "@/lib/supabase/server";
import { createMateria } from "./actions";
import MateriaList, { type Materia } from "@/components/materia-list";

export default async function MateriasPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("materias")
    .select("id, titulo, categoria, materiais(count)")
    .eq("categoria", "trilha")
    .order("titulo");

  const trilhas = (data ?? []) as unknown as Materia[];

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold">Matérias</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Trilhas de aprendizagem — os assuntos principais (ex: &quot;Espanhol
          Básico&quot;). Cada uma agrupa materiais (HTML interativo, PDFs,
          vídeos, links). Pra playlists, filmes, biblioteca e afins, use a
          seção <strong>FIA</strong> no menu.
        </p>
      </div>

      <form action={createMateria} className="flex gap-2">
        <input type="hidden" name="categoria" value="trilha" />
        <input
          type="text"
          name="titulo"
          required
          placeholder="Nome da matéria"
          className="bg-[var(--surface)] flex-1 rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-4 py-2 btn-glow"
        >
          Criar
        </button>
      </form>

      <MateriaList materias={trilhas} />
    </div>
  );
}
