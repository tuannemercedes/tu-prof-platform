export function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);

    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    if (u.hostname.includes("open.spotify.com") && !u.pathname.startsWith("/embed/")) {
      return url.replace("open.spotify.com/", "open.spotify.com/embed/");
    }

    return null;
  } catch {
    return null;
  }
}
