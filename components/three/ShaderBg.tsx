"use client";

/**
 * Fullscreen domain-warping GLSL fragment shader background.
 * Technique: IQ-style fractional Brownian motion with two levels of
 * domain warping (q → r → f).  Adapted to the portfolio's dark palette:
 * #0b0b0d base, electric-lime (#d4ff3f) accent wisps, cold-blue undertones.
 *
 * The vertex shader bypasses the camera MVP by writing position.xy directly
 * into clip space, so a PlaneGeometry(2,2) fills exactly the whole screen.
 */

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/*  GLSL                                                                */
/* ------------------------------------------------------------------ */

const vert = /* glsl */ `
varying vec2 vUv;
void main() {
  // Map -1..1 object coords directly to clip space → fullscreen quad.
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

const frag = /* glsl */ `
/*
 * Optimised fragment shader — single-level domain warp, 3 FBM octaves.
 *
 * GPU cost: 3 fbm calls × 3 octaves × 4 hash lookups = 36 hash evals/px
 * vs the old version: 5 calls × 5 octaves × 4 = 100 evals/px  (-64%)
 *
 * mediump is sufficient for a fullscreen background and is significantly
 * faster on mobile GPUs than highp.
 */
precision mediump float;
uniform float uTime;
varying vec2 vUv;

/* ---- value noise ---- */
float hash(vec2 p) {
  p = fract(p * vec2(0.31830988, 0.36787944));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i),             hash(i + vec2(1,0)), u.x),
    mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x),
    u.y
  );
}

/* Rotation constant — computed once at compile time, not per-iteration */
const mat2 ROT = mat2(1.7, 1.3, -1.3, 1.7);

/* 3 octaves only — visually indistinguishable from 5 at this scale */
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * vnoise(p);
    p  = ROT * p;
    a *= 0.5;
  }
  return v;
}

void main() {
  float t = uTime * 0.06;

  /* single domain-warp layer (was two — halves the fbm call count) */
  vec2 q = vec2(
    fbm(vUv * 2.0 + t),
    fbm(vUv * 2.0 + vec2(4.1, 7.3) + t * 0.8)
  );
  float f = fbm(vUv * 1.8 + 3.5 * q + t * 0.15);

  /* portfolio palette */
  vec3 bg   = vec3(0.043, 0.043, 0.051);   // #0b0b0d
  vec3 lime = vec3(0.831, 1.0,   0.247);   // #d4ff3f
  vec3 cold = vec3(0.682, 0.714, 1.0  );   // #aeb6ff

  float g   = smoothstep(0.28, 0.82, f);

  vec3 col  = bg;
  col += lime * g             * 0.55;
  col += cold * (1.0-g) * g   * 0.15;
  col += lime * smoothstep(0.75, 1.0, f) * 0.25;

  vec2  cen = vUv - 0.5;
  col *= 1.0 - smoothstep(0.2, 0.9, dot(cen, cen) * 2.2);
  col  = max(col, bg * 0.92);

  gl_FragColor = vec4(col, 1.0);
}`;

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function ShaderBg({
  reduced,
}: {
  reduced: boolean;
}) {
  const mat    = useRef<THREE.ShaderMaterial>(null);
  // Cache scroll progress via a passive listener so we never read
  // window.scrollY inside useFrame (that forces a layout reflow at 60 fps).
  const scroll = useRef(0);
  // Track the last written opacity so we skip redundant style writes.
  const lastOp = useRef(-1);

  // invalidateFn is set by the useFrame callback so the scroll listener
  // can wake the demand-loop when the user scrolls back up into the hero.
  const invalidateFn = useRef<(() => void) | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const prev = scroll.current;
      scroll.current = window.scrollY / window.innerHeight;
      // If we were hidden and the user scrolls back toward the hero,
      // kick the demand-loop back awake.
      if (prev >= 1 && scroll.current < 1) {
        invalidateFn.current?.();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime:   { value: 0 },
      uScroll: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    // Expose invalidate so the scroll listener can wake us from outside.
    invalidateFn.current = state.invalidate;

    if (!mat.current) return;

    const scrollN = scroll.current;
    const op      = Math.max(0, 1 - scrollN * 1.15);
    const opR     = Math.round(op * 1000) / 1000;

    // Keep canvas opacity in sync with scroll.
    if (opR !== lastOp.current) {
      state.gl.domElement.style.opacity = opR.toFixed(3);
      lastOp.current = opR;
    }

    if (op <= 0) {
      // Shader is completely hidden under the content sections.
      // Do NOT call state.invalidate() — the demand-loop pauses here,
      // dropping GPU load to zero for the entire rest of the page.
      return;
    }

    // Shader is visible — update uniforms and request the next frame.
    mat.current.uniforms.uTime.value   = reduced ? 0 : state.clock.elapsedTime;
    mat.current.uniforms.uScroll.value = scrollN;
    state.invalidate(); // asks R3F for one more frame
  });

  return (
    // renderOrder=-1 so it draws behind any other mesh in the scene;
    // depthTest/Write off so it never blocks anything on top of it.
    <mesh renderOrder={-1} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={vert}
        fragmentShader={frag}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
