import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createCronogramaItem, deleteCronogramaItem } from "./actions";

export default async function CronogramaAlunoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: aluno }, { data: itens }] = await Promise.all([
    supabase.from("profiles").select("id, nome, email").eq("id", id).single(),
    supabase
      .from("cronograma_itens")
      .select("id, data, tema, descricao")
      .eq("aluno_id", id)
      .order("data"),
  ]);

  if (!aluno) notFound();

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <Link href="/admin/alunos" className="text-xs text-[var(--text-secondary)] hover:underline">
          ← Alunos
        </Link>
        <h1 className="text-lg font-semibold">Cronograma — {aluno.nome || aluno.email}</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          A trajetória do aluno: data e tema de cada encontro ao vivo.
        </p>
      </div>

      <form action={createCronogramaItem} className="space-y-3 border border-[var(--border)] rounded-lg p-4">
        <input type="hidden" name="aluno_id" value={id} />
        <div className="grid sm:grid-cols-[140px_1fr] gap-3">
          <input
            type="date"
            name="data"
            className="bg-[var(--surface)] rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
          />
          <input
            type="text"
            name="tema"
            required
            placeholder="Tema do encontro"
            className="bg-[var(--surface)] rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
          />
        </div>
        <textarea
          name="descricao"
          rows={2}
          placeholder="Descrição (opcional)"
          className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-4 py-2 btn-glow"
        >
          Adicionar
        </button>
      </form>

      <ul className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-lg">
        {itens?.length ? (
          itens.map((item) => (
            <li key={item.id} className="p-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-[var(--text-faint)]">
                  {item.data
                    ? new Date(item.data + "T00:00:00").toLocaleDateString("pt-BR")
                    : "Sem data"}
                </p>
                <p className="text-sm font-medium">{item.tema}</p>
                {item.descricao && <p className="text-xs text-[var(--text-secondary)]">{item.descricao}</p>}
              </div>
              <form action={deleteCronogramaItem}>
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="aluno_id" value={id} />
                <button type="submit" className="text-xs text-[var(--text-faint)] hover:text-[var(--danger-text)]">
                  Excluir
                </button>
              </form>
            </li>
          ))
        ) : (
          <li className="p-4 text-sm text-[var(--text-secondary)]">Nenhum item ainda.</li>
        )}
      </ul>
    </div>
  );
}
