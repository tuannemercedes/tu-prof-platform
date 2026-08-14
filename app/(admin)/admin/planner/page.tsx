import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createPlanner, deletePlanner } from "./actions";

export default async function PlannerPage() {
  const supabase = await createClient();
  const { data: planners } = await supabase
    .from("planners")
    .select("id, titulo, planner_dias(count), planner_turmas(count), planner_alunos(count)")
    .order("titulo");

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold">Planner</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Monte as tarefas diárias (por semana) uma vez e escolha pra quais
          turmas e/ou alunos liberar. Se turmas diferentes tiverem rotinas
          diferentes, crie um planner pra cada uma.
        </p>
      </div>

      <form action={createPlanner} className="flex gap-2">
        <input
          type="text"
          name="titulo"
          required
          placeholder="Nome do planner (ex: Turma de setembro)"
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
        {planners?.length ? (
          planners.map((p) => {
            const totalDias = (p.planner_dias as unknown as { count: number }[])[0]?.count ?? 0;
            const totalTurmas = (p.planner_turmas as unknown as { count: number }[])[0]?.count ?? 0;
            const totalAlunos = (p.planner_alunos as unknown as { count: number }[])[0]?.count ?? 0;
            return (
              <li key={p.id} className="p-4 flex items-center justify-between gap-4">
                <Link href={`/admin/planner/${p.id}`} className="min-w-0">
                  <p className="text-sm font-medium">{p.titulo}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {totalDias} dia(s) · liberado pra {totalTurmas} turma(s) e {totalAlunos} aluno(s)
                  </p>
                </Link>
                <form action={deletePlanner}>
                  <input type="hidden" name="id" value={p.id} />
                  <button type="submit" className="text-xs text-[var(--text-faint)] hover:text-[var(--danger-text)]">
                    Excluir
                  </button>
                </form>
              </li>
            );
          })
        ) : (
          <li className="p-4 text-sm text-[var(--text-secondary)]">Nenhum planner ainda.</li>
        )}
      </ul>
    </div>
  );
}
