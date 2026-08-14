import { createClient } from "@/lib/supabase/server";
import SubmitButton from "@/components/submit-button";
import ClubeCalendarManager from "@/components/clube-calendar-manager";
import LiberacaoFields from "@/components/liberacao-fields";
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
