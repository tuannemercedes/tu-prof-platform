import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createTurma, deleteTurma, updateTurmaCalendario, updateTurmaNome } from "./actions";
import SubmitButton from "@/components/submit-button";

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
        <p className="text-sm text-[var(--text-secondary)]">
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

      <ul className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-lg">
        {turmas?.length ? (
          turmas.map((turma) => (
            <li key={turma.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <form action={updateTurmaNome} className="flex gap-2 max-w-xs">
                    <input type="hidden" name="id" value={turma.id} />
                    <input
                      type="text"
                      name="nome"
                      defaultValue={turma.nome}
                      required
                      className="bg-[var(--surface)] flex-1 rounded-md border border-[var(--border-strong)] px-2 py-1 text-sm font-medium"
                    />
                    <SubmitButton className="text-xs rounded-md border border-[var(--border-strong)] px-2.5 py-1 hover:bg-[var(--surface-2)] shrink-0 whitespace-nowrap">
                      Salvar
                    </SubmitButton>
                  </form>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    {(turma.turma_membros as unknown as { count: number }[])[0]?.count ?? 0}{" "}
                    aluno(s)
                  </p>
                  <Link
                    href={`/admin/turmas/${turma.id}/conteudos`}
                    className="text-xs font-medium rounded-md border border-[var(--border-strong)] px-2.5 py-1 hover:bg-[var(--surface-2)] inline-block mt-2"
                  >
                    📦 Conteúdos
                  </Link>
                </div>
                <form action={deleteTurma}>
                  <input type="hidden" name="id" value={turma.id} />
                  <button
                    type="submit"
                    className="text-xs text-[var(--text-faint)] hover:text-[var(--danger-text)]"
                  >
                    Excluir
                  </button>
                </form>
              </div>
              <form action={updateTurmaCalendario} className="space-y-1">
                <input type="hidden" name="id" value={turma.id} />
                <label className="text-xs font-medium text-[var(--text-secondary)] block">
                  📅 Calendário (Google Calendar)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    name="calendario_embed_url"
                    defaultValue={turma.calendario_embed_url ?? ""}
                    placeholder="Cole aqui o link de embed do Google Calendar"
                    className="bg-[var(--surface)] flex-1 rounded-md border border-[var(--border-strong)] px-2 py-1.5 text-xs"
                  />
                  <SubmitButton className="text-xs rounded-md border border-[var(--border-strong)] px-3 py-1.5 hover:bg-[var(--surface-2)] whitespace-nowrap">
                    Salvar
                  </SubmitButton>
                </div>
              </form>
            </li>
          ))
        ) : (
          <li className="p-4 text-sm text-[var(--text-secondary)]">Nenhuma turma ainda.</li>
        )}
      </ul>
    </div>
  );
}
