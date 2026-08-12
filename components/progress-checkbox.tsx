"use client";

import { useState, useTransition } from "react";
import { toggleProgresso } from "@/app/(aluno)/aluno/actions";

type Props = {
  materialId: string;
  defaultChecked: boolean;
};

export default function ProgressCheckbox({ materialId, defaultChecked }: Props) {
  const [checked, setChecked] = useState(defaultChecked);
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.checked;
    setChecked(value);
    startTransition(async () => {
      await toggleProgresso(materialId, value);
    });
  }

  return (
    <label className="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap">
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
