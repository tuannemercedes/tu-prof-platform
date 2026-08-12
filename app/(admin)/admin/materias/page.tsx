import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createMateria, deleteMateria } from "./actions";

export default async function MateriasPage() {
  const supabase = await createClient();
  const { data: materias } = await supabase
    .from("materias")
    .select("id, titulo, materiais(count)")
    .order("titulo");

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold">Matérias</h1>
        <p className="text-sm text-gray-500">
          Cada matéria agrupa os materiais (HTML interativo, PDFs, vídeos,
          playlists, podcasts, links).
        </p>
      </div>

      <form action={createMateria} className="flex gap-2">
        <input
          type="text"
          name="titulo"
          required
          placeholder="Nome da matéria"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-black text-white text-sm font-medium px-4 py-2"
        >
          Criar
        </button>
      </form>

      <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
        {materias?.length ? (
          materias.map((materia) => (
            <li key={materia.id} className="p-4 flex items-center justify-between gap-4">
              <Link href={`/admin/materias/${materia.id}`} className="flex-1">
                <p className="text-sm font-medium hover:underline">{materia.titulo}</p>
                <p className="text-xs text-gray-500">
                  {(materia.materiais as unknown as { count: number }[])[0]?.count ?? 0}{" "}
                  material(is)
                </p>
              </Link>
              <form action={deleteMateria}>
                <input type="hidden" name="id" value={materia.id} />
                <button type="submit" className="text-xs text-gray-400 hover:text-red-600">
                  Excluir
                </button>
              </form>
            </li>
          ))
        ) : (
          <li className="p-4 text-sm text-gray-500">Nenhuma matéria ainda.</li>
        )}
      </ul>
    </div>
  );
}
