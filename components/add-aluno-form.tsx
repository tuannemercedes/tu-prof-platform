"use client";

import { useRef, useState, useTransition } from "react";
import { addAluno } from "@/app/(admin)/admin/alunos/actions";

type Props = {
  turmas: { id: string; nome: string }[];
};

export default function AddAlunoForm({ turmas }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    setCreated(null);
    startTransition(async () => {
      const result = await addAluno(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.password) {
        formRef.current?.reset();
        setCreated({ email: result.email, password: result.password });
      }
    });
  }

  return (
    <div className="space-y-3">
      {created && (
        <div className="text-sm bg-[var(--success-bg)] border border-[var(--success-text)]/30 rounded-md p-3 space-y-1">
          <p className="text-[var(--success-text)] font-medium">Aluno criado! Envie esses dados a ele (WhatsApp, etc):</p>
          <p className="text-[var(--success-text)]">
            E-mail: <span className="font-mono">{created.email}</span>
          </p>
          <p className="text-[var(--success-text)]">
            Senha: <span className="font-mono font-semibold">{created.password}</span>
          </p>
        </div>
      )}
      <form
        ref={formRef}
        action={handleSubmit}
        className="space-y-3 border border-[var(--border)] rounded-lg p-4"
      >
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          type="email"
          name="email"
          required
          placeholder="e-mail do aluno"
          className="bg-[var(--surface)] rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
        />
        <input
          type="text"
          name="nome"
          placeholder="nome (opcional)"
          className="bg-[var(--surface)] rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
        />
      </div>
      {turmas.length ? (
        <div className="flex flex-wrap gap-3 text-sm">
          {turmas.map((turma) => (
            <label key={turma.id} className="flex items-center gap-1.5">
              <input type="checkbox" name="turmas" value={turma.id} />
              {turma.nome}
            </label>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[var(--text-faint)]">
          Crie uma turma primeiro para poder associar o aluno a ela.
        </p>
      )}
      {error && <p className="text-sm text-[var(--danger-text)]">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-4 py-2 disabled:opacity-50 btn-glow"
      >
        {isPending ? "Adicionando..." : "Adicionar aluno"}
      </button>
      </form>
    </div>
  );
}
