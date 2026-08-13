"use client";

import { useState, useTransition } from "react";
import { updateNome } from "@/app/(aluno)/aluno/perfil/actions";

export default function PerfilForm({ nomeAtual }: { nomeAtual: string }) {
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setSaved(false);
    startTransition(async () => {
      await updateNome(formData);
      setSaved(true);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <div>
        <label className="text-xs text-[var(--text-secondary)] block mb-1">Nome</label>
        <input
          type="text"
          name="nome"
          defaultValue={nomeAtual}
          placeholder="Seu nome"
          className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium px-4 py-2 disabled:opacity-50 btn-glow"
      >
        {isPending ? "Salvando..." : "Salvar"}
      </button>
      {saved && <p className="text-sm text-[var(--success-text)]">Salvo!</p>}
    </form>
  );
}
