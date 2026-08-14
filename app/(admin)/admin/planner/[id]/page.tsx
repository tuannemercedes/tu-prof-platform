import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PlannerDiaForm from "@/components/planner-dia-form";
import {
  createPlannerItem,
  deletePlannerDia,
  deletePlannerItem,
  updatePlannerAcesso,
} from "./actions";
import { updatePlannerTitulo } from "@/app/(admin)/admin/planner/actions";

export default async function PlannerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: planner },
    { data: dias },
    { data: turmas },
    { data: alunos },
    { data: turmasLiberadas },
    { data: alunosLiberados },
  ] = await Promise.all([
    supabase.from("planners").select("id, titulo").eq("id", id).single(),
    supabase
      .from("planner_dias")
      .select("id, semana, titulo, planner_itens(id, texto, link_url)")
      .eq("planner_id", id)
      .order("semana")
      .order("ordem"),
    supabase.from("turmas").select("id, nome").order("nome"),
    supabase.from("profiles").select("id, nome, email").eq("role", "aluno").order("nome"),
    supabase.from("planner_turmas").select("turma_id").eq("planner_id", id),
    supabase.from("planner_alunos").select("aluno_id").eq("planner_id", id),
  ]);

  if (!planner) notFound();

  const turmaIdsLiberadas = new Set((turmasLiberadas ?? []).map((t) => t.turma_id));
  const alunoIdsLiberados = new Set((alunosLiberados ?? []).map((a) => a.aluno_id));

  const semanas = new Map<number, typeof dias>();
  (dias ?? []).forEach((dia) => {
    if (!semanas.has(dia.semana)) semanas.set(dia.semana, []);
    semanas.get(dia.semana)!.push(dia);
  });
  const semanasExistentes = [...semanas.keys()].sort((a, b) => a - b);

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="space-y-2">
        <Link href="/admin/planner" className="text-xs text-[var(--text-secondary)] hover:underline">
          ← Planner
        </Link>
        <form action={updatePlannerTitulo} className="flex gap-2 max-w-sm">
          <input type="hidden" name="id" value={id} />
          <input
            type="text"
            name="titulo"
            defaultValue={planner.titulo}
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
        <p className="text-sm text-[var(--text-secondary)]">
          Tarefas diárias organizadas por semana. Cada item vira um checkbox que
          o aluno marca no próprio ritmo.
        </p>
      </div>

      <PlannerDiaForm plannerId={id} semanasExistentes={semanasExistentes} />

      {semanasExistentes.map((semana) => (
        <section key={semana} className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
            Semana {semana}
          </h2>
          <div className="space-y-3">
            {semanas.get(semana)!.map((dia) => (
              <div key={dia.id} className="border border-[var(--border)] rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{dia.titulo}</p>
                  <form action={deletePlannerDia}>
                    <input type="hidden" name="id" value={dia.id} />
                    <input type="hidden" name="planner_id" value={id} />
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
                          <input type="hidden" name="planner_id" value={id} />
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
                  <input type="hidden" name="planner_id" value={id} />
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

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
          Liberar para quem
        </h2>
        <form action={updatePlannerAcesso} className="space-y-3 border border-[var(--border)] rounded-lg p-4">
          <input type="hidden" name="planner_id" value={id} />

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
