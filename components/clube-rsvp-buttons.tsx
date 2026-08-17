"use client";

import { useState, useTransition } from "react";
import { confirmarPresencaClube } from "@/app/(aluno)/aluno/clube/actions";

type Props = {
  temaId: string;
  confirmadoInicial: boolean | null;
};

export default function ClubeRsvpButtons({ temaId, confirmadoInicial }: Props) {
  const [confirmado, setConfirmado] = useState(confirmadoInicial);
  const [isPending, startTransition] = useTransition();

  function handleClick(value: boolean) {
    setConfirmado(value);
    startTransition(async () => {
      await confirmarPresencaClube(temaId, value);
    });
  }

  return (
    <div className="space-y-2 pt-1">
      <p className="text-xs text-[var(--text-secondary)]">Você vai participar desse encontro?</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleClick(true)}
          disabled={isPending}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            confirmado === true
              ? "bg-[var(--success-bg)] text-[var(--success-text)] ring-1 ring-[var(--success-text)]"
              : "bg-[var(--surface-3)] hover:bg-[var(--border)]"
          }`}
        >
          Vou participar ✓
        </button>
        <button
          type="button"
          onClick={() => handleClick(false)}
          disabled={isPending}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            confirmado === false
              ? "bg-[var(--danger-bg)] text-[var(--danger-text)] ring-1 ring-[var(--danger-text)]"
              : "bg-[var(--surface-3)] hover:bg-[var(--border)]"
          }`}
        >
          Não vou
        </button>
      </div>
    </div>
  );
}
