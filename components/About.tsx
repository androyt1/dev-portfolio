"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { stats } from "@/lib/data";
import ScrollRevealText from "./ScrollRevealText";
import { EASE, viewportOnce } from "@/lib/motion";

// Shared fade-up for standalone columns (no RevealGroup parent needed).
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 22 },
  whileInView:{ opacity: 1, y: 0  },
  viewport:   viewportOnce,
  transition: { duration: 0.75, ease: EASE, delay },
});

export default function About() {
  return (
    <section className="block wrap" id="about" aria-label="About">
      <div className="block-head">
        <span className="eyebrow">01 — Profile</span>
        <span className="idx">/ about</span>
      </div>

      {/*
       * Plain CSS-grid div — NO Framer Motion wrapper here.
       * ScrollRevealText drives its own GSAP entrance; wrapping it in a
       * Framer Motion container causes both systems to animate the same
       * opacity layer simultaneously, which seized the scroll.
       */}
      <div className="about-grid">

        {/* Column 1 — char-by-char GSAP scrub (self-contained entrance) */}
        <ScrollRevealText
          className="about-lede"
          segments={[
            { text: "Senior engineer with " },
            { text: "7+ years", em: true },
            {
              text: " shipping production web products across React/TypeScript frontend engineering and Python-based ",
            },
            { text: "AI systems", em: true },
            { text: "." },
          ]}
        />

        {/* Column 2 — body + stats, standalone fade-up */}
        <motion.div className="about-body" {...fadeUp(0.08)}>
          <p>
            I translate model output into clear interfaces — with loading
            states, citations and honest error handling — and back them with
            traced, evaluated RAG pipelines.
          </p>
          <p>
            From design-system work at HSBC to agentic workflows in LangGraph,
            I care about the seam where craft and intelligence meet.
          </p>
          <div className="stats">
            {stats.map((s) => (
              <div className="stat" key={s.label}>
                <div className="n">
                  {s.pre}
                  <em>{s.em}</em>
                  {s.post}
                </div>
                <div className="l">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Column 3 — portrait, standalone fade-up with slight extra delay */}
        <motion.div className="about-portrait-wrap" {...fadeUp(0.18)}>
          <div className="about-portrait">
            <Image
              src="/portrait.png"
              alt="Andrew Aghoghovwia"
              width={377}
              height={481}
              sizes="(min-width:1100px) 22rem, 0px"
              priority={false}
              className="about-portrait-img"
            />
            <span className="about-portrait-accent" aria-hidden="true" />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
