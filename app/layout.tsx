import type { Metadata, Viewport } from "next";
import { Archivo, Fraunces, JetBrains_Mono } from "next/font/google";
import Cursor from "@/components/Cursor";
import Preloader from "@/components/Preloader";
import Providers from "@/components/Providers";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Andrew Aghoghovwia — Senior Frontend & AI Engineer",
  description:
    "Senior Frontend & AI Engineer with 7+ years shipping production React/TypeScript interfaces and Python-based AI systems: RAG pipelines, agentic workflows and LLM product experiences.",
  openGraph: {
    title: "Andrew Aghoghovwia — Senior Frontend & AI Engineer",
    description:
      "I build polished interfaces, FastAPI services, RAG workflows, and LLM-powered product experiences that are fast, accessible, and ready to ship.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${archivo.variable} ${mono.variable}`}
    >
      <body>
        <div className="grain" aria-hidden="true" />
        <div className="vignette" aria-hidden="true" />
        <Cursor />
        <Preloader />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
