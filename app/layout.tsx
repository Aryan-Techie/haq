import type { Metadata, Viewport } from "next";
import { Lexend, Source_Sans_3, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source",
  display: "swap",
});

const notoHindi = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-noto-hindi",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Haq · हक़ — Delhi Labour Rights Assistant",
  description:
    "अपने मज़दूरी के हक़ जानिए. Know your labour rights in plain Hindi — minimum wage, e-Shram, welfare boards, and how to file a complaint in Delhi.",
  applicationName: "Haq",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Haq" },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="hi"
      className={`${lexend.variable} ${sourceSans.variable} ${notoHindi.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
