export function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);

    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    // Vídeos protegidos (Bunny Stream): o link de "play" vira o de incorporação
    if (u.hostname.includes("mediadelivery.net")) {
      return url.replace("/play/", "/embed/");
    }
    if (u.hostname === "vimeo.com" && /^\/\d+/.test(u.pathname)) {
      return `https://player.vimeo.com/video${u.pathname}`;
    }
    if (u.hostname.includes("open.spotify.com") && !u.pathname.startsWith("/embed/")) {
      return url.replace("open.spotify.com/", "open.spotify.com/embed/");
    }

    return null;
  } catch {
    return null;
  }
}
