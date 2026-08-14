"use client";

import { useState, useTransition } from "react";
import { toggleItemConcluido } from "@/app/(aluno)/aluno/planner/actions";
import LinkChip from "./link-chip";

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
    <label className="flex items-start gap-2.5 text-sm rounded-lg px-2 py-1.5 -mx-2 hover:bg-[var(--surface-2)] transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={readOnly ? undefined : handleChange}
        disabled={isPending || readOnly}
        className="mt-0.5 w-4 h-4 accent-[var(--accent)]"
      />
      <span className="flex-1 flex flex-wrap items-center gap-2">
        <span className={checked ? "line-through text-[var(--text-faint)]" : ""}>{texto}</span>
        {linkUrl && <LinkChip href={linkUrl} onClick={(e) => e.stopPropagation()} />}
      </span>
    </label>
  );
}
