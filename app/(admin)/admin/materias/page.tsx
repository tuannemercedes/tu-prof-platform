import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createMateria, deleteMateria, updateMateriaCategoria } from "./actions";
import CategoriaSelect from "@/components/categoria-select";

type Materia = {
  id: string;
  titulo: string;
  categoria: string;
  materiais: { count: number }[];
};

function MateriaList({ materias }: { materias: Materia[] }) {
  if (!materias.length) {
    return <p className="p-4 text-sm text-gray-500 border border-gray-200 rounded-lg">Nenhuma ainda.</p>;
  }

  return (
    <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
      {materias.map((materia) => (
        <li key={materia.id} className="p-4 flex items-center justify-between gap-4">
          <Link href={`/admin/materias/${materia.id}`} className="flex-1">
            <p className="text-sm font-medium hover:underline">{materia.titulo}</p>
            <p className="text-xs text-gray-500">
              {materia.materiais[0]?.count ?? 0} material(is)
            </p>
          </Link>
          <form action={updateMateriaCategoria} className="flex items-center gap-2">
            <input type="hidden" name="id" value={materia.id} />
            <CategoriaSelect defaultValue={materia.categoria} />
          </form>
          <form action={deleteMateria}>
            <input type="hidden" name="id" value={materia.id} />
            <button type="submit" className="text-xs text-gray-400 hover:text-red-600">
              Excluir
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}

export default async function MateriasPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("materias")
    .select("id, titulo, categoria, materiais(count)")
    .order("titulo");

  const materias = (data ?? []) as unknown as Materia[];
  const trilhas = materias.filter((m) => m.categoria !== "fia");
  const fia = materias.filter((m) => m.categoria === "fia");

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold">Matérias</h1>
        <p className="text-sm text-gray-500">
          Cada matéria agrupa os materiais (HTML interativo, PDFs, vídeos,
          playlists, podcasts, links). Escolha se ela é uma{" "}
          <strong>trilha de aprendizagem</strong> (assunto principal, ex:
          &quot;Espanhol Básico&quot;) ou <strong>FIA</strong> (ferramenta
          extra, ex: &quot;Playlists&quot;, &quot;Filmes e Séries&quot;,
          &quot;Biblioteca&quot;, &quot;Flashcards&quot;) — isso define em
          qual seção da barra lateral o aluno vê ela.
        </p>
      </div>

      <form action={createMateria} className="flex flex-wrap gap-2">
        <input
          type="text"
          name="titulo"
          required
          placeholder="Nome da matéria"
          className="flex-1 min-w-[180px] rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <select
          name="categoria"
          defaultValue="trilha"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="trilha">Trilha de aprendizagem</option>
          <option value="fia">FIA (ferramenta extra)</option>
        </select>
        <button
          type="submit"
          className="rounded-md bg-black text-white text-sm font-medium px-4 py-2"
        >
          Criar
        </button>
      </form>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Trilhas de aprendizagem
        </h2>
        <MateriaList materias={trilhas} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          FIA
        </h2>
        <MateriaList materias={fia} />
      </section>
    </div>
  );
}
