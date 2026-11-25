"use client";

import { useState, useTransition } from "react";
import { salvarAvisos } from "@/app/avisos-actions";

export type OpcaoAviso = { chave: string; titulo: string; descricao: string };

// Liga/desliga cada tipo de aviso por e-mail. Salva na hora, a cada toque.
export default function AvisosPreferencias({ opcoes, atuais }: { opcoes: OpcaoAviso[]; atuais: Record<string, unknown> }) {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(opcoes.map((o) => [o.chave, atuais?.[o.chave] !== false]))
  );
  const [msg, setMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function alternar(chave: string) {
    const novo = { ...prefs, [chave]: !prefs[chave] };
    setPrefs(novo);
    setMsg(null);
    startTransition(async () => {
      const r = await salvarAvisos(novo);
      setMsg(r?.error ?? "✓ Salvo");
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="m-0 p-0 list-none divide-y divide-[var(--border-soft)] border border-[var(--border)] rounded-2xl bg-[var(--surface)]">
        {opcoes.map((o) => (
          <li key={o.chave}>
            <label className="flex items-center gap-3.5 px-4 py-3.5 cursor-pointer">
              <span className="flex-1 flex flex-col gap-0.5">
                <span className="text-[15px] font-semibold">{o.titulo}</span>
                <span className="text-[13px] text-[var(--text-secondary)]">{o.descricao}</span>
              </span>
              <input
                type="checkbox"
                role="switch"
                checked={prefs[o.chave]}
                onChange={() => alternar(o.chave)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={`relative w-11 h-[26px] rounded-full transition-colors shrink-0 peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent)] ${
                  prefs[o.chave] ? "bg-[var(--gold)]" : "bg-[var(--border-strong)]"
                }`}
              >
                <span
                  className={`absolute top-[3px] w-5 h-5 rounded-full bg-white shadow transition-[left] ${prefs[o.chave] ? "left-[21px]" : "left-[3px]"}`}
                />
              </span>
            </label>
          </li>
        ))}
      </ul>
      <span role="status" className="text-[13px] text-[var(--text-secondary)] min-h-5">
        {isPending ? "Salvando..." : msg}
      </span>
    </div>
  );
}
