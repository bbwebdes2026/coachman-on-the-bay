#!/usr/bin/env node
/**
 * The Coachman — image pipeline (build-order step 2).
 *
 * Runs rarely and locally (never on Vercel). Turns the raw photography in
 * /assets-raw into a single-shoot, web-ready library in /public/images:
 *
 *   1. Upscale   — Real-ESRGAN (realesrgan-ncnn-vulkan) for anything under
 *                  1600px on its long edge. Downloads the binary into
 *                  scripts/bin (gitignored) on first run. Falls back to a
 *                  high-quality Lanczos upscale if the binary is unavailable
 *                  or Vulkan is missing (CPU fallback is acceptable).
 *   2. Grade     — one shared Sharp grade across ALL photography so the set
 *                  reads as one shoot: gentle S-curve contrast, navy-tinted
 *                  shadows, +warmth in the highlights, and a mild saturation
 *                  lift on food shots only.
 *   3. Duotone   — navy/silver *-duo.jpg variants for the flagged weaker
 *                  interior shots (heritage strip / background art direction).
 *   4. Output    — original + AVIF + WebP, max 2400px long edge, quality ~80.
 *
 * Work is tracked by raw-file content hash in public/images/manifest.json, so
 * reruns skip anything already processed. Delete an entry (or the file) to
 * force a rebuild.
 *
 * Menu-text screenshots (coachman-*-etc / burgers / drinks / rsa-dishes /
 * luxury-collection) and are deliberately NOT processed here — they are the
 * source of truth for /data/menu.ts, not photography for the UI.
 */

import { createHash } from "node:crypto";
import {
  mkdir,
  readFile,
  writeFile,
  access,
  rm,
} from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import path from "node:path";
import os from "node:os";
import sharp from "sharp";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const ROOT = process.cwd();
const RAW_DIR = path.join(ROOT, "assets-raw");
const OUT_DIR = path.join(ROOT, "public", "images");
const BIN_DIR = path.join(ROOT, "scripts", "bin");
const CACHE_DIR = path.join(BIN_DIR, ".cache"); // upscaled intermediates
const MANIFEST_PATH = path.join(OUT_DIR, "manifest.json");

const UPSCALE_THRESHOLD = 1600; // long edge (px) below which we upscale
const MAX_LONG_EDGE = 2400; // final output ceiling
const JPEG_Q = 80;
const WEBP_Q = 80;
const AVIF_Q = 55; // AVIF ~55 is visually comparable to JPEG q80

// Bump when the upscale/grade parameters change so existing outputs rebuild
// even though the raw source hash is unchanged.
const PIPELINE_VERSION = 6;

// realesrgan-x4plus is a 4x model and MUST be run at 4x. Asking it for -s 2 or
// -s 3 does not resample the result — it corrupts the tiling, and the tiles
// come back reassembled in the wrong places (measured drift ~48 against a
// Lanczos reference, where a correct pass scores ~3.5). That bug shipped once;
// it is why upscale() always runs native and Sharp does the resizing.
const REALESRGAN_MODEL = "realesrgan-x4plus";
const REALESRGAN_SCALE = 4;

// Tile sizes to try, largest first. Per-tile VRAM scales with tilesize², so we
// fall back if a GPU can't allocate the larger ones: 640 fits the 448px crops
// (smaller than the tile, so untiled) but OOMs the RTX 3060's 6GB on the full
// frames, where 448 is the largest that fits.
const TILE_SIZES = [640, 448, 384, 320];

// First tile size that actually worked, reused for subsequent images so we
// don't re-pay the OOM probe on every file.
let workingTile = null;

/**
 * The ONLY photography we publish, keyed by OUTPUT name. Everything else in
 * /assets-raw is a menu-text screenshot (menu data for /data/menu.ts) and is
 * intentionally excluded.
 *   raw     — source file in /assets-raw (one raw file may emit several outputs)
 *   crop    — extract this region from the RAW, before upscaling
 *   food    — mild saturation lift (food shots only)
 *   duotone — also emit a navy/silver *-duo variant
 *   grade   — false to skip the photographic grade (the logo mark)
 */
