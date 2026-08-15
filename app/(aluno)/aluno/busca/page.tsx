"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { buscarMateriais, type ResultadoBusca } from "./actions";

const TIPO_LABELS: Record<string, string> = {
  html: "Página interativa",
  pdf: "PDF",
  video: "Vídeo",
  playlist: "Playlist",
  podcast: "Podcast",
  link_externo: "Link",
};

export default function BuscaPage() {
  const [termo, setTermo] = useState("");
  const [resultados, setResultados] = useState<ResultadoBusca[]>([]);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleChange(value: string) {
    setTermo(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const r = await buscarMateriais(value);
        setResultados(r);
      });
    }, 300);
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-lg font-serif font-semibold">Buscar materiais</h1>
        <p className="text-sm text-[var(--text-secondary)]">Procure por qualquer material liberado pra você.</p>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={termo}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Digite o nome do material..."
        className="bg-[var(--surface)] w-full rounded-md border border-[var(--border-strong)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
      />

      {isPending && <p className="text-xs text-[var(--text-faint)]">Buscando...</p>}

      {!isPending && termo.trim() && resultados.length === 0 && (
        <p className="text-sm text-[var(--text-secondary)]">Nenhum material encontrado com esse nome.</p>
      )}

      {resultados.length > 0 && (
        <ul className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-lg overflow-hidden">
          {resultados.map((r) => (
            <li key={r.id}>
              <Link
                href={`/aluno/materias/${r.materiaId}#material-${r.id}`}
                className="block p-3 hover:bg-[var(--surface-3)]"
              >
                <p className="text-sm font-medium">{r.titulo}</p>
                <p className="text-xs text-[var(--text-faint)]">
                  {r.materiaTitulo} · {TIPO_LABELS[r.tipo] ?? r.tipo}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
