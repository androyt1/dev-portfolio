import type { Metadata, Viewport } from "next";
import { Archivo, Fraunces, JetBrains_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import Cursor from "@/components/Cursor";
import Preloader from "@/components/Preloader";
import Providers from "@/components/Providers";
import "./globals.css";

const SITE_URL = "https://portfolio-next-coral-alpha.vercel.app";

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
  metadataBase: new URL(SITE_URL),
  title: "Andrew Aghoghovwia — Senior Frontend & AI Engineer",
  description:
    "Senior Frontend & AI Engineer with 7+ years shipping production React/TypeScript interfaces and Python-based AI systems: RAG pipelines, agentic workflows and LLM product experiences.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    title: "Andrew Aghoghovwia — Senior Frontend & AI Engineer",
    description:
      "I build polished interfaces, FastAPI services, RAG workflows, and LLM-powered product experiences that are fast, accessible, and ready to ship.",
    url: SITE_URL,
    siteName: "Andrew Aghoghovwia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Andrew Aghoghovwia — Senior Frontend & AI Engineer",
    description:
      "I build polished interfaces, FastAPI services, RAG workflows, and LLM-powered product experiences that are fast, accessible, and ready to ship.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0d",
  width: "device-width",
  initialScale: 1,
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Andrew Aghoghovwia",
  url: SITE_URL,
  jobTitle: "Senior Frontend & AI Engineer",
  description:
    "Senior Frontend & AI Engineer building production React/TypeScript interfaces and Python-based AI systems.",
  knowsAbout: [
    "Frontend Engineering",
    "React",
    "TypeScript",
    "Next.js",
    "FastAPI",
    "Retrieval-Augmented Generation",
    "Large Language Models",
  ],
  sameAs: ["https://github.com/androyt1"],
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
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <div className="grain" aria-hidden="true" />
        <div className="vignette" aria-hidden="true" />
        <Cursor />
        <Preloader />
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
