"use client";

import { useEffect, useRef, useState } from "react";
import { getEmbedUrl } from "@/lib/embed";
import ProgressCheckbox from "./progress-checkbox";
import AccessTracker from "./access-tracker";

const TIPO_LABELS: Record<string, string> = {
  html: "Página interativa",
  pdf: "PDF",
  video: "Vídeo",
  playlist: "Playlist",
  podcast: "Podcast",
  link_externo: "Link",
};

const TIPO_ICONS: Record<string, string> = {
  html: "🧩",
  pdf: "📄",
  video: "🎥",
  playlist: "🎵",
  podcast: "🎙️",
  link_externo: "🔗",
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

export default function MaterialCard({
  material,
  readOnly = false,
}: {
  material: MaterialCardData;
  readOnly?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [accessed, setAccessed] = useState(false);
  const embedUrl = material.url ? getEmbedUrl(material.url) : null;

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === `#material-${material.id}`) {
      setExpanded(true);
    }
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
              <div
                className="w-full h-full flex items-center justify-center text-4xl"
                style={{
                  background:
                    "linear-gradient(135deg, var(--accent) 0%, var(--accent-secondary) 100%)",
                }}
              >
                {TIPO_ICONS[material.tipo] ?? "📎"}
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
            className="shrink-0 w-10 h-10 rounded-md overflow-hidden flex items-center justify-center text-lg bg-[var(--surface-2)]"
            style={
              !material.capaUrl
                ? { background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-secondary) 100%)" }
                : undefined
            }
          >
            {material.capaUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={material.capaUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              TIPO_ICONS[material.tipo] ?? "📎"
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{material.titulo}</p>
            <p className="text-xs text-[var(--text-faint)]">{TIPO_LABELS[material.tipo] ?? material.tipo}</p>
          </div>
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
        <button
          type="button"
          onClick={toggle}
          className="text-xs text-[var(--accent)] hover:underline whitespace-nowrap"
        >
          {expanded ? "Fechar ▲" : "Abrir ▼"}
        </button>
      </div>

      {expanded && (
        <div className="px-3 pb-3">
          {material.tipo === "html" && material.conteudo_html && (
            <HtmlFrame conteudoHtml={material.conteudo_html} titulo={material.titulo} />
          )}

          {material.tipo === "pdf" &&
            (material.signedUrl ? (
              <a
                href={material.signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--accent)] hover:underline"
              >
                Abrir PDF →
              </a>
            ) : (
              <p className="text-xs text-[var(--text-faint)]">Arquivo indisponível.</p>
            ))}

          {material.tipo !== "html" &&
            material.tipo !== "pdf" &&
            material.url &&
            (embedUrl ? (
              <iframe
                src={embedUrl}
                className="w-full h-[220px] rounded-md border border-[var(--border-soft)]"
                allow="encrypted-media; autoplay"
                title={material.titulo}
              />
            ) : (
              <a
                href={material.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--accent)] hover:underline"
              >
                Abrir →
              </a>
            ))}
        </div>
      )}
    </div>
  );
}
