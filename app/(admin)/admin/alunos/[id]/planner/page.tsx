import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PlannerDiaForm from "@/components/planner-dia-form";
import { createPlannerItem, deletePlannerDia, deletePlannerItem } from "./actions";

export default async function PlannerAlunoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: aluno }, { data: dias }] = await Promise.all([
    supabase.from("profiles").select("id, nome, email").eq("id", id).single(),
    supabase
      .from("planner_dias")
      .select("id, semana, titulo, planner_itens(id, texto, link_url)")
      .eq("aluno_id", id)
      .order("semana")
      .order("ordem"),
  ]);

  if (!aluno) notFound();

  const semanas = new Map<number, typeof dias>();
  (dias ?? []).forEach((dia) => {
    if (!semanas.has(dia.semana)) semanas.set(dia.semana, []);
    semanas.get(dia.semana)!.push(dia);
  });
  const semanasExistentes = [...semanas.keys()].sort((a, b) => a - b);

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <Link href="/admin/alunos" className="text-xs text-[var(--text-secondary)] hover:underline">
          ← Alunos
        </Link>
        <h1 className="text-lg font-semibold">Planner — {aluno.nome || aluno.email}</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Tarefas diárias organizadas por semana. Cada item vira um checkbox que o
          aluno marca no próprio ritmo.
        </p>
      </div>

      <PlannerDiaForm alunoId={id} semanasExistentes={semanasExistentes} />

      {[...semanas.entries()].map(([semana, diasDaSemana]) => (
        <section key={semana} className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
            Semana {semana}
          </h2>
          <div className="space-y-3">
            {diasDaSemana!.map((dia) => (
              <div key={dia.id} className="border border-[var(--border)] rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{dia.titulo}</p>
                  <form action={deletePlannerDia}>
                    <input type="hidden" name="id" value={dia.id} />
                    <input type="hidden" name="aluno_id" value={id} />
                    <button type="submit" className="text-xs text-[var(--text-faint)] hover:text-[var(--danger-text)]">
                      Excluir dia
                    </button>
                  </form>
                </div>

                <ul className="space-y-1">
                  {(dia.planner_itens as { id: string; texto: string; link_url: string | null }[]).map(
                    (item) => (
                      <li key={item.id} className="flex items-center justify-between gap-2 text-sm">
                        <span>
                          · {item.texto}
                          {item.link_url && (
                            <a
                              href={item.link_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-1.5 text-[var(--accent)] hover:underline"
                            >
                              🔗
                            </a>
                          )}
                        </span>
                        <form action={deletePlannerItem}>
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="aluno_id" value={id} />
                          <button type="submit" className="text-xs text-[var(--text-faint)] hover:text-[var(--danger-text)]">
                            Excluir
                          </button>
                        </form>
                      </li>
                    )
                  )}
                </ul>

                <form action={createPlannerItem} className="flex flex-wrap gap-2">
                  <input type="hidden" name="dia_id" value={dia.id} />
                  <input type="hidden" name="aluno_id" value={id} />
                  <input
                    type="text"
                    name="texto"
                    required
                    placeholder="Nova tarefa (ex: Leia 5 frases em voz alta)"
                    className="bg-[var(--surface)] flex-1 min-w-[160px] rounded-md border border-[var(--border-strong)] px-2 py-1.5 text-xs"
                  />
                  <input
                    type="url"
                    name="link_url"
                    placeholder="Link (opcional)"
                    className="bg-[var(--surface)] w-40 rounded-md border border-[var(--border-strong)] px-2 py-1.5 text-xs"
                  />
                  <button
                    type="submit"
                    className="text-xs rounded-md border border-[var(--border-strong)] px-3 py-1.5 hover:bg-[var(--surface-2)]"
                  >
                    Adicionar
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>
      ))}

      {!dias?.length && (
        <p className="text-sm text-[var(--text-secondary)]">Nenhum dia criado ainda.</p>
      )}
    </div>
  );
}