const SOURCES = {
  // seating-area3.jpg is NOT a photograph — it is a four-panel contact sheet
  // (800x531 raw) with stitch seams measured at x=448 / y=448 in raw
  // coordinates. Publishing it whole would put a visible grid of four photos
  // in the hero. Crop the two usable daylight panels out of the raw instead.
  //
  // Cropping BEFORE the upscale is what buys the resolution: Real-ESRGAN takes
  // the 448px panel to 1792px, where cropping the already-upscaled collage
  // would cap the hero at 1344px.
  "terrace-bay": {
    raw: "seating-area3.jpg", // hero — tables, umbrella, the bay in daylight
    crop: { left: 0, top: 0, width: 448, height: 448 },
  },
  "terrace-umbrellas": {
    raw: "seating-area3.jpg", // terrace under the white umbrellas
    crop: { left: 448, top: 0, width: 352, height: 448 },
  },

  "Seating-area1": { raw: "Seating-area1.jpg", duotone: true }, // dining room, LED coves
  "seating-area2": { raw: "seating-area2.jpg" }, // bar + brushed-metal wall logo
  "bar-area": { raw: "bar-area.jpg", duotone: true }, // weaker candid interior
  "the-notorious-coachman-chair": { raw: "the-notorious-coachman-chair.jpg" },
  "food-image1": { raw: "food-image1.jpg", food: true },
  "food-image2": { raw: "food-image2.jpg", food: true },
  "food-image3": { raw: "food-image3.jpg", food: true },
  "food-image4": { raw: "food-image4.jpg", food: true },
  "food-image5": { raw: "food-image5.jpg", food: true },

  // coachman-logo.jpg is a marketing graphic, not a logo file: the blackletter
  // lockup composited over a stock beach photograph. Key the mark out of it —
  // see extractMark. The beach composite itself is never published.
  "coachman-mark": { raw: "coachman-logo.jpg", mark: true },
};

// ---------------------------------------------------------------------------
// Real-ESRGAN binary — download + upscale (best effort)
// ---------------------------------------------------------------------------

const REALESRGAN = {
  win32: {
    url: "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesrgan-ncnn-vulkan-20220424-windows.zip",
    exe: "realesrgan-ncnn-vulkan.exe",
  },
  darwin: {
    url: "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesrgan-ncnn-vulkan-20220424-macos.zip",
    exe: "realesrgan-ncnn-vulkan",
  },
  linux: {
    url: "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesrgan-ncnn-vulkan-20220424-ubuntu.zip",
    exe: "realesrgan-ncnn-vulkan",
  },
};

let upscalerState = null; // null = untried, {exe, gpuId} = ready, false = unavailable

/**
 * Pick the Vulkan device to run on. Real-ESRGAN defaults to device 0, which on
 * a laptop is the integrated GPU — slow, and its driver is the one that tends
 * to break. Enumerate instead and prefer a discrete NVIDIA/AMD card. Returns a
 * device index, or null to let Real-ESRGAN choose.
 *
 * ncnn prints the device table to stderr as it creates the Vulkan instance, so
 * we provoke that with a throwaway 32px job and parse it. Indices are NOT
 * stable across GPU-mode/driver changes — always probe, never hardcode.
 */
async function detectGpu(exe) {
  const override = process.env.COACHMAN_GPU;
  if (override) return Number(override);

  try {
    await mkdir(CACHE_DIR, { recursive: true });
    const probeIn = path.join(CACHE_DIR, "gpu-probe.png");
    const probeOut = path.join(CACHE_DIR, "gpu-probe.out.png");
    await sharp({
      create: { width: 32, height: 32, channels: 3, background: "#000" },
    })
      .png()
      .toFile(probeIn);
    // spawnSync, not execFileSync: ncnn prints the device table to stderr, and
    // execFileSync only returns stdout unless the process also exits non-zero.
    const probe = spawnSync(
      exe,
      ["-i", probeIn, "-o", probeOut, "-s", "2", "-t", "32",
       "-m", path.join(BIN_DIR, "models"), "-f", "png"],
      { encoding: "utf8" },
    );
    const out = `${probe.stdout || ""}${probe.stderr || ""}`;

    const devices = new Map();
    for (const m of out.matchAll(/^\[(\d+)\s+([^\]]+)\]/gm)) {
      devices.set(Number(m[1]), m[2].trim());
    }
    if (!devices.size) return null;

    for (const [id, name] of devices) {
      if (/nvidia|geforce|rtx|quadro/i.test(name)) {
        console.log(`  · GPU ${id}: ${name} (discrete)`);
        return id;
      }
    }
    console.log(`  · GPU 0: ${devices.get(0)} — no discrete GPU found.`);
    return null;
  } catch {
    return null; // probe failed; let Real-ESRGAN pick
  }
}

