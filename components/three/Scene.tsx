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
 * Performance:
 *  - frameloop="demand" on the Canvas (set in Hero.tsx)
 *  - state.invalidate() is called every frame while the hero is visible
 *  - Once the canvas fades to opacity 0 (user scrolled past the hero) the
 *    RAF loop is NOT re-scheduled → zero GPU work for all content sections
 *  - A passive scroll listener wakes the loop back up when the user returns
 */

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/* ── Simplex noise ──────────────────────────────────────────────────────── */
const NOISE = /* glsl */ `
  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
    vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
    i=mod289(i);
    vec4 p=permute(permute(permute(
      i.z+vec4(0.0,i1.z,i2.z,1.0))
      +i.y+vec4(0.0,i1.y,i2.y,1.0))
      +i.x+vec4(0.0,i1.x,i2.x,1.0));
    float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.0*floor(p*ns.z*ns.z);
    vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
    vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
    vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
    return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }`;

/* ── Wireframe orb shaders ──────────────────────────────────────────────── */
const orbVert = /* glsl */ `
  precision mediump float;
  uniform float uTime;
  uniform float uHover;
  ${NOISE}
  varying float vD;
  void main(){
    vec3 dir = normalize(position);
    // Two octaves of noise for organic, complex morphing
    float n1 = snoise(dir * 1.7 + uTime * 0.22);
    float n2 = snoise(dir * 3.4 + uTime * 0.13 + vec3(4.1, 2.3, 7.9));
    float n  = n1 * 0.65 + n2 * 0.35;
    float amp = 0.50 + uHover * 0.55;
    vec3 p = position + normal * n * amp;
    vD = n;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }`;

const orbFrag = /* glsl */ `
  precision mediump float;
  varying float vD;
  void main(){
    float t = vD * 0.5 + 0.5;                             // remap –1..1 → 0..1
    vec3 lime = vec3(0.831, 1.000, 0.247);                 // #d4ff3f
    vec3 bone = vec3(0.710, 0.700, 0.660);
    vec3 cold = vec3(0.500, 0.580, 1.000);
    // Cool→lime gradient across noise range
    vec3 col = mix(cold * 0.55, lime, smoothstep(0.28, 0.85, t));
    col = mix(col, bone * 0.75, smoothstep(0.0, 0.32, 1.0-t) * 0.45);
    // Brighter lines on high-displacement faces
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
  useEffect(() => { invalidate(); }, [invalidate]);

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

  /* uniforms */
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uHover: { value: 0 } }),
    []
  );

  /* geometry data */
  const cloudPositions = useMemo(() => {
    const count = mobile ? 200 : 500;
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

  const ringSeg = mobile ? 96 : 160;
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

    /* smooth mouse */
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
        <icosahedronGeometry args={[1.8, 20]} />
        <shaderMaterial
          ref={mat}
          wireframe
          transparent
          depthWrite={false}
          uniforms={uniforms}
          vertexShader={orbVert}
          fragmentShader={orbFrag}
        />
      </mesh>

    </group>
  );
}
