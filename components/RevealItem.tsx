"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { itemVariants } from "@/lib/motion";

export default function RevealItem({
  children,
  className,
  tabIndex,
}: {
  children: ReactNode;
  className?: string;
  tabIndex?: number;
}) {
  return (
    <motion.div className={className} tabIndex={tabIndex} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
