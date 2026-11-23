import { createClient } from "@/lib/supabase/server";
import { createMateria } from "@/app/(admin)/admin/(gestao)/materias/actions";
import MateriaList, { type Materia } from "@/components/materia-list";
import SubmitButton from "@/components/submit-button";

const campo = "h-[42px] rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[15px]";

export default async function ColecoesAcervoPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("materias")
    .select("id, titulo, categoria, materiais(count)")
    .in("categoria", ["fia", "biblioteca"])
    .order("ordem")
    .order("titulo");

  const todas = (data ?? []) as unknown as Materia[];

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex flex-col gap-1.5">
        <h1 className="m-0 font-serif font-semibold text-[40px] leading-[1.05]">Coleções do acervo</h1>
        <p className="m-0 text-[15px] text-[var(--text-secondary)]">
          Coleções agrupam os itens dentro da FIA (ex.: Séries, Podcasts, Playlists) e da Biblioteca (ex.: Apostilas,
          Artigos). Não é obrigatório: ao colar um link no Acervo, o item entra numa coleção padrão.
        </p>
      </div>

      <form action={createMateria} className="flex flex-wrap gap-2">
        <input type="text" name="titulo" required placeholder="Nome da coleção" aria-label="Nome da coleção" className={`${campo} flex-1 min-w-[200px]`} />
        <select name="categoria" defaultValue="fia" aria-label="Área" className={campo}>
          <option value="fia">FIA</option>
          <option value="biblioteca">Biblioteca</option>
        </select>
        <SubmitButton className="h-[42px] px-4 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-semibold" pendingText="Criando..." savedText="✓ Criada">
          Criar coleção
        </SubmitButton>
      </form>

      <section className="flex flex-col gap-2">
        <h2 className="m-0 font-serif font-semibold text-2xl">FIA</h2>
        <MateriaList materias={todas.filter((m) => m.categoria === "fia")} />
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="m-0 font-serif font-semibold text-2xl">Biblioteca</h2>
        <MateriaList materias={todas.filter((m) => m.categoria === "biblioteca")} />
      </section>
    </div>
  );
}
