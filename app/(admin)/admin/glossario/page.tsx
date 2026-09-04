import { createClient } from "@/lib/supabase/server";
import SubmitButton from "@/components/submit-button";
import LiberacaoFields from "@/components/liberacao-fields";
import GlossarioForm from "@/components/glossario-form";
import GlossarioImportForm from "@/components/glossario-import-form";
import GlossarioTermoRow from "@/components/glossario-termo-row";
import { updateGlossarioAcesso } from "./actions";

const SEM_CATEGORIA = "Sem categoria";

export default async function GlossarioPage() {
  const supabase = await createClient();

  const [{ data: config }, { data: termos }, { data: turmas }, { data: alunos }, { data: turmasLiberadas }, { data: alunosLiberados }] =
    await Promise.all([
      supabase.from("glossario_config").select("visivel_todos").eq("id", 1).single(),
      supabase.from("glossario_termos").select("id, termo, definicao, exemplo, categoria").order("categoria").order("termo"),
      supabase.from("turmas").select("id, nome").order("nome"),
      supabase.from("profiles").select("id, nome, email").eq("role", "aluno").order("nome"),
      supabase.from("glossario_turmas").select("turma_id"),
      supabase.from("glossario_alunos").select("aluno_id"),
    ]);

  const turmaIdsLiberadas = new Set((turmasLiberadas ?? []).map((t) => t.turma_id));
  const alunoIdsLiberados = new Set((alunosLiberados ?? []).map((a) => a.aluno_id));

  const categorias = [...new Set((termos ?? []).map((t) => t.categoria).filter((c): c is string => Boolean(c)))].sort(
    (a, b) => a.localeCompare(b)
  );

  const grupos = new Map<string, NonNullable<typeof termos>>();
  (termos ?? []).forEach((t) => {
    const chave = t.categoria || SEM_CATEGORIA;
    if (!grupos.has(chave)) grupos.set(chave, []);
    grupos.get(chave)!.push(t);
  });
  const gruposOrdenados = [...grupos.entries()].sort(([a], [b]) =>
    a === SEM_CATEGORIA ? 1 : b === SEM_CATEGORIA ? -1 : a.localeCompare(b)
  );

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold">Glossário</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Lista de termos e expressões em espanhol com definição e exemplo. Só quem você liberar
          lá embaixo vê essa área.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
          Adicionar termo
        </h2>
        <GlossarioForm categorias={categorias} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
          Colar tabela (vários de uma vez)
        </h2>
        <GlossarioImportForm categorias={categorias} />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
          Termos ({termos?.length ?? 0})
        </h2>
        {gruposOrdenados.length ? (
          gruposOrdenados.map(([categoria, itens]) => (
            <div key={categoria} className="space-y-2">
              {gruposOrdenados.length > 1 && (
                <p className="text-xs font-semibold text-[var(--text-faint)] uppercase tracking-wide">
                  {categoria}
                </p>
              )}
              <ul className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-lg">
                {itens.map((t) => (
                  <GlossarioTermoRow key={t.id} termo={t} categorias={categorias} />
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p className="p-4 text-sm text-[var(--text-secondary)] border border-[var(--border)] rounded-lg">
            Nenhum termo ainda.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
          Liberar acesso para quem
        </h2>
        <form action={updateGlossarioAcesso} className="space-y-3">
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
