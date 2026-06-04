"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { skills } from "@/lib/data";
import ScrollRevealText from "./ScrollRevealText";

export default function Skills() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    // Respect prefers-reduced-motion: show all cards immediately, no animation.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(grid.querySelectorAll<HTMLElement>(".skill-col"), {
        opacity: 1,
        x: 0,
      });
      return;
    }

    // gsap.context scopes all selectors to `grid` and collects every tween +
    // ScrollTrigger created inside for automatic cleanup on unmount.
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".skill-col",
        // ── from: hidden, translated 48 px to the left ──────────────────
        { opacity: 0, x: -48 },
        // ── to: fully visible, in natural position ───────────────────────
        {
          opacity: 1,
          x: 0,
          duration: 0.65,
          ease: "power3.out",
          // Each card's animation is offset by 120 ms from its left neighbour.
          stagger: 0.12,
          scrollTrigger: {
            trigger: grid,
            // Fire when the top of the grid reaches 82 % down the viewport.
            start: "top 82%",
            // once: true kills the ScrollTrigger immediately after the first
            // play, freeing memory and stopping all future scroll checks.
            once: true,
          },
        }
      );
    }, grid); // ← scope: selectors are relative to `grid`, not document

    return () => ctx.revert(); // kills tweens, ScrollTrigger, restores styles
  }, []);

  return (
    <section className="block wrap" aria-label="Capabilities">
      <div className="block-head">
        <ScrollRevealText
          as="h2"
          segments={[{ text: "The " }, { text: "toolkit", em: true }]}
        />
        <span className="idx">04 — / stack</span>
      </div>

      {/*
       * Plain div — no Framer Motion wrapper here.
       * GSAP owns the animation; keeping one system per element avoids the
       * double-composite conflict that caused seizure in the About section.
       */}
      <div ref={gridRef} className="skills">
        {skills.map((col) => (
          <div className="skill-col" key={col.title}>
            <h4>
              {col.title} <b>/ {col.n}</b>
            </h4>
            <ul>
              {col.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
