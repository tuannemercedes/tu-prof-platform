"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type ItemBiblioteca = {
  id: string;
  grupo: "fia" | "glossario" | "material";
  tag: string;
  titulo: string;
  descricao: string;
  href: string;
};

const FILTROS = [
  { valor: "tudo", label: "Tudo" },
  { valor: "fia", label: "FIA" },
  { valor: "glossario", label: "Glossário" },
  { valor: "material", label: "Materiais" },
] as const;

const SELO: Record<ItemBiblioteca["grupo"], string> = {
  fia: "bg-[var(--navy)] text-[var(--gold-light)]",
  glossario: "bg-[var(--warning-bg)] text-[var(--warning-text)]",
  material: "bg-[var(--info-bg)] text-[var(--info-text)]",
};

function normalizar(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export default function BibliotecaLista({ itens }: { itens: ItemBiblioteca[] }) {
  const [filtro, setFiltro] = useState<string>("tudo");
  const [busca, setBusca] = useState("");

  const visiveis = useMemo(() => {
    const q = normalizar(busca.trim());
    return itens.filter(
      (i) =>
        (filtro === "tudo" || i.grupo === filtro) &&
        (!q || normalizar(`${i.titulo} ${i.descricao}`).includes(q))
    );
  }, [itens, filtro, busca]);

  return (
    <div className="flex flex-col gap-[18px]">
      <label className="flex items-center gap-2.5 h-[50px] rounded-[14px] bg-[var(--surface)] border border-[var(--border)] px-3.5">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-4-4" />
        </svg>
        <span className="sr-only">Buscar</span>
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar palavra, material ou tema"
          className="flex-1 bg-transparent outline-none text-[15px]"
        />
      </label>

      <div className="flex gap-2 flex-wrap">
        {FILTROS.map((f) => {
          const on = filtro === f.valor;
          return (
            <button
              key={f.valor}
              type="button"
              onClick={() => setFiltro(f.valor)}
              aria-pressed={on}
              className={`h-10 px-4 rounded-full text-sm font-medium border ${
                on
                  ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)]"
                  : "bg-[var(--surface)] border-[var(--border-strong)]"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2.5">
        {visiveis.length ? (
          visiveis.map((it) => (
            <Link
              key={`${it.grupo}-${it.id}`}
              href={it.href}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-[14px] p-3.5 flex gap-3.5 items-center"
            >
              <span
                className={`w-[52px] h-[52px] shrink-0 rounded-xl flex items-center justify-center text-[11px] font-semibold tracking-[0.04em] ${SELO[it.grupo]}`}
              >
                {it.tag}
              </span>
              <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="text-[15px] font-semibold">{it.titulo}</span>
                {it.descricao && (
                  <span className="text-[13px] text-[var(--text-secondary)] leading-snug line-clamp-2">{it.descricao}</span>
                )}
              </span>
            </Link>
          ))
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">
            {itens.length ? "Nada encontrado com esse filtro." : "A sua biblioteca ainda está vazia."}
          </p>
        )}
      </div>
    </div>
  );
}
