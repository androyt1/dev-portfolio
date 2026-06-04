"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { containerVariants, viewportOnce } from "@/lib/motion";

export default function RevealGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
    >
      {children}
    </motion.div>
  );
}
