"use client";

/**
 * Hero 3D scene — "Orbital Lattice"
 *
 * Layers (back to front):
 *  1. Outer particle cloud    — sparse, slowly drifts
 *  2. Three orbital ring lines — different tilts, colours, rotation speeds
 *  3. Inner glow sphere       — very transparent lime core
 *  4. Morphing wireframe orb  — icosahedron with two-octave noise displacement
 *
 * Performance / mobile hardening:
 *  - frameloop="demand" on the Canvas (set in Hero.tsx)
 *  - state.invalidate() is called every frame while the hero is visible
 *  - Once the canvas fades to opacity 0 (user scrolled past the hero) the
 *    RAF loop is NOT re-scheduled → zero GPU work for all content sections
 *  - A passive scroll listener wakes the loop back up when the user returns
 *  - Vertex shader uses highp float — prevents permutation overflow on Mali /
 *    Adreno GPUs whose mediump range (~±1024) isn't wide enough for simplex
 *  - Mobile gets a single-octave noise shader (half the GPU math)
 *  - Icosahedron detail 20 → 8 on mobile (8820 → 1620 triangles)
 */

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/* ── Simplex noise ──────────────────────────────────────────────────────── */
/*
 * All noise helpers declared with highp so they run correctly on mobile GPUs
 * whose mediump float range (~±1024) is too narrow for the permute() products.
 * highp in vertex shaders is mandated by the WebGL spec — always available.
 */
const NOISE = /* glsl */ `
  highp vec3 mod289v3(highp vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  highp vec4 mod289v4(highp vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
  highp vec4 permute(highp vec4 x){return mod289v4(((x*34.0)+1.0)*x);}
  highp vec4 taylorInvSqrt(highp vec4 r){return 1.79284291400159-0.85373472095314*r;}
  highp float snoise(highp vec3 v){
    const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
    highp vec3 i=floor(v+dot(v,C.yyy));highp vec3 x0=v-i+dot(i,C.xxx);
    highp vec3 g=step(x0.yzx,x0.xyz);highp vec3 l=1.0-g;
    highp vec3 i1=min(g.xyz,l.zxy);highp vec3 i2=max(g.xyz,l.zxy);
    highp vec3 x1=x0-i1+C.xxx;highp vec3 x2=x0-i2+C.yyy;highp vec3 x3=x0-D.yyy;
    i=mod289v3(i);
    highp vec4 p=permute(permute(permute(
      i.z+vec4(0.0,i1.z,i2.z,1.0))
      +i.y+vec4(0.0,i1.y,i2.y,1.0))
      +i.x+vec4(0.0,i1.x,i2.x,1.0));
    highp float n_=0.142857142857;highp vec3 ns=n_*D.wyz-D.xzx;
    highp vec4 j=p-49.0*floor(p*ns.z*ns.z);
    highp vec4 x_=floor(j*ns.z);highp vec4 y_=floor(j-7.0*x_);
    highp vec4 x=x_*ns.x+ns.yyyy;highp vec4 y=y_*ns.x+ns.yyyy;
    highp vec4 h=1.0-abs(x)-abs(y);
    highp vec4 b0=vec4(x.xy,y.xy);highp vec4 b1=vec4(x.zw,y.zw);
    highp vec4 s0=floor(b0)*2.0+1.0;highp vec4 s1=floor(b1)*2.0+1.0;
    highp vec4 sh=-step(h,vec4(0.0));
    highp vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;highp vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    highp vec3 p0=vec3(a0.xy,h.x);highp vec3 p1=vec3(a0.zw,h.y);
    highp vec3 p2=vec3(a1.xy,h.z);highp vec3 p3=vec3(a1.zw,h.w);
    highp vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
    highp vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
    m=m*m;
    return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }`;

/* ── Wireframe orb shaders ──────────────────────────────────────────────── */

/**
 * Full desktop shader — two noise octaves for richer morphing.
 * precision highp float is the top-level default; the noise helpers above
 * are also individually annotated highp so the compiler can't demote them.
 */
const orbVertFull = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uHover;
  ${NOISE}
  varying float vD;
  void main(){
    highp vec3 dir = normalize(position);
    highp float n1 = snoise(dir * 1.7 + uTime * 0.22);
    highp float n2 = snoise(dir * 3.4 + uTime * 0.13 + vec3(4.1, 2.3, 7.9));
    highp float n  = n1 * 0.65 + n2 * 0.35;
    float amp = 0.50 + uHover * 0.55;
    vec3 p = position + normal * n * amp;
    vD = n;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }`;

/**
 * Mobile shader — single noise octave (half the ALU cost).
 * Still uses highp to avoid precision faults on budget GPUs.
 */
const orbVertMobile = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uHover;
  ${NOISE}
  varying float vD;
  void main(){
    highp vec3 dir = normalize(position);
    highp float n  = snoise(dir * 1.7 + uTime * 0.22);
    float amp = 0.50 + uHover * 0.55;
    vec3 p = position + normal * n * amp;
    vD = n;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }`;

