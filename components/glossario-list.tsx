"use client";

import { useMemo, useState } from "react";

type Termo = { id: string; termo: string; definicao: string; exemplo: string | null };

export default function GlossarioList({ termos }: { termos: Termo[] }) {
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return termos;
    return termos.filter(
      (t) => t.termo.toLowerCase().includes(q) || t.definicao.toLowerCase().includes(q)
    );
  }, [busca, termos]);

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar termo..."
        className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
      />

      {filtrados.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">Nenhum termo encontrado.</p>
      ) : (
        <ul className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-lg">
          {filtrados.map((t) => (
            <li key={t.id} className="p-4">
              <p className="text-sm font-semibold">{t.termo}</p>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">{t.definicao}</p>
              {t.exemplo && (
                <p className="text-xs text-[var(--text-faint)] italic mt-1">&ldquo;{t.exemplo}&rdquo;</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
