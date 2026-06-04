"use client";

import { Fragment, createElement, useEffect, useRef, type ElementType } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export type Segment =
  | { text: string; em?: boolean }
  | { br: true };

/**
 * Renders text whose letters scrub from faint to full opacity, letter by
 * letter, as the element is scrolled through the viewport. Text is split into
 * word/char spans so normal word-wrapping is preserved. Use `as` to pick the
 * element tag (e.g. "h2") and `href` to wrap the content in a link.
 */
export default function ScrollRevealText({
  segments,
  className,
  as: Tag = "p",
  href,
}: {
  segments: Segment[];
  className?: string;
  as?: ElementType;
  href?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const chars = gsap.utils.toArray<HTMLElement>("[data-char]", el);
    if (chars.length === 0) return;

    // Respect reduced-motion: show fully, no scroll animation.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(chars, { opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        chars,
        { opacity: 0.12 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.5,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            end: "bottom 60%",
            // scrub:true = perfectly in sync with scroll position, no RAF
            // catch-up loop running after the user pauses (vs scrub:0.6 which
            // keeps animating for 600ms after each scroll event).
            scrub: true,
            fastScrollEnd: true,
            invalidateOnRefresh: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  const renderChars = (text: string) =>
    text.split(/(\s+)/).map((token, i) => {
      if (token === "") return null;
      if (/^\s+$/.test(token)) return <Fragment key={i}>{token}</Fragment>;
      return (
        <span className="srt-word" key={i}>
          {Array.from(token).map((ch, j) => (
            <span className="srt-char" data-char key={j}>
              {ch}
            </span>
          ))}
        </span>
      );
    });

  const content = segments.map((seg, i) => {
    if ("br" in seg) return <br key={i} />;
    return seg.em ? (
      <em key={i}>{renderChars(seg.text)}</em>
    ) : (
      <Fragment key={i}>{renderChars(seg.text)}</Fragment>
    );
  });

  return createElement(
    Tag,
    { ref, className },
    href ? <a href={href}>{content}</a> : content
  );
}