/* Fragment shader — simple colour math, mediump is fine here. */
const orbFrag = /* glsl */ `
  precision mediump float;
  varying float vD;
  void main(){
    float t = vD * 0.5 + 0.5;                             // remap –1..1 → 0..1
    vec3 lime = vec3(0.831, 1.000, 0.247);                 // #d4ff3f
    vec3 bone = vec3(0.710, 0.700, 0.660);
    vec3 cold = vec3(0.500, 0.580, 1.000);
    vec3 col  = mix(cold * 0.55, lime, smoothstep(0.28, 0.85, t));
    col = mix(col, bone * 0.75, smoothstep(0.0, 0.32, 1.0-t) * 0.45);
    float alpha = 0.38 + t * 0.48;
    gl_FragColor = vec4(col, alpha);
  }`;

/* ── Helpers ────────────────────────────────────────────────────────────── */
/** Generate N points forming a circle of radius r in the XZ plane. */
function ring(n: number, r: number): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const θ = (i / n) * Math.PI * 2;
    a[i * 3]     = Math.cos(θ) * r;
    a[i * 3 + 1] = 0;
    a[i * 3 + 2] = Math.sin(θ) * r;
  }
  return a;
}

const FADE_AT = 1 / 1.15; // scrollN at which opacity reaches 0 (≈ 0.87)

