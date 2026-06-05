"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const links = [
  { href: "#work", id: "work", label: "Work" },
  { href: "#about", id: "about", label: "About" },
  { href: "#projects", id: "projects", label: "Projects" },
  { href: "#contact", id: "contact", label: "Contact" },
];

export default function Nav() {
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = links
      .map((l) => document.getElementById(l.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      // Trigger when a section crosses the vertical middle of the viewport.
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Lock scroll, close on Escape, and close if resized to desktop.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 720) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);

    // Compensate for the scrollbar disappearing so the page doesn't jump.
    const scrollbarW =
      window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow    = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow     = "hidden";
    document.body.style.paddingRight = `${scrollbarW}px`;

    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      document.body.style.overflow     = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [open]);

  // Focus management for the modal menu: move focus into the dialog on open,
  // trap Tab within it, and restore focus to the toggle when it closes — so
  // keyboard and screen-reader users can't drift to content behind the overlay.
  useEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    if (!menu) return;

    const focusables = () =>
      Array.from(
        menu.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      );

    // Move focus to the first link once the overlay is mounted.
    focusables()[0]?.focus();

    const onTrap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    menu.addEventListener("keydown", onTrap);

    return () => {
      menu.removeEventListener("keydown", onTrap);
      toggleRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <header className="nav">
        <a className="brand" href="#top">
          AA<b>.</b>
        </a>

        <nav className="nav-links" aria-label="Primary">
          {links.map((l) => {
            const isActive = active === l.id;
            return (
              <a
                key={l.id}
                href={l.href}
                className={isActive ? "is-active" : undefined}
                aria-current={isActive ? "true" : undefined}
              >
                {l.label}
                {isActive && (
                  <motion.span
                    className="nav-ind"
                    layoutId="nav-ind"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    aria-hidden="true"
                  />
                )}
              </a>
            );
          })}
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className="nav-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className={open ? "is-open" : undefined} />
          <span className={open ? "is-open" : undefined} />
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            className="nav-mobile"
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.nav
              aria-label="Mobile"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                visible: {
                  transition: { staggerChildren: 0.07, delayChildren: 0.1 },
                },
                hidden: {},
              }}
            >
              {links.map((l, i) => {
                const isActive = active === l.id;
                return (
                  <motion.a
                    key={l.id}
                    href={l.href}
                    className={isActive ? "is-active" : undefined}
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => setOpen(false)}
                    variants={{
                      hidden: { opacity: 0, y: 28 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className="mi-num" aria-hidden="true">
                      0{i + 1}
                    </span>
                    {l.label}
                  </motion.a>
                );
              })}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
