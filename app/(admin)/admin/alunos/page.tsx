import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { updateAlunoTurmas } from "./actions";
import AddAlunoForm from "@/components/add-aluno-form";
import ResetPasswordButton from "@/components/reset-password-button";
import SubmitButton from "@/components/submit-button";
import { rotuloIdioma } from "@/lib/programas";

type Pessoa = {
  id: string;
  nome: string | null;
  email: string;
  role: string;
  professor_id: string | null;
  turma_membros: { turma_id: string }[];
};

export default async function PessoasPage() {
  const supabase = await createClient();

  const [{ data: pessoas }, { data: turmas }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, nome, email, role, professor_id, turma_membros(turma_id)")
      .in("role", ["aluno", "professor"])
      .order("nome"),
    supabase.from("turmas").select("id, nome, idioma").order("ordem").order("nome"),
  ]);

  const lista = (pessoas ?? []) as Pessoa[];
  const professores = lista.filter((p) => p.role === "professor");
  const alunos = lista.filter((p) => p.role === "aluno");
  const nomeProfessor = new Map(professores.map((p) => [p.id, p.nome || p.email]));

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-lg font-semibold">Pessoas</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Alunos e professores da Tu Prof. Ao adicionar, uma senha é gerada: envie o e-mail e a
          senha por fora (WhatsApp, e-mail). O professor vê só os alunos que estão com ele.
        </p>
      </div>

      <AddAlunoForm turmas={turmas ?? []} professores={professores} />

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Professores ({professores.length})</h2>
        <ul className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-lg">
          {professores.length ? (
            professores.map((prof) => {
              const qtd = alunos.filter((a) => a.professor_id === prof.id).length;
              return (
                <li key={prof.id} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{prof.nome || prof.email}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {prof.email} · {qtd} aluno(s)
                    </p>
                  </div>
                  <ResetPasswordButton alunoId={prof.id} />
                </li>
              );
            })
          ) : (
            <li className="p-4 text-sm text-[var(--text-secondary)]">
              Nenhum professor ainda. Adicione pelo formulário acima, escolhendo &quot;Professor&quot;.
            </li>
          )}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Alunos ({alunos.length})</h2>
        <ul className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-lg">
          {alunos.length ? (
            alunos.map((aluno) => {
              const turmaIdsDoAluno = new Set(aluno.turma_membros.map((t) => t.turma_id));
              return (
                <li key={aluno.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{aluno.nome || aluno.email}</p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {aluno.email} · Professor:{" "}
                        {aluno.professor_id ? nomeProfessor.get(aluno.professor_id) ?? "—" : "você"}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Link
                          href={`/admin/alunos/${aluno.id}/conteudos`}
                          className="text-xs font-medium rounded-md border border-[var(--border-strong)] px-2.5 py-1 hover:bg-[var(--surface-2)]"
                        >
                          Conteúdos
                        </Link>
                        <Link
                          href={`/admin/alunos/${aluno.id}/preview`}
                          className="text-xs font-medium rounded-md border border-[var(--border-strong)] px-2.5 py-1 hover:bg-[var(--surface-2)]"
                        >
                          Ver como aluno
                        </Link>
                      </div>
                    </div>
                    <ResetPasswordButton alunoId={aluno.id} />
                  </div>
                  <form action={updateAlunoTurmas} className="space-y-2">
                    <input type="hidden" name="aluno_id" value={aluno.id} />
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs text-[var(--text-secondary)]">Programas:</span>
                      {turmas?.map((turma) => (
                        <label key={turma.id} className="flex items-center gap-1.5 text-xs">
                          <input
                            type="checkbox"
                            name="turmas"
                            value={turma.id}
                            defaultChecked={turmaIdsDoAluno.has(turma.id)}
                          />
                          {turma.nome}
                          <span className="text-[var(--text-faint)]">· {rotuloIdioma(turma.idioma)}</span>
                        </label>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-2 text-xs">
                        <span className="text-[var(--text-secondary)]">Professor:</span>
                        <select
                          name="professor_id"
                          defaultValue={aluno.professor_id ?? ""}
                          className="bg-[var(--surface)] rounded-md border border-[var(--border-strong)] px-2 py-1 text-xs"
                        >
                          <option value="">Você</option>
                          {professores.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nome || p.email}
                            </option>
                          ))}
                        </select>
                      </label>
                      <SubmitButton className="text-xs rounded-md border border-[var(--border-strong)] px-3 py-1 hover:bg-[var(--surface-2)] whitespace-nowrap">
                        Salvar
                      </SubmitButton>
                    </div>
                  </form>
                </li>
              );
            })
          ) : (
            <li className="p-4 text-sm text-[var(--text-secondary)]">Nenhum aluno ainda.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
