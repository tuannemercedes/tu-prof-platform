import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createCronogramaItem, deleteCronogramaItem, updateCronogramaAcesso } from "./actions";
import { updateCronogramaTitulo } from "@/app/(admin)/admin/cronograma/actions";

export default async function CronogramaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: cronograma }, { data: itens }, { data: turmas }, { data: alunos }, { data: turmasLiberadas }, { data: alunosLiberados }] =
    await Promise.all([
      supabase.from("cronogramas").select("id, titulo").eq("id", id).single(),
      supabase.from("cronograma_itens").select("id, data, tema, descricao").eq("cronograma_id", id).order("data"),
      supabase.from("turmas").select("id, nome").order("nome"),
      supabase.from("profiles").select("id, nome, email").eq("role", "aluno").order("nome"),
      supabase.from("cronograma_turmas").select("turma_id").eq("cronograma_id", id),
      supabase.from("cronograma_alunos").select("aluno_id").eq("cronograma_id", id),
    ]);

  if (!cronograma) notFound();

  const turmaIdsLiberadas = new Set((turmasLiberadas ?? []).map((t) => t.turma_id));
  const alunoIdsLiberados = new Set((alunosLiberados ?? []).map((a) => a.aluno_id));

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="space-y-2">
        <Link href="/admin/cronograma" className="text-xs text-[var(--text-secondary)] hover:underline">
          ← Cronograma
        </Link>
        <form action={updateCronogramaTitulo} className="flex gap-2 max-w-sm">
          <input type="hidden" name="id" value={id} />
          <input
            type="text"
            name="titulo"
            defaultValue={cronograma.titulo}
            required
            className="bg-[var(--surface)] flex-1 rounded-md border border-[var(--border-strong)] px-3 py-1.5 text-lg font-semibold"
          />
          <button
            type="submit"
            className="text-xs rounded-md border border-[var(--border-strong)] px-3 py-1.5 hover:bg-[var(--surface-2)] shrink-0"
          >
            Salvar nome
          </button>
        </form>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
          Encontros
        </h2>

        {itens?.length ? (
          <div className="border border-[var(--border)] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[var(--surface-2)] text-xs text-[var(--text-secondary)] uppercase tracking-wide">
                <tr>
                  <th className="text-left px-3 py-2 w-32">Data</th>
                  <th className="text-left px-3 py-2">Tema</th>
                  <th className="text-left px-3 py-2">Descrição</th>
                  <th className="w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-soft)]">
                {itens.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2 text-xs text-[var(--text-faint)] whitespace-nowrap">
                      {item.data ? new Date(item.data + "T00:00:00").toLocaleDateString("pt-BR") : "Sem data"}
                    </td>
                    <td className="px-3 py-2 font-medium">{item.tema}</td>
                    <td className="px-3 py-2 text-[var(--text-secondary)]">{item.descricao}</td>
                    <td className="px-3 py-2">
                      <form action={deleteCronogramaItem}>
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="cronograma_id" value={id} />
                        <button
                          type="submit"
                          className="text-xs text-[var(--text-faint)] hover:text-[var(--danger-text)]"
                        >
                          Excluir
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">Nenhum encontro ainda.</p>
        )}

        <form
          action={createCronogramaItem}
          className="grid sm:grid-cols-[140px_1fr_1fr_auto] gap-2 border border-[var(--border)] rounded-lg p-3"
        >
          <input type="hidden" name="cronograma_id" value={id} />
          <input
            type="date"
            name="data"
            className="bg-[var(--surface)] rounded-md border border-[var(--border-strong)] px-2 py-1.5 text-sm"
          />
          <input
            type="text"
            name="tema"
            required
            placeholder="Tema do encontro"
            className="bg-[var(--surface)] rounded-md border border-[var(--border-strong)] px-2 py-1.5 text-sm"
          />
          <input
            type="text"
            name="descricao"
            placeholder="Descrição (opcional)"
            className="bg-[var(--surface)] rounded-md border border-[var(--border-strong)] px-2 py-1.5 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-3 py-1.5 btn-glow whitespace-nowrap"
          >
            + Linha
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
          Liberar para quem
        </h2>
        <form action={updateCronogramaAcesso} className="space-y-3 border border-[var(--border)] rounded-lg p-4">
          <input type="hidden" name="cronograma_id" value={id} />

          {turmas?.length ? (
            <div>
              <p className="text-xs text-[var(--text-secondary)] mb-1">Turmas</p>
              <div className="flex flex-wrap gap-3 text-sm">
                {turmas.map((turma) => (
                  <label key={turma.id} className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      name="turmas"
                      value={turma.id}
                      defaultChecked={turmaIdsLiberadas.has(turma.id)}
                    />
                    {turma.nome}
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-[var(--text-faint)]">Nenhuma turma cadastrada ainda.</p>
          )}

          {alunos?.length ? (
            <div>
              <p className="text-xs text-[var(--text-secondary)] mb-1">Alunos específicos</p>
              <div className="flex flex-wrap gap-3 text-sm">
                {alunos.map((aluno) => (
                  <label key={aluno.id} className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      name="alunos"
                      value={aluno.id}
                      defaultChecked={alunoIdsLiberados.has(aluno.id)}
                    />
                    {aluno.nome || aluno.email}
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          <button
            type="submit"
            className="rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-4 py-2 btn-glow"
          >
            Salvar liberação
          </button>
        </form>
      </section>
    </div>
  );
}
