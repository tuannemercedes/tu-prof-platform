"use client";

import { useState, useTransition } from "react";
import CalendarGrid from "./calendar-grid";
import { saveTema, deleteTema } from "@/app/(admin)/admin/clube/actions";

type Tema = { id: string; data: string; tema: string; descricao: string | null };

export default function ClubeCalendarManager({ temas }: { temas: Tema[] }) {
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const temaDoDia = temas.find((t) => t.data === selecionado) ?? null;

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await saveTema(formData);
      if (result?.error) setError(result.error);
      else setSelecionado(null);
    });
  }

  function handleDelete() {
    if (!temaDoDia) return;
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", temaDoDia.id);
      await deleteTema(fd);
      setSelecionado(null);
    });
  }

  return (
    <div className="space-y-3">
      <CalendarGrid
        eventos={temas.map((t) => ({ data: t.data, tema: t.tema }))}
        selectedDate={selecionado}
        onDayClick={(data) => {
          setSelecionado(data);
          setError(null);
        }}
      />

      {selecionado && (
        <form action={handleSubmit} className="space-y-2 border border-[var(--border)] rounded-lg p-3">
          <input type="hidden" name="id" value={temaDoDia?.id ?? ""} />
          <input type="hidden" name="data" value={selecionado} />
          <p className="text-xs text-[var(--text-secondary)]">
            {new Date(`${selecionado}T00:00:00`).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
          <input
            type="text"
            name="tema"
            required
            defaultValue={temaDoDia?.tema ?? ""}
            placeholder="Tema da conversa"
            className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
          />
          <textarea
            name="descricao"
            defaultValue={temaDoDia?.descricao ?? ""}
            placeholder="Descrição (opcional)"
            rows={2}
            className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-3 py-1.5 disabled:opacity-50 btn-glow"
            >
              {isPending ? "Salvando..." : "Salvar"}
            </button>
            <button
              type="button"
              onClick={() => setSelecionado(null)}
              className="text-xs text-[var(--text-secondary)] hover:underline"
            >
              Cancelar
            </button>
            {temaDoDia && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="text-xs text-[var(--text-faint)] hover:text-[var(--danger-text)] ml-auto"
              >
                Excluir
              </button>
            )}
          </div>
          {error && <p className="text-sm text-[var(--danger-text)]">{error}</p>}
        </form>
      )}
    </div>
  );
}