/* ── Component ──────────────────────────────────────────────────────────── */
export default function Scene({
  mobile,
  reduced,
}: {
  mobile: boolean;
  reduced: boolean;
}) {
  const group   = useRef<THREE.Group>(null);
  const mat     = useRef<THREE.ShaderMaterial>(null);
  const ring1   = useRef<THREE.Object3D>(null);
  const ring2   = useRef<THREE.Object3D>(null);
  const ring3   = useRef<THREE.Object3D>(null);
  const cloud   = useRef<THREE.Points>(null);
  const scroll  = useRef(0);
  const lastOp  = useRef(-1);
  const smooth  = useRef({ x: 0, y: 0, hover: 0 });
  const wakeup  = useRef<(() => void) | null>(null);

  /* kick the demand-loop on mount */
  const { invalidate } = useThree();
  const camera = useThree((s) => s.camera);
  const size   = useThree((s) => s.size);
  useEffect(() => { invalidate(); }, [invalidate]);

  /*
   * Adaptive vertical FOV.
   *
   * Three.js holds the *vertical* FOV constant and derives the horizontal FOV
   * from it × aspect ratio. On portrait / narrow viewports (phones) the
   * horizontal FOV collapses, so the orbital lattice is cropped at the sides
   * and reads as "zoomed in" — and worse on taller, narrower Android screens.
   *
   * Widening the vertical FOV as the screen narrows keeps the horizontal
   * framing roughly aspect-independent, so the orb's full width stays visible
   * on any device. Landscape / desktop (aspect ≥ 1) keeps the design 45°.
   */
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    if (!cam.isPerspectiveCamera || size.height === 0) return;
    const BASE_FOV = 45;
    const aspect = size.width / size.height;
    if (aspect < 1) {
      const baseTan = Math.tan((BASE_FOV / 2) * (Math.PI / 180));
      cam.fov = 2 * Math.atan(baseTan / aspect) * (180 / Math.PI);
    } else {
      cam.fov = BASE_FOV;
    }
    cam.updateProjectionMatrix();
    invalidate();
  }, [camera, size.width, size.height, invalidate]);

  /* passive scroll listener — updates ref and wakes loop when user returns */
  useEffect(() => {
    const onScroll = () => {
      const prev = scroll.current;
      scroll.current = window.scrollY / window.innerHeight;
      if (prev >= FADE_AT && scroll.current < FADE_AT) {
        wakeup.current?.();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* uniforms — stable reference, mutated in useFrame */
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uHover: { value: 0 } }),
    []
  );

  /* Pick the right vertex shader once on mount — mobile gets the lighter one */
  const vertexShader = mobile ? orbVertMobile : orbVertFull;

  /* geometry data */
  const cloudPositions = useMemo(() => {
    const count = mobile ? 150 : 500;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r  = 3.2 + Math.random() * 2.2;
      const θ  = Math.random() * Math.PI * 2;
      const φ  = Math.acos(2 * Math.random() - 1);
      arr[i * 3]     = r * Math.sin(φ) * Math.cos(θ);
      arr[i * 3 + 1] = r * Math.sin(φ) * Math.sin(θ);
      arr[i * 3 + 2] = r * Math.cos(φ);
    }
    return arr;
  }, [mobile]);

  /*
   * Icosahedron detail:
   *   desktop  detail=20 → 20×(21²)=8820 triangles  — rich, smooth morphing
   *   mobile   detail=8  → 20×(9²) =1620 triangles  — still looks great,
   *                                                     4× cheaper on GPU
   */
  const orbDetail = mobile ? 8 : 20;

  const ringSeg = mobile ? 64 : 160;
  const r1 = useMemo(() => ring(ringSeg, 3.1), [ringSeg]);
  const r2 = useMemo(() => ring(ringSeg, 2.7), [ringSeg]);
  const r3 = useMemo(() => ring(ringSeg, 3.6), [ringSeg]);

  /* main loop */
  useFrame((state) => {
    wakeup.current = state.invalidate;

    const scrollN = scroll.current;
    const op  = Math.max(0, 1 - scrollN * 1.15);
    const opR = Math.round(op * 1000) / 1000;

    /* sync canvas opacity with scroll */
    if (opR !== lastOp.current) {
      state.gl.domElement.style.opacity = opR.toFixed(3);
      lastOp.current = opR;
    }

    /* nothing visible — pause the loop, save the GPU for content sections */
    if (op <= 0) return;

    const t = reduced ? 0 : state.clock.elapsedTime;
    const s = smooth.current;

    /* smooth mouse / touch */
    const mx = state.pointer.x * 0.36;
    const my = -state.pointer.y * 0.22;
    s.x += (mx - s.x) * 0.05;
    s.y += (my - s.y) * 0.05;
    const hov = Math.hypot(state.pointer.x, state.pointer.y) > 0.05 ? 1 : 0;
    s.hover += (hov - s.hover) * 0.04;

    /* orb uniforms */
    if (mat.current) {
      mat.current.uniforms.uTime.value  = t;
      mat.current.uniforms.uHover.value = s.hover;
    }

    /* group — mouse tilt + scroll shrink/parallax */
    if (group.current) {
      group.current.rotation.y += (s.x - group.current.rotation.y) * 0.04
                                 + (reduced ? 0 : 0.0014);
      group.current.rotation.x += (s.y - group.current.rotation.x) * 0.04;
      group.current.scale.setScalar(1 - Math.min(scrollN, 1) * 0.4);
      group.current.position.y = scrollN * 0.9;
    }

    if (!reduced) {
      /* rings rotate at different speeds / axes for complex depth */
      if (ring1.current) ring1.current.rotation.y  +=  0.0030;
      if (ring2.current) {
        ring2.current.rotation.y -= 0.0022;
        ring2.current.rotation.x += 0.0008;
      }
      if (ring3.current) ring3.current.rotation.z  +=  0.0018;
      /* cloud counter-rotates very slowly */
      if (cloud.current) cloud.current.rotation.y  -= 0.0006;
    }

    state.invalidate(); // keep the demand-loop alive while visible
  });

  return (
    <group ref={group}>

      {/* ── Outer particle cloud ────────────────────────────────────── */}
      <points ref={cloud}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[cloudPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.022}
          color="#f4f1ea"
          transparent
          opacity={0.40}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* ── Orbital ring 1 — equatorial, lime ───────────────────────── */}
      <lineLoop ref={ring1} rotation={[0.25, 0, 0.12]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[r1, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#d4ff3f" transparent opacity={0.38} />
      </lineLoop>

      {/* ── Orbital ring 2 — tilted 62°, warm bone ──────────────────── */}
      <lineLoop ref={ring2} rotation={[Math.PI * 0.34, 0.28, 0.06]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[r2, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#f4f1ea" transparent opacity={0.22} />
      </lineLoop>

      {/* ── Orbital ring 3 — near-polar, cold blue ──────────────────── */}
      <lineLoop ref={ring3} rotation={[Math.PI * 0.78, 0.55, 0.18]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[r3, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#aeb6ff" transparent opacity={0.18} />
      </lineLoop>

      {/* ── Inner glow — lime haze filling the orb ──────────────────── */}
      <mesh>
        <sphereGeometry args={[1.25, 16, 16]} />
        <meshBasicMaterial
          color="#d4ff3f"
          transparent
          opacity={0.045}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* ── Morphing wireframe orb (hero centrepiece) ───────────────── */}
      <mesh>
        <icosahedronGeometry args={[1.8, orbDetail]} />
        <shaderMaterial
          ref={mat}
          wireframe
          transparent
          depthWrite={false}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={orbFrag}
        />
      </mesh>

    </group>
  );
}
