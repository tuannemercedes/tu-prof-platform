import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createCronograma, deleteCronograma } from "./actions";

export default async function CronogramaPage() {
  const supabase = await createClient();
  const { data: cronogramas } = await supabase
    .from("cronogramas")
    .select("id, titulo, cronograma_itens(count), cronograma_turmas(count), cronograma_alunos(count)")
    .order("titulo");

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold">Cronograma</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Monte a trajetória (data + tema de cada encontro) uma vez e escolha pra
          quais turmas e/ou alunos liberar. Se turmas diferentes tiverem
          trajetórias diferentes, crie um cronograma pra cada uma.
        </p>
      </div>

      <form action={createCronograma} className="flex gap-2">
        <input
          type="text"
          name="titulo"
          required
          placeholder="Nome do cronograma (ex: Turma de setembro)"
          className="bg-[var(--surface)] flex-1 rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-4 py-2 btn-glow"
        >
          Criar
        </button>
      </form>

      <ul className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-lg">
        {cronogramas?.length ? (
          cronogramas.map((c) => {
            const totalItens = (c.cronograma_itens as unknown as { count: number }[])[0]?.count ?? 0;
            const totalTurmas = (c.cronograma_turmas as unknown as { count: number }[])[0]?.count ?? 0;
            const totalAlunos = (c.cronograma_alunos as unknown as { count: number }[])[0]?.count ?? 0;
            return (
              <li key={c.id} className="p-4 flex items-center justify-between gap-4">
                <Link href={`/admin/cronograma/${c.id}`} className="min-w-0">
                  <p className="text-sm font-medium">{c.titulo}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {totalItens} encontro(s) · liberado pra {totalTurmas} turma(s) e {totalAlunos} aluno(s)
                  </p>
                </Link>
                <form action={deleteCronograma}>
                  <input type="hidden" name="id" value={c.id} />
                  <button type="submit" className="text-xs text-[var(--text-faint)] hover:text-[var(--danger-text)]">
                    Excluir
                  </button>
                </form>
              </li>
            );
          })
        ) : (
          <li className="p-4 text-sm text-[var(--text-secondary)]">Nenhum cronograma ainda.</li>
        )}
      </ul>
    </div>
  );
}
