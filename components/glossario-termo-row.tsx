"use client";

import { useState, useTransition } from "react";
import { saveTermo, deleteTermo } from "@/app/(admin)/admin/glossario/actions";

type Termo = { id: string; termo: string; definicao: string; exemplo: string | null };

export default function GlossarioTermoRow({ termo }: { termo: Termo }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await saveTermo(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setEditing(false);
      }
    });
  }

  return (
    <li className="p-3 space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium">{termo.termo}</p>
          <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{termo.definicao}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-xs">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="text-[var(--text-secondary)] hover:underline"
          >
            {editing ? "Cancelar" : "Editar"}
          </button>
          <form action={deleteTermo}>
            <input type="hidden" name="id" value={termo.id} />
            <button type="submit" className="text-[var(--text-faint)] hover:text-[var(--danger-text)]">
              Excluir
            </button>
          </form>
        </div>
      </div>

      {editing && (
        <form action={handleSubmit} className="space-y-2 border-t border-[var(--border-soft)] pt-3">
          <input type="hidden" name="id" value={termo.id} />
          <input
            type="text"
            name="termo"
            defaultValue={termo.termo}
            required
            className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
          />
          <textarea
            name="definicao"
            defaultValue={termo.definicao}
            required
            rows={2}
            className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
          />
          <input
            type="text"
            name="exemplo"
            defaultValue={termo.exemplo ?? ""}
            placeholder="Exemplo de frase (opcional)"
            className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
          />
          {error && <p className="text-sm text-[var(--danger-text)]">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-4 py-2 disabled:opacity-50 btn-glow"
          >
            {isPending ? "Salvando..." : "Salvar"}
          </button>
        </form>
      )}
    </li>
  );
}
