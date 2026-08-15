import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tu Prof",
    short_name: "Tu Prof",
    description: "Plataforma de mentoria — materiais, turmas e acompanhamento dos alunos.",
    start_url: "/",
    display: "standalone",
    background_color: "#0d1b2a",
    theme_color: "#c46a43",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
