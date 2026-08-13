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

export type MaterialCardData = {
  id: string;
  titulo: string;
  tipo: string;
  conteudo_html: string | null;
  url: string | null;
  signedUrl: string | null;
  concluido: boolean;
};

export default function MaterialCard({ material }: { material: MaterialCardData }) {
  const embedUrl = material.url ? getEmbedUrl(material.url) : null;

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <AccessTracker materialId={material.id} />
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{material.titulo}</p>
          <p className="text-xs text-gray-400">{TIPO_LABELS[material.tipo] ?? material.tipo}</p>
        </div>
        <ProgressCheckbox materialId={material.id} defaultChecked={material.concluido} />
      </div>

      {material.tipo === "html" && material.conteudo_html && (
        <iframe
          sandbox="allow-scripts"
          srcDoc={material.conteudo_html}
          className="w-full h-[480px] rounded-md border border-gray-100"
          title={material.titulo}
        />
      )}

      {material.tipo === "pdf" &&
        (material.signedUrl ? (
          <a
            href={material.signedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            Abrir PDF →
          </a>
        ) : (
          <p className="text-xs text-gray-400">Arquivo indisponível.</p>
        ))}

      {material.tipo !== "html" &&
        material.tipo !== "pdf" &&
        material.url &&
        (embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full h-[180px] rounded-md border border-gray-100"
            allow="encrypted-media; autoplay"
            title={material.titulo}
          />
        ) : (
          <a
            href={material.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            Abrir →
          </a>
        ))}
    </div>
  );
}
