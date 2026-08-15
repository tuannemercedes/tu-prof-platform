"use client";

import { useState, useTransition } from "react";
import { toggleProgresso } from "@/app/(aluno)/aluno/actions";
import { useTrilhaProgress } from "./trilha-progress-context";

type Props = {
  materialId: string;
  defaultChecked: boolean;
};

export default function ProgressCheckbox({ materialId, defaultChecked }: Props) {
  const [checked, setChecked] = useState(defaultChecked);
  const [isPending, startTransition] = useTransition();
  const trilhaProgress = useTrilhaProgress();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.checked;
    setChecked(value);
    trilhaProgress?.notificarConclusao(value);
    startTransition(async () => {
      await toggleProgresso(materialId, value);
    });
  }

  return (
    <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] whitespace-nowrap">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={isPending}
      />
      Concluído
    </label>
  );
}
