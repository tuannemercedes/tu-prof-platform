"use client";

import { useRef, useState, useTransition } from "react";
import { addAluno } from "@/app/(admin)/admin/alunos/actions";
import { rotuloIdioma } from "@/lib/programas";

type Props = {
  turmas: { id: string; nome: string; idioma?: string | null }[];
  professores: { id: string; nome: string | null; email: string }[];
};

type Criado = { email: string; password: string | null; papel: string };

export default function AddAlunoForm({ turmas, professores }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Criado | null>(null);
  const [papel, setPapel] = useState<"aluno" | "professor">("aluno");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    setCreated(null);
    startTransition(async () => {
      const result = await addAluno(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        formRef.current?.reset();
        setPapel("aluno");
        setCreated({ email: result.email, password: result.password ?? null, papel: result.papel });
      }
    });
  }

  const quem = papel === "professor" ? "professor" : "aluno";

  return (
    <div className="space-y-3">
      {created && (
        <div className="text-sm bg-[var(--success-bg)] border border-[var(--success-text)]/30 rounded-md p-3 space-y-1">
          {created.password ? (
            <>
              <p className="text-[var(--success-text)] font-medium">
                {created.papel === "professor" ? "Professor" : "Aluno"} adicionado. Envie estes dados por fora (WhatsApp, e-mail):
              </p>
              <p className="text-[var(--success-text)]">
                E-mail: <span className="font-mono">{created.email}</span>
              </p>
              <p className="text-[var(--success-text)]">
                Senha: <span className="font-mono font-semibold">{created.password}</span>
              </p>
            </>
          ) : (
            <p className="text-[var(--success-text)] font-medium">
              Essa pessoa já tinha conta ({created.email}). Os dados foram atualizados e a senha dela
              continua a mesma. Se precisar, use &quot;Redefinir senha&quot; na lista.
            </p>
          )}
        </div>
      )}
      <form
        ref={formRef}
        action={handleSubmit}
        className="space-y-4 border border-[var(--border)] rounded-lg p-4"
      >
        <fieldset className="flex gap-2">
          <legend className="text-xs font-medium text-[var(--text-secondary)] mb-1.5">Quem você está adicionando</legend>
          {(["aluno", "professor"] as const).map((p) => (
            <label
              key={p}
              className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm ${
                papel === p
                  ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)]"
                  : "border-[var(--border-strong)]"
              }`}
            >
              <input
                type="radio"
                name="papel"
                value={p}
                checked={papel === p}
                onChange={() => setPapel(p)}
                className="sr-only"
              />
              {p === "aluno" ? "Aluno" : "Professor"}
            </label>
          ))}
        </fieldset>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-xs font-medium text-[var(--text-secondary)] space-y-1">
            <span>E-mail</span>
            <input
              type="email"
              name="email"
              required
              placeholder={`e-mail do ${quem}`}
              className="w-full bg-[var(--surface)] rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm text-[var(--text-primary)]"
            />
          </label>
          <label className="text-xs font-medium text-[var(--text-secondary)] space-y-1">
            <span>Nome</span>
            <input
              type="text"
              name="nome"
              placeholder="nome (opcional)"
              className="w-full bg-[var(--surface)] rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm text-[var(--text-primary)]"
            />
          </label>
        </div>

        {papel === "aluno" && (
          <>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-[var(--text-secondary)]">Programas</p>
              {turmas.length ? (
                <div className="flex flex-wrap gap-3 text-sm">
                  {turmas.map((turma) => (
                    <label key={turma.id} className="flex items-center gap-1.5">
                      <input type="checkbox" name="turmas" value={turma.id} />
                      {turma.nome}
                      {turma.idioma && (
                        <span className="text-xs text-[var(--text-faint)]">· {rotuloIdioma(turma.idioma)}</span>
                      )}
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--text-faint)]">
                  Crie um programa primeiro para poder matricular o aluno.
                </p>
              )}
            </div>

            <label className="block text-xs font-medium text-[var(--text-secondary)] space-y-1 max-w-sm">
              <span>Professor responsável</span>
              <select
                name="professor_id"
                defaultValue=""
                className="w-full bg-[var(--surface)] rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm text-[var(--text-primary)]"
              >
                <option value="">Você (sem professor definido)</option>
                {professores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome || p.email}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}

        {error && <p className="text-sm text-[var(--danger-text)]">{error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-4 py-2 disabled:opacity-50 btn-glow"
        >
          {isPending ? "Adicionando..." : papel === "professor" ? "Adicionar professor" : "Adicionar aluno"}
        </button>
      </form>
    </div>
  );
}
