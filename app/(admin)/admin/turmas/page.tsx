import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createTurma, deleteTurma, updateTurmaCalendario } from "./actions";

export default async function TurmasPage() {
  const supabase = await createClient();
  const { data: turmas } = await supabase
    .from("turmas")
    .select("id, nome, calendario_embed_url, turma_membros(count)")
    .order("nome");

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold">Turmas</h1>
        <p className="text-sm text-gray-500">
          Grupos de alunos (ex: turma geral, um clube de conversação). Cada
          material pode ser liberado por turma.
        </p>
      </div>

      <form action={createTurma} className="flex gap-2">
        <input
          type="text"
          name="nome"
          required
          placeholder="Nome da turma"
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
        {turmas?.length ? (
          turmas.map((turma) => (
            <li key={turma.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-sm">{turma.nome}</p>
                  <p className="text-xs text-gray-500">
                    {(turma.turma_membros as unknown as { count: number }[])[0]?.count ?? 0}{" "}
                    aluno(s)
                  </p>
                  <Link
                    href={`/admin/turmas/${turma.id}/conteudos`}
                    className="text-xs font-medium rounded-md border border-gray-300 px-2.5 py-1 hover:bg-gray-50 inline-block mt-2"
                  >
                    📦 Conteúdos
                  </Link>
                </div>
                <form action={deleteTurma}>
                  <input type="hidden" name="id" value={turma.id} />
                  <button
                    type="submit"
                    className="text-xs text-gray-400 hover:text-red-600"
                  >
                    Excluir
                  </button>
                </form>
              </div>
              <form action={updateTurmaCalendario} className="space-y-1">
                <input type="hidden" name="id" value={turma.id} />
                <label className="text-xs font-medium text-gray-600 block">
                  📅 Calendário (Google Calendar)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    name="calendario_embed_url"
                    defaultValue={turma.calendario_embed_url ?? ""}
                    placeholder="Cole aqui o link de embed do Google Calendar"
                    className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-xs"
                  />
                  <button
                    type="submit"
                    className="text-xs rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-50"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </li>
          ))
        ) : (
          <li className="p-4 text-sm text-gray-500">Nenhuma turma ainda.</li>
        )}
      </ul>
    </div>
  );
}
