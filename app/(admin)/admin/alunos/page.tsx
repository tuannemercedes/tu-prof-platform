import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { updateAlunoTurmas } from "./actions";
import AddAlunoForm from "@/components/add-aluno-form";
import ResetPasswordButton from "@/components/reset-password-button";

export default async function AlunosPage() {
  const supabase = await createClient();

  const [{ data: alunos }, { data: turmas }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, nome, email, turma_membros(turma_id)")
      .eq("role", "aluno")
      .order("nome"),
    supabase.from("turmas").select("id, nome").order("nome"),
  ]);

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold">Alunos</h1>
        <p className="text-sm text-gray-500">
          Ao adicionar, uma senha é gerada — envie o e-mail e a senha pro
          aluno por fora (WhatsApp, etc). Ele entra em{" "}
          <span className="font-mono">/login</span> com esses dados. Use os
          botões <strong>Cronograma</strong> e <strong>Planner</strong> em
          cada aluno para montar a trajetória e as tarefas individuais dele.
        </p>
      </div>

      <AddAlunoForm turmas={turmas ?? []} />

      <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
        {alunos?.length ? (
          alunos.map((aluno) => {
            const turmaIdsDoAluno = new Set(
              (aluno.turma_membros as { turma_id: string }[]).map((t) => t.turma_id)
            );
            return (
              <li key={aluno.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{aluno.nome || aluno.email}</p>
                    <p className="text-xs text-gray-500">{aluno.email}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Link
                        href={`/admin/alunos/${aluno.id}/cronograma`}
                        className="text-xs font-medium rounded-md border border-gray-300 px-2.5 py-1 hover:bg-gray-50"
                      >
                        📅 Cronograma
                      </Link>
                      <Link
                        href={`/admin/alunos/${aluno.id}/planner`}
                        className="text-xs font-medium rounded-md border border-gray-300 px-2.5 py-1 hover:bg-gray-50"
                      >
                        ✅ Planner
                      </Link>
                      <Link
                        href={`/admin/alunos/${aluno.id}/preview`}
                        className="text-xs font-medium rounded-md border border-gray-300 px-2.5 py-1 hover:bg-gray-50"
                      >
                        👁️ Visualizar
                      </Link>
                    </div>
                  </div>
                  <ResetPasswordButton alunoId={aluno.id} />
                </div>
                <form action={updateAlunoTurmas} className="flex flex-wrap items-center gap-3">
                  <input type="hidden" name="aluno_id" value={aluno.id} />
                  {turmas?.map((turma) => (
                    <label key={turma.id} className="flex items-center gap-1.5 text-xs">
                      <input
                        type="checkbox"
                        name="turmas"
                        value={turma.id}
                        defaultChecked={turmaIdsDoAluno.has(turma.id)}
                      />
                      {turma.nome}
                    </label>
                  ))}
                  <button
                    type="submit"
                    className="text-xs rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-50"
                  >
                    Salvar turmas
                  </button>
                </form>
              </li>
            );
          })
        ) : (
          <li className="p-4 text-sm text-gray-500">Nenhum aluno ainda.</li>
        )}
      </ul>
    </div>
  );
}
