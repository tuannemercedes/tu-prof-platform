// Reconhece o tipo de material a partir do link colado.
export type TipoMaterial = "video" | "podcast" | "playlist" | "pdf" | "link_externo";

export function detectarTipo(link: string): { tipo: TipoMaterial; rotulo: string } {
  const s = link.trim().toLowerCase();
  if (!s) return { tipo: "link_externo", rotulo: "Página" };
  if (s.includes("spotify.com/playlist") || s.includes("youtube.com/playlist")) return { tipo: "playlist", rotulo: "Playlist" };
  if (s.includes("youtu") || s.includes("vimeo.com") || s.includes("mediadelivery.net") || s.includes("bunnycdn")) {
    const protegido = s.includes("mediadelivery.net") || s.includes("bunnycdn");
    return { tipo: "video", rotulo: protegido ? "Vídeo protegido" : "Vídeo" };
  }
  if (s.includes("spotify.com") || s.includes("podcast")) return { tipo: "podcast", rotulo: "Podcast" };
  if (s.endsWith(".pdf") || s.includes(".pdf?")) return { tipo: "pdf", rotulo: "PDF" };
  return { tipo: "link_externo", rotulo: "Página" };
}
