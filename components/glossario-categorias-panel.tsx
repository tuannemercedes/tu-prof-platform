"use client";

import { useState, useTransition } from "react";
import { criarCategoria } from "@/app/(admin)/admin/glossario/actions";
import GlossarioForm from "./glossario-form";
import GlossarioImportForm from "./glossario-import-form";

const SEM_CATEGORIA = "Sem categoria";

export default function GlossarioCategoriasPanel({ categorias: categoriasIniciais }: { categorias: string[] }) {
  const [categorias, setCategorias] = useState(categoriasIniciais);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(categoriasIniciais[0] ?? null);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCriarCategoria() {
    const nome = novaCategoria.trim();
    if (!nome) return;
    setError(null);
    startTransition(async () => {
      const result = await criarCategoria(nome);
      if (result?.error) {
        setError(result.error);
      } else {
        setCategorias((prev) => [...new Set([...prev, nome])].sort((a, b) => a.localeCompare(b)));
        setCategoriaAtiva(nome);
        setNovaCategoria("");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategoriaAtiva(null)}
          className={`text-xs px-3 py-1 rounded-full border ${
            categoriaAtiva === null
              ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)]"
              : "border-[var(--border-strong)] hover:bg-[var(--surface-3)]"
          }`}
        >
          {SEM_CATEGORIA}
        </button>
        {categorias.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategoriaAtiva(c)}
            className={`text-xs px-3 py-1 rounded-full border ${
              categoriaAtiva === c
                ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)]"
                : "border-[var(--border-strong)] hover:bg-[var(--surface-3)]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={novaCategoria}
          onChange={(e) => setNovaCategoria(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleCriarCategoria();
            }
          }}
          placeholder="Nova categoria (ex: UX)"
          className="bg-[var(--surface)] rounded-md border border-[var(--border-strong)] px-3 py-1.5 text-sm flex-1"
        />
        <button
          type="button"
          onClick={handleCriarCategoria}
          disabled={isPending || !novaCategoria.trim()}
          className="text-xs rounded-md border border-[var(--border-strong)] px-3 py-1.5 hover:bg-[var(--surface-3)] disabled:opacity-50 whitespace-nowrap"
        >
          + Criar categoria
        </button>
      </div>
      {error && <p className="text-sm text-[var(--danger-text)]">{error}</p>}

      <div className="rounded-lg border border-[var(--border)] p-4 space-y-4">
        <p className="text-sm font-medium">
          Adicionando em: <span className="text-[var(--accent)]">{categoriaAtiva ?? SEM_CATEGORIA}</span>
        </p>
        <GlossarioForm categoria={categoriaAtiva} />
        <div className="border-t border-[var(--border-soft)] pt-4">
          <GlossarioImportForm categoria={categoriaAtiva} />
        </div>
      </div>
    </div>
  );
}
