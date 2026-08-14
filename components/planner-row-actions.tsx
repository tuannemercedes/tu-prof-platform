"use client";

import { useState } from "react";
import { deletePlanner, duplicatePlanner, updatePlannerTitulo } from "@/app/(admin)/admin/planner/actions";
import SubmitButton from "./submit-button";

export default function PlannerRowActions({ id, titulo }: { id: string; titulo: string }) {
  const [expanded, setExpanded] = useState(false);
  const [renaming, setRenaming] = useState(false);

  return (
    <div className="text-right shrink-0">
      <button
        type="button"
        onClick={() => {
          setExpanded((v) => !v);
          setRenaming(false);
        }}
        aria-label="Mais opções"
        className="text-[var(--text-faint)] hover:text-[var(--text-secondary)] px-2 py-1 text-lg leading-none"
      >
        ⋮
      </button>

      {expanded && !renaming && (
        <div className="flex items-center justify-end gap-3 text-xs mt-1">
          <button
            type="button"
            onClick={() => {
              setRenaming(true);
              setExpanded(false);
            }}
            className="text-[var(--text-secondary)] hover:underline"
          >
            Renomear
          </button>
          <form action={duplicatePlanner}>
            <input type="hidden" name="id" value={id} />
            <button type="submit" className="text-[var(--text-secondary)] hover:underline">
              Duplicar
            </button>
          </form>
          <form action={deletePlanner}>
            <input type="hidden" name="id" value={id} />
            <button type="submit" className="text-[var(--text-faint)] hover:text-[var(--danger-text)]">
              Excluir
            </button>
          </form>
        </div>
      )}

      {renaming && (
        <form action={updatePlannerTitulo} className="flex items-center gap-2 mt-1">
          <input type="hidden" name="id" value={id} />
          <input
            type="text"
            name="titulo"
            defaultValue={titulo}
            required
            autoFocus
            className="bg-[var(--surface)] rounded-md border border-[var(--border-strong)] px-2 py-1 text-xs w-40"
          />
          <SubmitButton className="text-xs rounded-md border border-[var(--border-strong)] px-2 py-1 hover:bg-[var(--surface-2)] whitespace-nowrap">
            Salvar
          </SubmitButton>
        </form>
      )}
    </div>
  );
}
