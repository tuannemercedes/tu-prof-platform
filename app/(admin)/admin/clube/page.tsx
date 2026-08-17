import { createClient } from "@/lib/supabase/server";
import SubmitButton from "@/components/submit-button";
import ClubeCalendarManager from "@/components/clube-calendar-manager";
import LiberacaoFields from "@/components/liberacao-fields";
import { getResumoRsvpTema } from "@/lib/clube";
import { updateClubeConfig, updateClubeAcesso } from "./actions";

export default async function ClubePage() {
  const supabase = await createClient();

  const [{ data: config }, { data: temas }, { data: turmas }, { data: alunos }, { data: turmasLiberadas }, { data: alunosLiberados }] =
    await Promise.all([
      supabase.from("clube_config").select("link_acesso, dia_horario, visivel_todos").eq("id", 1).single(),
      supabase.from("clube_temas").select("id, data, tema, descricao").order("data"),
      supabase.from("turmas").select("id, nome").order("nome"),
      supabase.from("profiles").select("id, nome, email").eq("role", "aluno").order("nome"),
      supabase.from("clube_turmas").select("turma_id"),
      supabase.from("clube_alunos").select("aluno_id"),
    ]);

  const turmaIdsLiberadas = new Set((turmasLiberadas ?? []).map((t) => t.turma_id));
  const alunoIdsLiberados = new Set((alunosLiberados ?? []).map((a) => a.aluno_id));

  const hoje = new Date().toISOString().slice(0, 10);
  const proximoTema =
    (temas ?? []).filter((t) => t.data >= hoje).sort((a, b) => (a.data < b.data ? -1 : 1))[0] ?? null;
  const resumoRsvp = proximoTema ? await getResumoRsvpTema(supabase, proximoTema.id) : null;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold">Clube de Conversação</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Configure o link de acesso, o dia/horário fixo e os temas de cada encontro. Só quem
          você liberar lá embaixo vê o botão.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
          Acesso
        </h2>
        <form action={updateClubeConfig} className="space-y-3">
          <div>
            <label className="text-xs text-[var(--text-secondary)] block mb-1">
              Link de acesso (Zoom, Meet, etc.)
            </label>
            <input
              type="url"
              name="link_acesso"
              defaultValue={config?.link_acesso ?? ""}
              placeholder="https://..."
              className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--text-secondary)] block mb-1">Dia e horário fixo</label>
            <input
              type="text"
              name="dia_horario"
              defaultValue={config?.dia_horario ?? ""}
              placeholder="Ex: Quintas-feiras, 19h"
              className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
            />
          </div>
          <SubmitButton className="rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-4 py-2 btn-glow">
            Salvar
          </SubmitButton>
        </form>
      </section>

      {proximoTema && resumoRsvp && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
            Confirmações do próximo encontro
          </h2>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 space-y-4 card-elevated">
            <p className="text-sm">
              <span className="font-medium">{proximoTema.tema}</span>{" "}
              <span className="text-[var(--text-secondary)]">
                ({new Date(`${proximoTema.data}T00:00:00`).toLocaleDateString("pt-BR")})
              </span>
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold text-[var(--success-text)] uppercase tracking-wide mb-1.5">
                  Vão ({resumoRsvp.confirmados.length})
                </p>
                {resumoRsvp.confirmados.length > 0 ? (
                  <ul className="space-y-0.5">
                    {resumoRsvp.confirmados.map((a) => (
                      <li key={a.id} className="text-sm">{a.nome}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[var(--text-faint)]">Ninguém ainda.</p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-[var(--danger-text)] uppercase tracking-wide mb-1.5">
                  Não vão ({resumoRsvp.recusados.length})
                </p>
                {resumoRsvp.recusados.length > 0 ? (
                  <ul className="space-y-0.5">
                    {resumoRsvp.recusados.map((a) => (
                      <li key={a.id} className="text-sm">{a.nome}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[var(--text-faint)]">Ninguém ainda.</p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-[var(--text-faint)] uppercase tracking-wide mb-1.5">
                  Ainda não responderam ({resumoRsvp.pendentes.length})
                </p>
                {resumoRsvp.pendentes.length > 0 ? (
                  <ul className="space-y-0.5">
                    {resumoRsvp.pendentes.map((a) => (
                      <li key={a.id} className="text-sm text-[var(--text-secondary)]">{a.nome}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[var(--text-faint)]">Todo mundo respondeu.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
          Temas por data
        </h2>
        <p className="text-xs text-[var(--text-secondary)]">Clique num dia do calendário pra adicionar ou editar o tema.</p>
        <ClubeCalendarManager temas={temas ?? []} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
          Liberar botão para quem
        </h2>
        <form action={updateClubeAcesso} className="space-y-3">
          <LiberacaoFields
            turmas={turmas ?? []}
            alunos={alunos ?? []}
            turmaIdsLiberadas={turmaIdsLiberadas}
            alunoIdsLiberados={alunoIdsLiberados}
            todosInicial={config?.visivel_todos ?? false}
          />

          <SubmitButton className="rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-4 py-2 btn-glow">
            Salvar liberação
          </SubmitButton>
        </form>
      </section>
    </div>
  );
}
