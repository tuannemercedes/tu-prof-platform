import { createClient } from "@/lib/supabase/server";
import { createMateria } from "@/app/(admin)/admin/materias/actions";
import MateriaList, { type Materia } from "@/components/materia-list";

export default async function FiaPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("materias")
    .select("id, titulo, categoria, materiais(count)")
    .eq("categoria", "fia")
    .order("titulo");

  const fia = (data ?? []) as unknown as Materia[];

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold">FIA</h1>
        <p className="text-sm text-gray-500">
          Ferramentas didáticas extras — playlists de música, filmes e
          séries, biblioteca, flashcards, e afins. Crie uma matéria pra cada
          categoria e adicione os materiais dentro (links, vídeos, PDFs).
          Aparece na barra lateral do aluno assim que tiver algo dentro.
        </p>
      </div>

      <form action={createMateria} className="flex gap-2">
        <input type="hidden" name="categoria" value="fia" />
        <input
          type="text"
          name="titulo"
          required
          placeholder="Nome (ex: Playlists, Filmes e Séries, Biblioteca)"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-black text-white text-sm font-medium px-4 py-2"
        >
          Criar
        </button>
      </form>

      <MateriaList materias={fia} />
    </div>
  );
}