async function ensureRealesrgan() {
  if (upscalerState !== null) return upscalerState;

  // Escape hatch: COACHMAN_NO_GPU=1 forces the CPU (Lanczos) path and never
  // touches Vulkan / any GPU — useful while GPU drivers are being reinstalled.
  if (["1", "true"].includes((process.env.COACHMAN_NO_GPU || "").toLowerCase())) {
    console.warn("  ! COACHMAN_NO_GPU set — skipping GPU, using Lanczos (CPU).");
    upscalerState = false;
    return upscalerState;
  }

  const spec = REALESRGAN[process.platform];
  if (!spec) {
    console.warn(
      `  ! No Real-ESRGAN build for ${process.platform}; using Lanczos fallback.`,
    );
    upscalerState = false;
    return upscalerState;
  }

  const exePath = path.join(BIN_DIR, spec.exe);
  if (existsSync(exePath)) {
    upscalerState = { exe: exePath, gpuId: await detectGpu(exePath) };
    return upscalerState;
  }

  try {
    await mkdir(BIN_DIR, { recursive: true });
    const zipPath = path.join(BIN_DIR, "realesrgan.zip");
    console.log("  ↓ Downloading Real-ESRGAN (one-time)…");
    const res = await fetch(spec.url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await writeFile(zipPath, Buffer.from(await res.arrayBuffer()));

    // bsdtar (Windows/macOS) handles zip; fall back to unzip on Linux.
    try {
      execFileSync("tar", ["-xf", zipPath, "-C", BIN_DIR], { stdio: "ignore" });
    } catch {
      execFileSync("unzip", ["-o", zipPath, "-d", BIN_DIR], {
        stdio: "ignore",
      });
    }
    await rm(zipPath, { force: true });

    if (process.platform !== "win32" && existsSync(exePath)) {
      execFileSync("chmod", ["+x", exePath]);
    }
    if (!existsSync(exePath)) throw new Error("binary not found after extract");

    upscalerState = { exe: exePath, gpuId: await detectGpu(exePath) };
  } catch (err) {
    console.warn(
      `  ! Real-ESRGAN unavailable (${err.message}); using Lanczos fallback.`,
    );
    upscalerState = false;
  }
  return upscalerState;
}

/**
 * True if an image carries no real picture information — all-black output, or
 * a flat field. A failed Vulkan job still produces a well-formed PNG, so pixel
 * statistics are the only reliable proof that the upscale actually ran.
 */
async function isDegenerate(file) {
  try {
    const { channels } = await sharp(file).stats();
    const maxSeen = Math.max(...channels.map((c) => c.max));
    const maxStdev = Math.max(...channels.map((c) => c.stdev));
    return maxSeen <= 8 || maxStdev < 1;
  } catch {
    return true; // unreadable output is failed output
  }
}

/** Mean per-pixel difference from a Lanczos upscale of the same source. */
const STRUCTURE_TOLERANCE = 15;

/**
 * How far an upscale has drifted from where the picture actually is.
 *
 * A plain Lanczos upscale is soft but structurally beyond question: every pixel
 * lands where it belongs. So a sane neural upscale must still match it at low
 * frequencies — blur them both down and they should agree. Misassembled tiles
 * will not, and that is the failure this catches.
 *
 * Calibrated on this library: a second Lanczos scores ~1, a good Real-ESRGAN
 * pass ~3.5, and output with shuffled tiles ~48. Anything past
 * STRUCTURE_TOLERANCE is not a style difference, it is wrong.
 */
async function structureDiff(candidate, sourcePath) {
  const W = 200;
  const H = 156;
  const sig = (input) =>
    sharp(input).greyscale().resize(W, H, { fit: "fill" }).raw().toBuffer();
  const meta = await sharp(sourcePath).metadata();
  const [ref, got] = await Promise.all([
    sharp(sourcePath)
      .resize({
        width: meta.width * REALESRGAN_SCALE,
        height: meta.height * REALESRGAN_SCALE,
        kernel: sharp.kernel.lanczos3,
      })
      .greyscale()
      .resize(W, H, { fit: "fill" })
      .raw()
      .toBuffer(),
    sig(candidate),
  ]);
  let sum = 0;
  for (let i = 0; i < ref.length; i++) sum += Math.abs(ref[i] - got[i]);
  return sum / ref.length;
}

/**
 * Upscale `inputPath` to a PNG in CACHE_DIR at the model's native 4x and return
 * its path. Falls back to a Lanczos upscale if Real-ESRGAN is unavailable or
 * its output fails validation. Callers downscale to the target size afterwards.
 */
async function upscale(inputPath, cacheKey) {
  await mkdir(CACHE_DIR, { recursive: true });
  const outPath = path.join(CACHE_DIR, `${cacheKey}.up.png`);

  const engine = await ensureRealesrgan();
  if (engine) {
    const candidates =
      workingTile != null
        ? [workingTile, ...TILE_SIZES.filter((t) => t !== workingTile)]
        : TILE_SIZES;
    for (const tile of candidates) {
      try {
        const run = spawnSync(
          engine.exe,
          [
            "-i", inputPath,
            "-o", outPath,
            "-n", REALESRGAN_MODEL,
            "-s", String(REALESRGAN_SCALE), // must be the model's native scale
            "-t", String(tile),
            "-m", path.join(BIN_DIR, "models"),
            "-f", "png",
            ...(engine.gpuId != null ? ["-g", String(engine.gpuId)] : []),
          ],
          { encoding: "utf8" },
        );

        // Real-ESRGAN is not honest about failure: on a Vulkan OOM it prints
        // "vkAllocateMemory failed", writes an all-black PNG, and still exits
        // 0. Trusting the exit code (or the file's existence) once let a full
        // set of black frames through the grade and into /public/images. So
        // check the log AND the pixels before accepting the result.
        const log = `${run.stdout || ""}${run.stderr || ""}`;
        if (run.status !== 0) throw new Error(`exit ${run.status}`);
        if (/failed/i.test(log)) throw new Error(log.match(/^.*failed.*$/mi)[0].trim());
        if (!existsSync(outPath)) throw new Error("no output produced");
        if (await isDegenerate(outPath)) throw new Error("output is blank");

        const drift = await structureDiff(outPath, inputPath);
        if (drift > STRUCTURE_TOLERANCE) {
          throw new Error(`output does not match the source (drift ${drift.toFixed(1)})`);
        }

        workingTile = tile;
        return {
          path: outPath,
          method: `realesrgan(x${REALESRGAN_SCALE},t=${tile},g=${engine.gpuId ?? "auto"})`,
          drift,
        };
      } catch (err) {
        // Most likely a Vulkan OOM — per-tile VRAM scales with tilesize², so
        // drop to the next smaller tile and retry.
        console.warn(`    · tile ${tile} failed (${err.message}); retrying smaller.`);
        await rm(outPath, { force: true });
      }
    }
    console.warn("    · Real-ESRGAN failed at all tile sizes; Lanczos fallback.");
  }

  // CPU fallback: Lanczos at the same scale. Softer, but never wrong.
  const meta = await sharp(inputPath).metadata();
  await sharp(inputPath)
    .resize({
      width: meta.width * REALESRGAN_SCALE,
      height: meta.height * REALESRGAN_SCALE,
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toFile(outPath);
  return { path: outPath, method: "lanczos", drift: 0 };
}

// ---------------------------------------------------------------------------
// Logo mark
// ---------------------------------------------------------------------------

/** Silver-100 — the mark is tinted flat so it reads on midnight and on photos. */
const MARK_TINT = { r: 0xe6, g: 0xea, b: 0xef };
/** Luminance below this is mark; above is beach. */
const MARK_THRESHOLD = 80;
/** Width of the soft edge, in luminance units — keeps the key antialiased. */
const MARK_SOFT = 22;
/** Connected components smaller than this are sea glints and sand speckle. */
const MARK_MIN_COMPONENT = 60;

/**
 * Key the logo lockup out of the supplied marketing graphic.
 *
 * The mark is a solid navy silhouette over sky/sea/sand. Measured on the raw
 * file, the histogram is cleanly bimodal — the mark sits at luminance ~48-63,
 * the background at ~160-223, with almost nothing between — so a luminance key
 * separates them without touching hue.
 *
 * The wrinkle is the horizon: a strip of dark sea falls under the threshold and
 * keys in as a wispy streak beside the horse. It survives as a scatter of small
 * blobs, so dropping components below MARK_MIN_COMPONENT removes it while every
 * letterform (all far larger) is kept. Lowering that floor brings the streak
 * back; raising it eats the small serifs. 60 is measured, not guessed.
 *
 * Output is a tinted, trimmed RGBA PNG — a real mark asset, from the supplied
 * artwork. CLAUDE.md forbids setting blackletter as live text, so this is the
 * only honest way to get one until the client supplies a vector logo.
 */
async function extractMark(rawBuf) {
  const { data, info } = await sharp(rawBuf)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const lum = (i) =>
    0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];

  const alpha = new Float32Array(width * height);
  for (let p = 0; p < width * height; p++) {
    const v = (MARK_THRESHOLD - lum(p * channels)) / MARK_SOFT;
    alpha[p] = Math.max(0, Math.min(1, v));
  }

  // Flood-fill the solid core; keep only components big enough to be artwork.
  const seen = new Uint8Array(width * height);
  const keep = new Uint8Array(width * height);
  const stack = [];
  for (let s = 0; s < width * height; s++) {
    if (seen[s] || alpha[s] < 0.5) continue;
    stack.length = 0;
    stack.push(s);
    seen[s] = 1;
    const comp = [];
    while (stack.length) {
      const p = stack.pop();
      comp.push(p);
      const x = p % width;
      const y = (p - x) / width;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const np = ny * width + nx;
        if (seen[np] || alpha[np] < 0.5) continue;
        seen[np] = 1;
        stack.push(np);
      }
    }
    if (comp.length >= MARK_MIN_COMPONENT) for (const p of comp) keep[p] = 1;
  }
  for (let p = 0; p < width * height; p++) if (!keep[p]) alpha[p] = 0;

  // Trim to the artwork so the asset carries no dead margin.
  let x0 = width, x1 = 0, y0 = height, y1 = 0;
  for (let p = 0; p < width * height; p++) {
    if (alpha[p] <= 0.02) continue;
    const x = p % width;
    const y = (p - x) / width;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }

  const rgba = Buffer.alloc(width * height * 4);
  for (let p = 0; p < width * height; p++) {
    rgba[p * 4] = MARK_TINT.r;
    rgba[p * 4 + 1] = MARK_TINT.g;
    rgba[p * 4 + 2] = MARK_TINT.b;
    rgba[p * 4 + 3] = Math.round(alpha[p] * 255);
  }
  return sharp(rgba, { raw: { width, height, channels: 4 } }).extract({
    left: x0,
    top: y0,
    width: x1 - x0 + 1,
    height: y1 - y0 + 1,
  });
}

// ---------------------------------------------------------------------------
// Grade + duotone
// ---------------------------------------------------------------------------

/**
 * The shared grade. Per-channel linear does three things at once:
 *   slopes  — gentle S-curve contrast (clamping at 0/255 forms the shoulders)
 *   red↑    — highlights lean warm
 *   blue↑ offset / blue slope↓ — shadows lean navy, highlights shed blue (warmth)
 * Applied to a Sharp pipeline; `food` adds a mild saturation lift.
 */
function applyGrade(pipeline, { food }) {
  return pipeline
    .modulate({ saturation: food ? 1.08 : 1.0 })
    .linear(
      [1.05, 1.02, 0.97], // R, G, B slope
      [-3, -1, 7], //          R, G, B offset
    );
}

/**
 * Navy → silver duotone. Greyscale, then map black→midnight (#0A1220) and
 * white→silver-100 (#E6EAEF) via a per-channel linear interpolation.
 */
function applyDuotone(pipeline) {
  const lo = { r: 0x0a, g: 0x12, b: 0x20 }; // midnight
  const hi = { r: 0xe6, g: 0xea, b: 0xef }; // silver-100
  // modulate(saturation:0) desaturates while keeping 3 bands, so the
  // per-channel linear below can map luminance → navy/silver. (greyscale()
  // collapses to a single band, which linear can't expand.)
  return pipeline
    .modulate({ saturation: 0 })
    .linear(
      [(hi.r - lo.r) / 255, (hi.g - lo.g) / 255, (hi.b - lo.b) / 255],
      [lo.r, lo.g, lo.b],
    );
}

async function emitFormats(pipeline, baseName, { includeAvif = true } = {}) {
  const outputs = {};
  const jpgBuf = await pipeline
    .clone()
    .jpeg({ quality: JPEG_Q, mozjpeg: true })
    .toBuffer();
  await writeFile(path.join(OUT_DIR, `${baseName}.jpg`), jpgBuf);
  outputs.jpg = `/images/${baseName}.jpg`;

  const webpBuf = await pipeline
    .clone()
    .webp({ quality: WEBP_Q })
    .toBuffer();
  await writeFile(path.join(OUT_DIR, `${baseName}.webp`), webpBuf);
  outputs.webp = `/images/${baseName}.webp`;

  if (includeAvif) {
    const avifBuf = await pipeline
      .clone()
      .avif({ quality: AVIF_Q })
      .toBuffer();
    await writeFile(path.join(OUT_DIR, `${baseName}.avif`), avifBuf);
    outputs.avif = `/images/${baseName}.avif`;
  }
  return outputs;
}

// ---------------------------------------------------------------------------
// Driver
// ---------------------------------------------------------------------------

function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

async function fileExists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function loadManifest() {
  if (await fileExists(MANIFEST_PATH)) {
    try {
      return JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
    } catch {
      /* corrupt manifest — rebuild */
    }
  }
  return { generatedAt: null, entries: {} };
}

async function allOutputsPresent(entry) {
  const paths = [];
  for (const group of [entry.outputs, entry.duotone]) {
    if (group) for (const rel of Object.values(group)) paths.push(rel);
  }
  for (const rel of paths) {
    if (!(await fileExists(path.join(ROOT, "public", rel)))) return false;
  }
  return paths.length > 0;
}

async function processOne(baseName, opts, manifest) {
  const rawFile = opts.raw;
  const rawPath = path.join(RAW_DIR, rawFile);
  const rawBuf = await readFile(rawPath);
  const hash = sha256(rawBuf);
  const cropKey = opts.crop ? JSON.stringify(opts.crop) : null;

  const prior = manifest.entries[baseName];
  if (
    prior &&
    prior.rawHash === hash &&
    prior.pipelineVersion === PIPELINE_VERSION &&
    (prior.crop ? JSON.stringify(prior.crop) : null) === cropKey &&
    (await allOutputsPresent(prior))
  ) {
    console.log(`  = ${baseName} (up to date)`);
    return prior;
  }

  const rawMeta = await sharp(rawBuf).metadata();

  // The logo mark takes its own path: keyed, tinted and trimmed, never
  // upscaled or graded, and emitted with alpha (so PNG/WebP, never JPEG).
  if (opts.mark) {
    const mark = await extractMark(rawBuf);
    const markMeta = await mark.clone().png().toBuffer({ resolveWithObject: true });
    await writeFile(path.join(OUT_DIR, `${baseName}.png`), markMeta.data);
    const webpBuf = await mark.clone().webp({ quality: 92, alphaQuality: 100 }).toBuffer();
    await writeFile(path.join(OUT_DIR, `${baseName}.webp`), webpBuf);

    console.log(
      `  ◆ ${baseName}  keyed from ${rawFile} → ${markMeta.info.width}x${markMeta.info.height} (alpha)`,
    );
    const entry = {
      raw: `assets-raw/${rawFile}`,
      rawHash: hash,
      pipelineVersion: PIPELINE_VERSION,
      source: { width: rawMeta.width, height: rawMeta.height },
      output: { width: markMeta.info.width, height: markMeta.info.height },
      upscaled: false,
      upscaleMethod: "none",
      mark: true,
      food: false,
      graded: false,
      outputs: {
        png: `/images/${baseName}.png`,
        webp: `/images/${baseName}.webp`,
      },
    };
    manifest.entries[baseName] = entry;
    return entry;
  }

  // Crop the raw first, so the upscaler works on the panel we actually publish
  // rather than on the whole contact sheet.
  let upscaleInput = rawPath;
  if (opts.crop) {
    await mkdir(CACHE_DIR, { recursive: true });
    upscaleInput = path.join(CACHE_DIR, `${baseName}.crop.png`);
    await sharp(rawBuf).extract(opts.crop).png().toFile(upscaleInput);
  }

  const meta = await sharp(upscaleInput).metadata();
  const longEdge = Math.max(meta.width, meta.height);
  const grade = opts.grade !== false;

  // Source for grading — upscaled intermediate, or the (possibly cropped) input.
  let workingInput = upscaleInput;
  let upscaled = false;
  let method = "none";
  if (longEdge < UPSCALE_THRESHOLD) {
    const up = await upscale(upscaleInput, baseName);
    workingInput = up.path;
    upscaled = true;
    method = up.method;
    const from = opts.crop ? `${rawFile} crop ${longEdge}px` : `${longEdge}px`;
    console.log(
      `  ↑ ${baseName}  ${from} → ${method}  drift ${up.drift.toFixed(1)}`,
    );
  } else {
    console.log(`  · ${baseName}  ${longEdge}px (no upscale needed)`);
  }

  // Base pipeline: cap at MAX_LONG_EDGE, never enlarge past source here.
  const base = () =>
    sharp(workingInput)
      .rotate()
      // Real-ESRGAN emits RGBA PNGs; drop the (unused) alpha so the per-channel
      // linear grade/duotone operate on a predictable 3-band image.
      .removeAlpha()
      .resize({
        width: MAX_LONG_EDGE,
        height: MAX_LONG_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      });

  const graded = grade ? applyGrade(base(), opts) : base();
  const outputs = await emitFormats(graded, baseName, {
    includeAvif: true,
  });

  let duotone;
  if (opts.duotone) {
    const duo = applyDuotone(base());
    duotone = await emitFormats(duo, `${baseName}-duo`, { includeAvif: false });
  }

  const finalMeta = await sharp(await base().toBuffer()).metadata();
  const entry = {
    raw: `assets-raw/${rawFile}`,
    rawHash: hash,
    pipelineVersion: PIPELINE_VERSION,
    ...(opts.crop ? { crop: opts.crop } : {}),
    source: { width: rawMeta.width, height: rawMeta.height },
    ...(opts.crop ? { cropped: { width: meta.width, height: meta.height } } : {}),
    output: { width: finalMeta.width, height: finalMeta.height },
    upscaled,
    upscaleMethod: method,
    food: !!opts.food,
    graded: grade,
    outputs,
    ...(duotone ? { duotone } : {}),
  };
  manifest.entries[baseName] = entry;
  return entry;
}

async function main() {
  console.log("The Coachman — image pipeline\n");
  await mkdir(OUT_DIR, { recursive: true });

  const manifest = await loadManifest();

  // Drop entries for outputs that are no longer declared (e.g. a source that
  // has been replaced by crops), so the manifest can't outlive its files.
  for (const key of Object.keys(manifest.entries)) {
    if (!(key in SOURCES)) {
      console.log(`  − ${key} (no longer a source; dropping from manifest)`);
      delete manifest.entries[key];
    }
  }

  let processed = 0;
  let skipped = 0;
  for (const [baseName, opts] of Object.entries(SOURCES)) {
    if (!existsSync(path.join(RAW_DIR, opts.raw))) {
      console.warn(`  ! missing: ${opts.raw}`);
      continue;
    }
    const before = JSON.stringify(manifest.entries[baseName] ?? null);
    const entry = await processOne(baseName, opts, manifest);
    if (JSON.stringify(entry) === before) skipped++;
    else processed++;
  }

  manifest.generatedAt = new Date().toISOString();
  manifest.tokens = { shadow: "#0A1220", highlight: "#E6EAEF" };
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");

  // Clean the upscale cache — intermediates are disposable.
  await rm(CACHE_DIR, { recursive: true, force: true });

  console.log(
    `\nDone. ${processed} processed, ${skipped} up-to-date. Manifest → public/images/manifest.json`,
  );
  console.log(
    `Excluded (menu data, not photography): every other file in /assets-raw.`,
  );
}

main().catch((err) => {
  console.error("\nPipeline failed:", err);
  process.exit(1);
});
