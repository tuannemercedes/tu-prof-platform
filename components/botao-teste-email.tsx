"use client";

import { useState, useTransition } from "react";
import { enviarTeste } from "@/app/avisos-actions";

export default function BotaoTesteEmail({ email }: { email: string }) {
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            setMsg(null);
            const r = await enviarTeste();
            setMsg(r?.error ? { ok: false, texto: r.error } : { ok: true, texto: `Enviado para ${email}. Confira sua caixa de entrada (e o spam).` });
          })
        }
        className="h-10 px-4 rounded-xl border border-[var(--border-strong)] text-sm font-semibold hover:bg-[var(--surface-2)] disabled:opacity-60"
      >
        {isPending ? "Enviando..." : "Enviar um e-mail de teste para mim"}
      </button>
      {msg && (
        <span role="status" className={`text-sm ${msg.ok ? "text-[var(--success-text)]" : "text-[var(--danger-text)]"}`}>
          {msg.texto}
        </span>
      )}
    </div>
  );
}
