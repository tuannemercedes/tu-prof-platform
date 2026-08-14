import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { updateAlunoTurmas } from "./actions";
import AddAlunoForm from "@/components/add-aluno-form";
import ResetPasswordButton from "@/components/reset-password-button";
import SubmitButton from "@/components/submit-button";

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
        <p className="text-sm text-[var(--text-secondary)]">
          Ao adicionar, uma senha é gerada — envie o e-mail e a senha pro
          aluno por fora (WhatsApp, etc). Ele entra em{" "}
          <span className="font-mono">/login</span> com esses dados. O
          cronograma e o planner agora são montados em{" "}
          <Link href="/admin/cronograma" className="underline">
            Cronograma
          </Link>{" "}
          e{" "}
          <Link href="/admin/planner" className="underline">
            Planner
          </Link>{" "}
          e liberados por turma/aluno.
        </p>
      </div>

      <AddAlunoForm turmas={turmas ?? []} />

      <ul className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-lg">
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
                    <p className="text-xs text-[var(--text-secondary)]">{aluno.email}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Link
                        href={`/admin/alunos/${aluno.id}/conteudos`}
                        className="text-xs font-medium rounded-md border border-[var(--border-strong)] px-2.5 py-1 hover:bg-[var(--surface-2)]"
                      >
                        📦 Conteúdos
                      </Link>
                      <Link
                        href={`/admin/alunos/${aluno.id}/preview`}
                        className="text-xs font-medium rounded-md border border-[var(--border-strong)] px-2.5 py-1 hover:bg-[var(--surface-2)]"
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
                  <SubmitButton className="text-xs rounded-md border border-[var(--border-strong)] px-3 py-1 hover:bg-[var(--surface-2)] whitespace-nowrap">
                    Salvar turmas
                  </SubmitButton>
                </form>
              </li>
            );
          })
        ) : (
          <li className="p-4 text-sm text-[var(--text-secondary)]">Nenhum aluno ainda.</li>
        )}
      </ul>
    </div>
  );
}
