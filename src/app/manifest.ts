import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Qualisapio",
    short_name: "Qualisapio",
    description: "AI-powered review for qualitative social science.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/mascot/qualisapio-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/mascot/qualisapio-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
