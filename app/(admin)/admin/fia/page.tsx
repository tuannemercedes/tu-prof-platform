import { createClient } from "@/lib/supabase/server";
import { createMateria } from "@/app/(admin)/admin/materias/actions";
import MateriaList, { type Materia } from "@/components/materia-list";
import SubmitButton from "@/components/submit-button";

export default async function FiaPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("materias")
    .select("id, titulo, categoria, materiais(count)")
    .eq("categoria", "fia")
    .order("ordem")
    .order("titulo");

  const fia = (data ?? []) as unknown as Materia[];

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold">FIA</h1>
        <p className="text-sm text-[var(--text-secondary)]">
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
          className="bg-[var(--surface)] flex-1 rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
        />
        <SubmitButton
          className="rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-4 py-2 btn-glow whitespace-nowrap"
          pendingText="Criando..."
          savedText="✓ Criado!"
        >
          Criar
        </SubmitButton>
      </form>

      <MateriaList materias={fia} />
    </div>
  );
}
