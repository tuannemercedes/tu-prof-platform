"use client";

import { useRef, useState, useTransition } from "react";
import { createPlannerDia } from "@/app/(admin)/admin/alunos/[id]/planner/actions";

const NOVA_SEMANA = "__nova__";

export default function PlannerDiaForm({
  alunoId,
  semanasExistentes,
}: {
  alunoId: string;
  semanasExistentes: number[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const proximaSemana = semanasExistentes.length ? Math.max(...semanasExistentes) + 1 : 1;
  const [semanaOpcao, setSemanaOpcao] = useState(
    semanasExistentes.length ? String(semanasExistentes[semanasExistentes.length - 1]) : NOVA_SEMANA
  );

  function handleSubmit(formData: FormData) {
    if (formData.get("semana") === NOVA_SEMANA) {
      formData.set("semana", String(formData.get("nova_semana") || proximaSemana));
    }
    setError(null);
    startTransition(async () => {
      const result = await createPlannerDia(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        formRef.current?.reset();
        setSemanaOpcao(semanasExistentes.length ? String(semanasExistentes[semanasExistentes.length - 1]) : NOVA_SEMANA);
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

      <select
        name="semana"
        value={semanaOpcao}
        onChange={(e) => setSemanaOpcao(e.target.value)}
        className="bg-[var(--surface)] rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
      >
        {semanasExistentes.map((s) => (
          <option key={s} value={s}>
            Semana {s}
          </option>
        ))}
        <option value={NOVA_SEMANA}>+ Nova semana</option>
      </select>

      {semanaOpcao === NOVA_SEMANA && (
        <input
          type="number"
          name="nova_semana"
          min={1}
          defaultValue={proximaSemana}
          className="bg-[var(--surface)] w-24 rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
        />
      )}

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
