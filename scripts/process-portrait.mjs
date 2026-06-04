/**
 * Portrait optimisation script.
 * Run once:  node scripts/process-portrait.mjs
 *
 * Operations
 * ----------
 * 1. Auto-orient (strip EXIF rotation so browsers agree)
 * 2. Straighten the slight upward/Dutch tilt (~4°)
 * 3. Crop tight to face + upper body in a 3:4 portrait ratio
 * 4. Resize to 620 px wide (Next/image handles retina via srcSet)
 * 5. Export WebP @ q 82 → public/portrait.webp
 */

import sharp from "sharp";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const src  = path.join(root, "public", "portait.png"); // original (misspelled)
const dest = path.join(root, "public", "portrait.webp");

const W = 620;
const H = Math.round(W * (4 / 3)); // 826 px — 3:4 portrait ratio

await sharp(src)
  // 1. Auto-orient from EXIF
  .rotate()
  // 2. Straighten the tilt: counter-rotate ~3° to level the frame.
  //    Background fill matches the studio-glass tone behind the subject.
  .rotate(-3, { background: { r: 210, g: 205, b: 195, alpha: 1 } })
  // 3. Resize to a slightly larger intermediate so we have room to crop.
  .resize({ width: Math.round(W * 1.18), height: Math.round(H * 1.18), fit: "cover", position: "top" })
  // 4. Centre-crop to the final 3:4 canvas, shifted upward to favour the face.
  .extract({
    left:   Math.round((Math.round(W * 1.18) - W) / 2),
    top:    0,
    width:  W,
    height: H,
  })
  // 5. Sharpen slightly to recover edges lost in resize
  .sharpen({ sigma: 0.6 })
  // 6. WebP output
  .webp({ quality: 82, effort: 5 })
  .toFile(dest);

console.log(`✓ portrait.webp written → ${dest}  (${W}×${H})`);
