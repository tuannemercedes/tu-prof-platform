// Capa de um item do acervo: a que foi enviada, a vinda do link (YouTube,
// Spotify) ou nenhuma (o cartão mostra a capa padrão da Tu Prof).

export function idYoutube(url: string | null | undefined) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    if (u.hostname.includes("youtube.com")) {
      if (u.searchParams.get("v")) return u.searchParams.get("v");
      const m = u.pathname.match(/\/(embed|shorts)\/([^/?]+)/);
      if (m) return m[2];
    }
  } catch {}
  return null;
}

export function capaDoItem(item: { url?: string | null; capa_url?: string | null; capa_publica?: string | null }) {
  if (item.capa_publica) return item.capa_publica;
  if (item.capa_url) return item.capa_url;
  const yt = idYoutube(item.url);
  if (yt) return `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`;
  return null;
}

// Busca a capa de episódios, podcasts e playlists do Spotify (oEmbed público).
export async function capaDoSpotify(url: string) {
  if (!url.includes("spotify.com")) return null;
  try {
    const r = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!r.ok) return null;
    const j = (await r.json()) as { thumbnail_url?: string; title?: string };
    return { capa: j.thumbnail_url ?? null, titulo: j.title ?? null };
  } catch {
    return null;
  }
}

export const TIPO_ROTULO: Record<string, string> = {
  html: "Leitura",
  pdf: "PDF",
  video: "Vídeo",
  playlist: "Playlist",
  podcast: "Podcast",
  link_externo: "Link",
};

// Para onde um link deve ir por padrão: praticar (FIA) ou estudar (Biblioteca)
export function destinoSugerido(tipo: string): "fia" | "biblioteca" {
  return ["video", "podcast", "playlist"].includes(tipo) ? "fia" : "biblioteca";
}

// Endereço público de uma capa guardada: no Storage (bucket "capas") ou um arquivo
// estático do próprio site (caminho começando com "/"), como as capas de exemplo.
export function urlCapa(
  supabase: { storage: { from: (b: string) => { getPublicUrl: (p: string) => { data: { publicUrl: string } } } } },
  path: string | null | undefined,
) {
  if (!path) return null;
  if (path.startsWith("/") || path.startsWith("http")) return path;
  return supabase.storage.from("capas").getPublicUrl(path).data.publicUrl;
}
