import type { Variants } from "framer-motion";

// Shared editorial easing — matches the original Reveal curve.
export const EASE = [0.22, 1, 0.36, 1] as const;

// Parent container: orchestrates a staggered cascade of its children.
export const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.04 },
  },
};

// Child item: fade + rise. Inherits the parent's "hidden"/"visible" state.
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE },
  },
};

// Viewport trigger shared across scroll-reveal groups.
export const viewportOnce = { once: true, margin: "0px 0px -8% 0px" } as const;
