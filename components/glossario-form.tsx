"use client";

import { useRef, useState, useTransition } from "react";
import { saveTermo } from "@/app/(admin)/admin/glossario/actions";

export default function GlossarioForm() {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveTermo(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        formRef.current?.reset();
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3 border border-[var(--border)] rounded-lg p-4">
      <input
        type="text"
        name="termo"
        required
        placeholder="Termo ou expressão (ex: Ojalá)"
        className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
      />
      <textarea
        name="definicao"
        required
        rows={2}
        placeholder="Definição / significado"
        className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
      />
      <input
        type="text"
        name="exemplo"
        placeholder="Exemplo de frase (opcional)"
        className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
      />
      {error && <p className="text-sm text-[var(--danger-text)]">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-4 py-2 disabled:opacity-50 btn-glow"
      >
        {isPending ? "Salvando..." : saved ? "✓ Termo adicionado!" : "Adicionar termo"}
      </button>
    </form>
  );
}
