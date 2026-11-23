"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { confirmarPresencaClube } from "@/app/(aluno)/aluno/clube/actions";

type Props = { temaId: string; tema: string; quando: string; confirmadoInicial: boolean };

export default function ClubeCartao({ temaId, tema, quando, confirmadoInicial }: Props) {
  const [vou, setVou] = useState(confirmadoInicial);
  const [isPending, startTransition] = useTransition();

  function alternar() {
    const novo = !vou;
    setVou(novo);
    startTransition(async () => {
      await confirmarPresencaClube(temaId, novo);
    });
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 flex items-center gap-3.5">
      <Link href="/aluno/clube" className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span className="text-xs text-[var(--text-secondary)]">Club Hispano · {quando}</span>
        <span className="text-[15px] font-semibold">{tema}</span>
      </Link>
      <button
        type="button"
        onClick={alternar}
        disabled={isPending}
        aria-pressed={vou}
        className={`min-w-[92px] h-11 rounded-full text-sm font-semibold border border-[var(--accent)] ${
          vou ? "bg-[var(--accent)] text-[var(--accent-contrast)]" : "bg-[var(--surface)] text-[var(--text-primary)]"
        }`}
      >
        {vou ? "Confirmado" : "Vou"}
      </button>
    </div>
  );
}
