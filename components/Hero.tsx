"use client";

import { Canvas } from "@react-three/fiber";
import { motion } from "framer-motion";
import { Suspense, useEffect, useState } from "react";
import Scene from "./three/Scene";

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl") || c.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

/**
 * Detect mobile / touch devices.
 *
 * UA sniffing alone misses:
 *  - iPads on iPadOS 13+ — they send a desktop Safari UA by default
 *  - Some Chromebooks / Windows tablets in tablet mode
 *
 * navigator.maxTouchPoints > 1 catches all of these while excluding
 * desktop machines that report 0 touch points.
 */
function isMobileDevice(): boolean {
  return (
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    navigator.maxTouchPoints > 1
  );
}

export default function Hero() {
  const [ready,       setReady]       = useState(false);
  const [webgl,       setWebgl]       = useState(true);
  const [mobile,      setMobile]      = useState(false);
  const [reduced,     setReduced]     = useState(false);
  const [revealed,    setRevealed]    = useState(false);

  useEffect(() => {
    setWebgl(hasWebGL());
    setMobile(isMobileDevice());
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setReady(true);

    const onDone = () => setRevealed(true);
    window.addEventListener("preloader:done", onDone);
    const safety = window.setTimeout(onDone, 4000);
    return () => {
      window.removeEventListener("preloader:done", onDone);
      clearTimeout(safety);
    };
  }, []);

  const line = (i: number) => ({
    initial: { y: "102%" },
    animate: revealed ? { y: "0%" } : { y: "102%" },
    transition: {
      duration: 1,
      ease: [0.22, 1, 0.36, 1] as const,
      delay: 0.15 + i * 0.12,
    },
  });

  return (
    <>
      <div className="webgl-wrap" aria-hidden="true">
        {ready && webgl ? (
          <Canvas
            frameloop="demand"
            dpr={[1, mobile ? 1 : 1.5]}
            gl={{
              antialias: false,
              alpha: true,
              /*
               * premultipliedAlpha:false — some Android WebGL drivers
               * composite a transparent canvas incorrectly when this is
               * true (the default).  Setting false makes the compositing
               * match the spec on all tested devices.
               */
              premultipliedAlpha: false,
              /*
               * "high-performance" on mobile can cause the driver to
               * pick an aggressive clock that triggers thermal throttling
               * or context loss.  Use "default" on mobile so the GPU
               * governor manages the clock naturally.
               */
              powerPreference: mobile ? "default" : "high-performance",
              /*
               * Don't refuse to create a context on devices that report
               * a "major performance caveat" (software renderer, etc.).
               * We'd rather show something degraded than the CSS fallback.
               */
              failIfMajorPerformanceCaveat: false,
            }}
            camera={{ position: [0, 0, 6], fov: 45 }}
            /*
             * Context loss handler — wired up once when the canvas is
             * created.  On mobile the OS can reclaim GPU memory at any
             * time (app switch, low-memory event).
             *
             * e.preventDefault() tells the browser we want a restore
             * attempt; we still switch to the CSS fallback immediately
             * so the user sees something rather than a blank canvas.
             */
            onCreated={({ gl }) => {
              gl.domElement.addEventListener(
                "webglcontextlost",
                (e) => {
                  e.preventDefault();
                  setWebgl(false);
                },
                { once: true }
              );
            }}
          >
            <Suspense fallback={null}>
              <Scene mobile={mobile} reduced={reduced} />
            </Suspense>
          </Canvas>
        ) : (
          <div className="webgl-fallback" />
        )}
      </div>

      <section className="hero wrap" aria-label="Introduction">
        <div className="hero-top">
          <span>Senior Frontend &amp; AI Engineer</span>
          <span>Carshalton, UK — Remote</span>
          <span>Est. 2016 · 7+ Yrs</span>
        </div>

        <h1>
          <span className="li">
            <motion.span {...line(0)}>Frontend</motion.span>
          </span>
          <span className="li">
            <motion.span {...line(1)}>
              <em>engineering</em>
            </motion.span>
          </span>
          <span className="li">
            <motion.span {...line(2)}>
              meets <span className="tint">AI</span>.
            </motion.span>
          </span>
        </h1>

        <div className="hero-foot">
          <p className="hero-lede">
            I build polished interfaces, FastAPI services, <b>RAG workflows</b>{" "}
            and LLM-powered product experiences that are fast, accessible, and
            ready to ship.
          </p>
          <a className="cta" href="#contact" data-magnetic>
            <span className="dot" /> Start a project
          </a>
          <div className="scrollcue">
            Scroll <i />
          </div>
        </div>
      </section>
    </>
  );
}
