"use client";

import { useMemo, useState } from "react";

type Termo = { id: string; termo: string; definicao: string; exemplo: string | null; categoria: string | null };

const SEM_CATEGORIA = "Outros";

export default function GlossarioList({ termos }: { termos: Termo[] }) {
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);

  const categorias = useMemo(() => {
    const set = new Set<string>();
    termos.forEach((t) => set.add(t.categoria || SEM_CATEGORIA));
    return [...set].sort((a, b) => (a === SEM_CATEGORIA ? 1 : b === SEM_CATEGORIA ? -1 : a.localeCompare(b)));
  }, [termos]);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return termos.filter((t) => {
      const categoria = t.categoria || SEM_CATEGORIA;
      if (categoriaAtiva && categoria !== categoriaAtiva) return false;
      if (!q) return true;
      return t.termo.toLowerCase().includes(q) || t.definicao.toLowerCase().includes(q);
    });
  }, [busca, categoriaAtiva, termos]);

  const grupos = useMemo(() => {
    const map = new Map<string, Termo[]>();
    filtrados.forEach((t) => {
      const categoria = t.categoria || SEM_CATEGORIA;
      if (!map.has(categoria)) map.set(categoria, []);
      map.get(categoria)!.push(t);
    });
    return [...map.entries()].sort(([a], [b]) =>
      a === SEM_CATEGORIA ? 1 : b === SEM_CATEGORIA ? -1 : a.localeCompare(b)
    );
  }, [filtrados]);

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar palavra ou tradução..."
        className="bg-[var(--surface)] w-full h-[50px] rounded-[14px] border border-[var(--border)] px-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
      />

      {categorias.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          <button
            type="button"
            onClick={() => setCategoriaAtiva(null)}
            className={`shrink-0 h-10 px-4 rounded-full text-sm font-medium border ${
              categoriaAtiva === null
                ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)]"
                : "bg-[var(--surface)] border-[var(--border-strong)]"
            }`}
          >
            Todas
          </button>
          {categorias.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategoriaAtiva(c)}
              className={`shrink-0 h-10 px-4 rounded-full text-sm font-medium border ${
                categoriaAtiva === c
                  ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)]"
                  : "bg-[var(--surface)] border-[var(--border-strong)]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {grupos.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">Nenhum termo encontrado.</p>
      ) : (
        <div className="space-y-6">
          {grupos.map(([categoria, itens]) => (
            <div key={categoria} className="space-y-2">
              {categorias.length > 1 && (
                <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                  {categoria}
                </h2>
              )}
              <ul className="divide-y divide-[var(--border-soft)] border border-[var(--border)] rounded-2xl bg-[var(--surface)] overflow-hidden">
                {itens.map((t) => (
                  <li key={t.id} className="p-4">
                    <p className="font-serif text-[20px] font-semibold leading-tight">{t.termo}</p>
                    <p className="text-[15px] text-[var(--text-secondary)] mt-1">{t.definicao}</p>
                    {t.exemplo && (
                      <p className="text-[13px] text-[var(--text-faint)] italic mt-1.5">&ldquo;{t.exemplo}&rdquo;</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
