"use client";

import { useState, useTransition } from "react";
import { updatePasswordAfterRecovery } from "@/app/redefinir-senha/actions";

export default function RedefinirSenhaForm() {
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setErro(null);
    startTransition(async () => {
      const result = await updatePasswordAfterRecovery(formData);
      if (result?.error) setErro(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <div>
        <label className="text-xs text-[var(--text-secondary)] block mb-1">Nova senha</label>
        <input
          type="password"
          name="novaSenha"
          required
          minLength={6}
          className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-[var(--text-secondary)] block mb-1">Confirmar nova senha</label>
        <input
          type="password"
          name="confirmarSenha"
          required
          minLength={6}
          className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-medium py-2 disabled:opacity-50 btn-glow"
      >
        {isPending ? "Salvando..." : "Salvar nova senha"}
      </button>
      {erro && <p className="text-sm text-[var(--danger-text)] text-center">{erro}</p>}
    </form>
  );
}
