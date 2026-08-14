"use client";

import { useRef, useState, useTransition } from "react";
import { createPlannerDia } from "@/app/(admin)/admin/alunos/[id]/planner/actions";

export default function PlannerDiaForm({ alunoId }: { alunoId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createPlannerDia(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        formRef.current?.reset();
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="flex flex-wrap gap-2 border border-[var(--border)] rounded-lg p-4"
    >
      <input type="hidden" name="aluno_id" value={alunoId} />
      <input
        type="number"
        name="semana"
        min={1}
        defaultValue={1}
        placeholder="Semana"
        className="bg-[var(--surface)] w-24 rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
      />
      <input
        type="text"
        name="titulo"
        required
        placeholder="Título do dia (ex: Segunda-feira)"
        className="bg-[var(--surface)] flex-1 min-w-[180px] rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-4 py-2 disabled:opacity-50 btn-glow"
      >
        {isPending ? "Criando..." : "+ Novo dia"}
      </button>
      {error && <p className="w-full text-sm text-[var(--danger-text)]">{error}</p>}
    </form>
  );
}
