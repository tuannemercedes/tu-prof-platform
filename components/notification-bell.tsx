"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { marcarNovidadesVistas } from "@/app/(aluno)/actions";
import type { Novidade } from "@/lib/notificacoes";

function tempoRelativo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return `há ${d}d`;
}

export default function NotificationBell({ novidades }: { novidades: Novidade[] }) {
  const [aberto, setAberto] = useState(false);
  const [visto, setVisto] = useState(false);
  const [, startTransition] = useTransition();

  const totalNaoVisto = visto ? 0 : novidades.length;

  function toggle() {
    const next = !aberto;
    setAberto(next);
    if (next && !visto) {
      setVisto(true);
      startTransition(() => {
        marcarNovidadesVistas();
      });
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label="Notificações"
        className="relative text-lg leading-none px-1.5 py-1 rounded-md hover:bg-[var(--surface-3)]"
      >
        🔔
        {totalNaoVisto > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] text-[10px] leading-4 text-center font-medium">
            {totalNaoVisto > 9 ? "9+" : totalNaoVisto}
          </span>
        )}
      </button>

      {aberto && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setAberto(false)} />
          <div className="fixed inset-x-4 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-72 max-h-96 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-lg z-50">
            {novidades.length ? (
              <ul className="divide-y divide-[var(--border-soft)]">
                {novidades.map((n) => (
                  <li key={`${n.tipo}-${n.id}`}>
                    <Link
                      href={n.href}
                      onClick={() => setAberto(false)}
                      className="block p-3 text-sm hover:bg-[var(--surface-3)]"
                    >
                      <p>{n.titulo}</p>
                      <p className="text-xs text-[var(--text-faint)] mt-0.5">{tempoRelativo(n.criadoEm)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-4 text-sm text-[var(--text-secondary)] text-center">Nenhuma novidade por aqui.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
