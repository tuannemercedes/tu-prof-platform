"use client";

import { useEffect, useRef, useState } from "react";
import { getEmbedUrl } from "@/lib/embed";
import ProgressCheckbox from "./progress-checkbox";
import AccessTracker from "./access-tracker";
import IconeTipo from "./icone-tipo";

const TIPO_LABELS: Record<string, string> = {
  html: "Página interativa",
  pdf: "PDF",
  video: "Vídeo",
  playlist: "Playlist",
  podcast: "Podcast",
  link_externo: "Link",
};

export type MaterialCardData = {
  id: string;
  titulo: string;
  tipo: string;
  conteudo_html: string | null;
  url: string | null;
  signedUrl: string | null;
  concluido: boolean;
  capaUrl?: string | null;
};

function HtmlFrame({ conteudoHtml, titulo }: { conteudoHtml: string; titulo: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(240);

  function handleLoad() {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    const contentHeight = doc.documentElement.scrollHeight;
    setHeight(Math.min(Math.max(contentHeight + 8, 160), 900));
  }

  return (
    <iframe
      ref={iframeRef}
      sandbox="allow-scripts allow-same-origin"
      srcDoc={conteudoHtml}
      onLoad={handleLoad}
      style={{ height }}
      className="w-full rounded-md border border-[var(--border-soft)] transition-[height] duration-200"
      title={titulo}
    />
  );
}

export default function MaterialCard({ material, readOnly = false }: { material: MaterialCardData; readOnly?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [accessed, setAccessed] = useState(false);
  const embedUrl = material.url ? getEmbedUrl(material.url) : null;

  useEffect(() => {
    // Abre o material quando o endereço aponta para ele (link "Continuar" ou vindo da Trilha).
    const abrir = () => {
      if (window.location.hash === `#material-${material.id}`) {
        setExpanded(true);
        setAccessed(true);
      }
    };
    abrir();
    window.addEventListener("hashchange", abrir);
    return () => window.removeEventListener("hashchange", abrir);
  }, [material.id]);

  function toggle() {
    const next = !expanded;
    setExpanded(next);
    if (next) setAccessed(true);
  }

  return (
    <div
      id={`material-${material.id}`}
      className={`card-lift rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-hidden ${
        expanded ? "sm:col-span-2 lg:col-span-3" : ""
      }`}
    >
      {!readOnly && accessed && <AccessTracker materialId={material.id} />}

      {!expanded ? (
        <div
          role="button"
          tabIndex={0}
          onClick={toggle}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), toggle())}
          className="cursor-pointer"
        >
          <div className="relative aspect-video w-full overflow-hidden bg-[var(--surface-2)]">
            {material.capaUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={material.capaUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="capa-padrao w-full h-full flex items-center justify-center text-[#e9cf8a]">
                <IconeTipo tipo={material.tipo} size={44} />
              </div>
            )}
          </div>
          <div className="p-3">
            <p className="text-sm font-medium truncate">{material.titulo}</p>
            <p className="text-xs text-[var(--text-faint)]">{TIPO_LABELS[material.tipo] ?? material.tipo}</p>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={toggle}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), toggle())}
          className="cursor-pointer flex items-center gap-3 p-3"
        >
          <div
            className={`shrink-0 w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center text-[#e9cf8a] bg-[var(--surface-2)] ${
              material.capaUrl ? "" : "capa-padrao"
            }`}
          >
            {material.capaUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={material.capaUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <IconeTipo tipo={material.tipo} size={20} />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{material.titulo}</p>
            <p className="text-xs text-[var(--text-faint)]">{TIPO_LABELS[material.tipo] ?? material.tipo}</p>
          </div>
          <span className="ml-auto shrink-0 inline-flex items-center gap-1 h-8 px-3 rounded-full border border-[var(--border-strong)] text-xs font-semibold">
            Fechar
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </span>
        </div>
      )}

      <div className="px-3 pb-3 flex items-center justify-between gap-2">
        {readOnly ? (
          <label className="flex items-center gap-1.5 text-xs text-[var(--text-faint)] whitespace-nowrap">
            <input type="checkbox" checked={material.concluido} disabled />
            Concluído
          </label>
        ) : (
          <ProgressCheckbox materialId={material.id} defaultChecked={material.concluido} />
        )}
        <button type="button" onClick={toggle} className="text-xs text-[var(--accent)] hover:underline whitespace-nowrap">
          {expanded ? "Fechar ▲" : "Abrir ▼"}
        </button>
      </div>

      {expanded && (
        <div className="px-3 pb-3">
          {material.tipo === "html" && material.conteudo_html && <HtmlFrame conteudoHtml={material.conteudo_html} titulo={material.titulo} />}

          {material.tipo === "pdf" &&
            (material.signedUrl ? (
              <a href={material.signedUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--accent)] hover:underline">
                Abrir PDF →
              </a>
            ) : (
              <p className="text-xs text-[var(--text-faint)]">Arquivo indisponível.</p>
            ))}

          {material.tipo !== "html" &&
            material.tipo !== "pdf" &&
            material.url &&
            (/\.(mp4|webm|m4v)(\?|$)/i.test(material.url) ? (
              <video
                src={material.url}
                controls
                playsInline
                preload="metadata"
                className="w-full aspect-video rounded-xl border border-[var(--border-soft)] bg-black"
              />
            ) : embedUrl ? (
              <iframe
                src={embedUrl}
                className="w-full aspect-video rounded-xl border border-[var(--border-soft)] bg-black"
                allow="encrypted-media; autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title={material.titulo}
              />
            ) : (
              <a href={material.url} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--accent)] hover:underline">
                Abrir →
              </a>
            ))}
        </div>
      )}
    </div>
  );
}
