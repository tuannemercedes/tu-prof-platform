import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function PlannerListPage() {
  const supabase = await createClient();
  const { data: alunos } = await supabase
    .from("profiles")
    .select("id, nome, email, planner_dias(count)")
    .eq("role", "aluno")
    .order("nome");

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold">Planner</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          As tarefas diárias são individuais — escolha um aluno pra montar ou
          editar o planner dele.
        </p>
      </div>

      <ul className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-lg">
        {alunos?.length ? (
          alunos.map((aluno) => {
            const totalDias = (aluno.planner_dias as unknown as { count: number }[])[0]?.count ?? 0;
            return (
              <li key={aluno.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{aluno.nome || aluno.email}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {totalDias} dia(s) no planner
                  </p>
                </div>
                <Link
                  href={`/admin/alunos/${aluno.id}/planner`}
                  className="text-xs font-medium rounded-md border border-[var(--border-strong)] px-2.5 py-1 hover:bg-[var(--surface-2)] whitespace-nowrap"
                >
                  Editar planner
                </Link>
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
