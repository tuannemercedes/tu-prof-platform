"use client";

import { useState, useTransition } from "react";
import { toggleItemConcluido } from "@/app/(aluno)/aluno/planner/actions";

type Props = {
  itemId: string;
  texto: string;
  linkUrl?: string | null;
  defaultChecked: boolean;
  readOnly?: boolean;
};

export default function PlannerItemCheckbox({
  itemId,
  texto,
  linkUrl,
  defaultChecked,
  readOnly = false,
}: Props) {
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
        onChange={readOnly ? undefined : handleChange}
        disabled={isPending || readOnly}
        className="bg-[var(--surface)] mt-0.5"
      />
      <span className={checked ? "line-through text-[var(--text-faint)]" : ""}>{texto}</span>
      {linkUrl && (
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-[var(--accent)] hover:underline shrink-0"
        >
          🔗
        </a>
      )}
    </label>
  );
}
