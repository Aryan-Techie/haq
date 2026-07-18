import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Haq · हक़ — Delhi Labour Rights",
    short_name: "Haq",
    description:
      "अपने मज़दूरी के हक़ जानिए. Know your labour rights in plain Hindi — minimum wage, e-Shram, welfare boards, and how to file a complaint in Delhi.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8fafc",
    theme_color: "#0f172a",
    categories: ["government", "education", "utilities"],
    lang: "hi",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
