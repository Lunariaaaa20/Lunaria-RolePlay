import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lunaria",
    short_name: "Lunaria",
    description: "Premium fantasy roleplay guild management web app.",
    start_url: "/",
    display: "standalone",
    background_color: "#060816",
    theme_color: "#060816",
    orientation: "portrait",
    lang: "id-ID",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
