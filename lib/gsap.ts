/**
 * Central GSAP setup — import { gsap, ScrollTrigger } from "@/lib/gsap"
 * everywhere instead of pulling directly from the packages.
 *
 * This ensures the plugin is registered exactly once and global config
 * is applied before any component creates a ScrollTrigger.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.config({
  // Throttle scroll callbacks to the display's refresh rate — prevents
  // multiple callbacks firing for a single scroll event on fast input devices.
  limitCallbacks: true,

  // Don't trigger a full refresh when only the virtual keyboard on mobile
  // appears (which changes window.innerHeight).
  ignoreMobileResize: true,
});

export { gsap, ScrollTrigger };
