"use client";

import { useState, useTransition } from "react";
import { toggleItemConcluido } from "@/app/(aluno)/aluno/planner/actions";

type Props = {
  itemId: string;
  texto: string;
  defaultChecked: boolean;
};

export default function PlannerItemCheckbox({ itemId, texto, defaultChecked }: Props) {
  const [checked, setChecked] = useState(defaultChecked);
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.checked;
    setChecked(value);
    startTransition(async () => {
      await toggleItemConcluido(itemId, value);
    });
  }

  return (
    <label className="flex items-start gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={isPending}
        className="mt-0.5"
      />
      <span className={checked ? "line-through text-gray-400" : ""}>{texto}</span>
    </label>
  );
}
