import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createTurma, deleteTurma, updateTurmaCalendario, updateTurmaNome } from "./actions";
import SubmitButton from "@/components/submit-button";
import { IDIOMAS, rotuloIdioma } from "@/lib/programas";

const campo =
  "bg-[var(--surface)] rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm";

export default async function ProgramasPage() {
  const supabase = await createClient();
  const { data: turmas } = await supabase
    .from("turmas")
    .select("id, nome, idioma, descricao, calendario_embed_url, turma_membros(count)")
    .order("ordem")
    .order("nome");

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-lg font-semibold">Programas</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Mentoria individual, Espanhol Chave, Portal, Corporate e os de inglês. O aluno é
          matriculado num programa e vê tudo o que estiver liberado para ele. Conteúdos também
          podem ser liberados só para alunos específicos.
        </p>
      </div>

      <form action={createTurma} className="flex flex-wrap gap-2">
        <input
          type="text"
          name="nome"
          required
          placeholder="Nome do programa"
          aria-label="Nome do programa"
          className={`${campo} flex-1 min-w-[200px]`}
        />
        <select name="idioma" defaultValue="espanhol" aria-label="Idioma" className={campo}>
          {IDIOMAS.map((i) => (
            <option key={i.valor} value={i.valor}>
              {i.rotulo}
            </option>
          ))}
        </select>
        <SubmitButton
          className="rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-4 py-2 btn-glow whitespace-nowrap"
          pendingText="Criando..."
          savedText="✓ Criado!"
        >
          Criar programa
        </SubmitButton>
      </form>

      <ul className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-lg">
        {turmas?.length ? (
          turmas.map((turma) => (
            <li key={turma.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <form action={updateTurmaNome} className="flex-1 min-w-0 space-y-2">
                  <input type="hidden" name="id" value={turma.id} />
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="text"
                      name="nome"
                      defaultValue={turma.nome}
                      required
                      aria-label="Nome do programa"
                      className={`${campo} flex-1 min-w-[180px] font-medium`}
                    />
                    <select
                      name="idioma"
                      defaultValue={turma.idioma ?? "espanhol"}
                      aria-label="Idioma"
                      className={campo}
                    >
                      {IDIOMAS.map((i) => (
                        <option key={i.valor} value={i.valor}>
                          {i.rotulo}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    name="descricao"
                    defaultValue={turma.descricao ?? ""}
                    placeholder="Descrição curta (opcional)"
                    aria-label="Descrição"
                    className={`${campo} w-full`}
                  />
                  <SubmitButton className="text-xs rounded-md border border-[var(--border-strong)] px-3 py-1.5 hover:bg-[var(--surface-2)] whitespace-nowrap">
                    Salvar
                  </SubmitButton>
                </form>
                <form action={deleteTurma}>
                  <input type="hidden" name="id" value={turma.id} />
                  <button
                    type="submit"
                    className="text-xs text-[var(--text-faint)] hover:text-[var(--danger-text)]"
                  >
                    Excluir
                  </button>
                </form>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs text-[var(--text-secondary)]">
                  {(turma.turma_membros as unknown as { count: number }[])[0]?.count ?? 0} aluno(s) ·{" "}
                  {rotuloIdioma(turma.idioma)}
                </span>
                <Link
                  href={`/admin/turmas/${turma.id}/conteudos`}
                  className="text-xs font-medium rounded-md border border-[var(--border-strong)] px-2.5 py-1 hover:bg-[var(--surface-2)]"
                >
                  Conteúdos do programa
                </Link>
              </div>

              <form action={updateTurmaCalendario} className="space-y-1">
                <input type="hidden" name="id" value={turma.id} />
                <label
                  htmlFor={`cal-${turma.id}`}
                  className="text-xs font-medium text-[var(--text-secondary)] block"
                >
                  Calendário (Google Calendar)
                </label>
                <div className="flex gap-2">
                  <input
                    id={`cal-${turma.id}`}
                    type="url"
                    name="calendario_embed_url"
                    defaultValue={turma.calendario_embed_url ?? ""}
                    placeholder="Cole aqui o link de incorporação do Google Calendar"
                    className="bg-[var(--surface)] flex-1 rounded-md border border-[var(--border-strong)] px-2 py-1.5 text-xs"
                  />
                  <SubmitButton className="text-xs rounded-md border border-[var(--border-strong)] px-3 py-1.5 hover:bg-[var(--surface-2)] whitespace-nowrap">
                    Salvar
                  </SubmitButton>
                </div>
              </form>
            </li>
          ))
        ) : (
          <li className="p-4 text-sm text-[var(--text-secondary)]">Nenhum programa ainda.</li>
        )}
      </ul>
    </div>
  );
}
