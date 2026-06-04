"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { projects } from "@/lib/data";
import ScrollRevealText from "./ScrollRevealText";

function ArrowIcon() {
  return (
    <span className="pcard-arrow" aria-hidden="true">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M7 17 17 7M7 7h10v10" />
      </svg>
    </span>
  );
}

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const mm = gsap.matchMedia();

    // Desktop only, and only when motion is allowed: pin the section and
    // translate the track horizontally as the user scrolls vertically.
    mm.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        const distance = () => track.scrollWidth - track.clientWidth;

        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => "+=" + distance(),
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      className="projects-h"
      id="projects"
      ref={sectionRef}
      aria-label="Featured projects"
    >
      <div className="wrap block-head">
        <ScrollRevealText
          as="h2"
          segments={[{ text: "Featured " }, { text: "projects", em: true }]}
        />
        <span className="idx">03 — / build log</span>
      </div>

      <div className="ph-viewport">
        <div className="ph-track" ref={trackRef}>
          {projects.map((p) => (
            <motion.article
              className="pcard"
              tabIndex={0}
              key={p.em}
              whileHover={{
                y: -6,
                scale: 1.012,
                transition: { type: "spring", stiffness: 300, damping: 22 },
              }}
              whileTap={{ scale: 0.992 }}
            >
              <div className="pcard-top">
                <span className="pcard-yr">{p.year}</span>
                <ArrowIcon />
              </div>
              <div>
                <h3>
                  {p.title} <em>{p.em}</em>
                </h3>
                <p>{p.desc}</p>
                <div className="pcard-stack">
                  {p.stack.map((s) => (
                    <span className="tag" key={s}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
