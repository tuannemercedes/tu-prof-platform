import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tu Prof",
    short_name: "Tu Prof",
    description: "Plataforma de mentoria — materiais, turmas e acompanhamento dos alunos.",
    start_url: "/",
    display: "standalone",
    background_color: "#ede3d2",
    theme_color: "#c46a43",
    icons: [
      { src: "/pwa-icon-192", sizes: "192x192", type: "image/png" },
      { src: "/pwa-icon-512", sizes: "512x512", type: "image/png" },
    ],
  };
}
