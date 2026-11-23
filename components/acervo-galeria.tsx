"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type ItemAcervo = {
  id: string;
  area: "fia" | "biblioteca";
  tipo: string;
  tag: string;
  titulo: string;
  colecao: string;
  capa: string | null;
  href: string;
};

const ABAS = {
  fia: {
    label: "FIA",
    sub: "Praticar: assistir, ouvir e treinar",
    filtros: [
      { v: "tudo", l: "Tudo" },
      { v: "video", l: "Vídeos, séries e filmes" },
      { v: "podcast", l: "Podcasts" },
      { v: "playlist", l: "Playlists" },
    ],
  },
  biblioteca: {
    label: "Biblioteca",
    sub: "Estudar: ler e consultar",
    filtros: [
      { v: "tudo", l: "Tudo" },
      { v: "leitura", l: "Leituras e PDFs" },
      { v: "glossario", l: "Glossário" },
    ],
  },
} as const;

function normalizar(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function CapaPadrao({ item }: { item: ItemAcervo }) {
  const glossario = item.tipo === "glossario";
  return (
    <div
      className={`absolute inset-0 flex flex-col justify-end p-3.5 ${
        glossario ? "bg-[var(--warning-bg)] text-[var(--warning-text)]" : "bg-[var(--navy)] text-[var(--gold-light)]"
      }`}
    >
      <span className={`font-serif font-semibold leading-tight line-clamp-3 ${glossario ? "text-[22px]" : "text-[19px]"}`}>
        {item.titulo}
      </span>
    </div>
  );
}

export default function AcervoGaleria({ itens, abaInicial }: { itens: ItemAcervo[]; abaInicial: "fia" | "biblioteca" }) {
  const [aba, setAba] = useState<"fia" | "biblioteca">(abaInicial);
  const [filtro, setFiltro] = useState("tudo");
  const [busca, setBusca] = useState("");

  const visiveis = useMemo(() => {
    const q = normalizar(busca.trim());
    return itens.filter((i) => {
      if (i.area !== aba) return false;
      if (filtro === "leitura" && !["pdf", "html", "link_externo"].includes(i.tipo)) return false;
      if (filtro !== "tudo" && filtro !== "leitura" && i.tipo !== filtro) return false;
      return !q || normalizar(`${i.titulo} ${i.colecao}`).includes(q);
    });
  }, [itens, aba, filtro, busca]);

  const conf = ABAS[aba];

  return (
    <div className="flex flex-col gap-[18px]">
      <div role="tablist" aria-label="Áreas do acervo" className="grid grid-cols-2 gap-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-1.5">
        {(["fia", "biblioteca"] as const).map((a) => {
          const on = a === aba;
          return (
            <button
              key={a}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => {
                setAba(a);
                setFiltro("tudo");
              }}
              className={`rounded-xl py-2.5 px-2 flex flex-col items-center gap-0.5 ${
                on ? "bg-[var(--navy)] text-[var(--on-navy)]" : "text-[var(--text-secondary)]"
              }`}
            >
              <span className="text-[15px] font-semibold">{ABAS[a].label}</span>
              <span className={`text-[11px] ${on ? "text-[var(--gold-light)]" : ""}`}>{ABAS[a].sub.split(":")[0]}</span>
            </button>
          );
        })}
      </div>
      <p className="m-0 -mt-1.5 text-[13px] text-[var(--text-secondary)]">{conf.sub}</p>

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
          placeholder={aba === "fia" ? "Buscar série, podcast, playlist..." : "Buscar leitura ou palavra..."}
          className="flex-1 bg-transparent outline-none text-[15px]"
        />
      </label>

      <div className="flex gap-2 overflow-x-auto pb-0.5">
        {conf.filtros.map((f) => {
          const on = filtro === f.v;
          return (
            <button
              key={f.v}
              type="button"
              onClick={() => setFiltro(f.v)}
              aria-pressed={on}
              className={`shrink-0 h-10 px-4 rounded-full text-sm font-medium border ${
                on ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)]" : "bg-[var(--surface)] border-[var(--border-strong)]"
              }`}
            >
              {f.l}
            </button>
          );
        })}
      </div>

      {visiveis.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {visiveis.map((it) => (
            <Link key={`${it.tipo}-${it.id}`} href={it.href} className="group flex flex-col gap-2">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface-3)]">
                {it.capa ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.capa} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-[1.03]" />
                ) : (
                  <CapaPadrao item={it} />
                )}
                <span className="absolute top-2 left-2 text-[11px] font-semibold px-2 py-1 rounded-lg bg-[var(--navy)]/85 text-[var(--gold-light)] backdrop-blur-sm">
                  {it.tag}
                </span>
              </div>
              <span className="flex flex-col gap-0.5 px-0.5">
                <span className="text-[14px] font-semibold leading-snug line-clamp-2">{it.titulo}</span>
                {it.colecao && <span className="text-xs text-[var(--text-secondary)] line-clamp-1">{it.colecao}</span>}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--text-secondary)]">
          {itens.some((i) => i.area === aba) ? "Nada encontrado com esse filtro." : `Ainda não há itens na ${conf.label}.`}
        </p>
      )}
    </div>
  );
}
