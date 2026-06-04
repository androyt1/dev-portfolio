"use client";

/**
 * Custom cursor — ring + dot.
 *
 * Performance notes:
 * - Ring uses gsap.quickTo() (recommended for frequently-updated values).
 *   This reuses a single live tween instead of re-creating one every frame,
 *   and lets GSAP batch the DOM write with its internal RAF scheduler.
 * - Dot uses gsap.set() for immediate, zero-lag movement.
 * - Magnet rects are cached on pointerenter (one getBoundingClientRect per
 *   hover, not one per pointermove).
 * - All event listeners are passive where possible.
 */

import { useEffect } from "react";
import { gsap } from "@/lib/gsap";

export default function Cursor() {
  useEffect(() => {
    if (!window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;

    const ring = document.querySelector<HTMLElement>(".cursor");
    const dot  = document.querySelector<HTMLElement>(".cursor-dot");
    if (!ring || !dot) return;

    // quickTo reuses a single tween — ideal for mouse-follower x/y.
    const xTo = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
    const yTo = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      // Dot: instant follow (no lag).
      gsap.set(dot, { x: e.clientX, y: e.clientY });
      // Ring: smooth lag via quickTo.
      xTo(e.clientX);
      yTo(e.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // Hover state
    const enter = () => ring.classList.add("is-active");
    const leave = () => ring.classList.remove("is-active");
    const interactive = Array.from(
      document.querySelectorAll<HTMLElement>(
        "a, button, .pcard, [data-magnetic], .up"
      )
    );
    interactive.forEach((el) => {
      el.addEventListener("pointerenter", enter, { passive: true });
      el.addEventListener("pointerleave", leave, { passive: true });
    });

    // Magnetic buttons — cache rect on enter, use it during move.
    type MagEntry = {
      el: HTMLElement;
      onEnter: () => void;
      onMove: (e: PointerEvent) => void;
      onLeave: () => void;
    };
    const magEntries: MagEntry[] = [];

    document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
      let rect = el.getBoundingClientRect();

      const onEnter = () => { rect = el.getBoundingClientRect(); };
      const onMove  = (e: PointerEvent) => {
        gsap.to(el, {
          x: (e.clientX - rect.left - rect.width  / 2) * 0.3,
          y: (e.clientY - rect.top  - rect.height / 2) * 0.4,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
      };
      const onLeave = () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.4)", overwrite: "auto" });
      };

      el.addEventListener("pointerenter", onEnter, { passive: true });
      el.addEventListener("pointermove",  onMove,  { passive: true });
      el.addEventListener("pointerleave", onLeave, { passive: true });
      magEntries.push({ el, onEnter, onMove, onLeave });
    });

    return () => {
      window.removeEventListener("pointermove", onMove);
      interactive.forEach((el) => {
        el.removeEventListener("pointerenter", enter);
        el.removeEventListener("pointerleave", leave);
      });
      magEntries.forEach(({ el, onEnter, onMove, onLeave }) => {
        el.removeEventListener("pointerenter", onEnter);
        el.removeEventListener("pointermove",  onMove);
        el.removeEventListener("pointerleave", onLeave);
      });
    };
  }, []);

  return (
    <>
      <div className="cursor"     aria-hidden="true" />
      <div className="cursor-dot" aria-hidden="true" />
    </>
  );
}
