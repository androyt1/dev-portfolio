export type Experience = {
  date: string;
  role: string;
  org: string;
  desc: string;
  tags: string[];
};

export type Project = {
  year: string;
  title: string;
  em: string;
  desc: string;
  stack: string[];
};

export type SkillGroup = {
  title: string;
  n: string;
  items: string[];
};

export type Stat = {
  pre: string;
  em: string;
  post?: string;
  label: string;
};

export const stats: Stat[] = [
  { pre: "7", em: "+", label: "Years shipping" },
  { pre: "40", em: "%", label: "Perf gain @ HSBC" },
  { pre: "10", em: "+", label: "E-commerce platforms" },
  { pre: "<100", em: "ms", label: "Data-view response" },
];

export const experience: Experience[] = [
  {
    date: "08/2023 — Present",
    role: "Frontend & AI Engineer",
    org: "Contract / R&D · Remote",
    desc: "Engineered production RAG pipelines (OpenAI, Gemini Vision, Pinecone, Weaviate) and shipped user-facing AI experiences in Next.js. Built agentic workflows in LangChain/LangGraph with LangSmith tracing and RAGAS/openevals evaluation.",
    tags: ["Next.js", "LangGraph", "Pinecone", "RAGAS"],
  },
  {
    date: "12/2022 — 08/2023",
    role: "Senior Frontend Developer",
    org: "HSBC · Leeds, UK",
    desc: "Delivered onboarding & ETL-tracking interfaces in React/TypeScript on the internal Masala Design System. Improved performance by 40% via code-splitting and memoization, and cut deployment turnaround 30% with DevOps.",
    tags: ["React", "Design Systems", "AWS", "Mentoring"],
  },
  {
    date: "02/2021 — 11/2022",
    role: "Lead Frontend Developer",
    org: "E-commerce · Contract · Remote",
    desc: "Delivered 10+ high-performance storefronts with Next.js, Tailwind and Shopify APIs, plus custom analytics dashboards in D3.js / Chart.js. Integrated GTM, GA4 and automated SEO audits.",
    tags: ["Shopify", "Tailwind", "D3.js", "GA4"],
  },
  {
    date: "2016 — 2020",
    role: "Full-Stack Web Developer",
    org: "Kobu Innovative Solutions · Warri, NG",
    desc: "Led a legacy-to-React/Vue rewrite that lifted load times and UX metrics 30%. Built real-time chat and notifications over WebSockets and full-stack commerce with Stripe and PayPal.",
    tags: ["React", "Vue", "WebSockets", "Stripe"],
  },
];

export const projects: Project[] = [
  {
    year: "2025",
    title: "DevLens —",
    em: "AI Repo Analyser",
    desc: "AI tool that analyses public repositories and auto-generates codebase summaries, stack breakdowns, code-quality reports and README drafts.",
    stack: ["React", "TypeScript", "Claude API", "GitHub API"],
  },
  {
    year: "2025",
    title: "RAG",
    em: "CV Assistant",
    desc: "Production RAG pipeline that ingests resume data into Pinecone and answers recruiter questions with traced, cited responses.",
    stack: ["Python", "FastAPI", "LangGraph", "Pinecone", "LangSmith"],
  },
  {
    year: "2024",
    title: "AI",
    em: "Study Companion",
    desc: "Context-aware study assistant: upload documents and query them in natural language, including multimodal PDF analysis with Gemini Vision.",
    stack: ["Next.js", "OpenAI", "RAG", "Gemini Vision"],
  },
  {
    year: "2022",
    title: "Real-Time",
    em: "Collab Board",
    desc: "Collaborative workspace with live cursors, threaded comments and Markdown autosave — Google-Docs-style interactions over WebSockets.",
    stack: ["React", "WebSockets", "Supabase", "TypeScript"],
  },
];

export const skills: SkillGroup[] = [
  {
    title: "Frontend",
    n: "01",
    items: [
      "React · TypeScript",
      "Next.js (App Router)",
      "Vue.js · Astro",
      "Tailwind · SCSS",
      "shadcn/ui · Radix",
      "Zustand · TanStack Query",
    ],
  },
  {
    title: "AI Engineering",
    n: "02",
    items: [
      "Python · FastAPI",
      "OpenAI · Gemini Vision",
      "LangChain · LangGraph",
      "LangSmith tracing",
      "RAG pipelines · eval",
      "Pinecone · Weaviate · FAISS",
    ],
  },
  {
    title: "Platform",
    n: "03",
    items: [
      "AWS (Lambda · S3)",
      "Docker",
      "Jenkins · CodePipeline",
      "GitHub Actions",
      "Vercel · Railway",
      "REST · WebSockets",
    ],
  },
  {
    title: "Quality",
    n: "04",
    items: [
      "Jest · Vitest",
      "Cypress · Playwright",
      "Storybook",
      "Accessibility (a11y)",
      "Perf budgets",
      "React Security (XSS)",
    ],
  },
];
