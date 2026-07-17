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
const PIPELINE_VERSION = 4;

// Real-ESRGAN tile sizes to try, largest first. Bigger tiles avoid the visible
// tile-seam artifacts that small tiles leave on smooth gradients (ceilings,
// dark floors); per-tile VRAM scales with tilesize², so we fall back to smaller
// tiles if a GPU can't allocate the larger ones.
//
// Measured on this hardware: 640 is seam-free on the Radeon iGPU (which carves
// its heap out of system RAM), but OOMs on the RTX 3060's 6GB. 448 is the
// largest the 3060 sustains, and is visually indistinguishable from 640 — so
// discrete stays worth it. Below ~320 the seams return; Lanczos beats a seamed
// upscale, hence no tiny tiles and no 0 (auto picks a seam-causing size).
const TILE_SIZES = [640, 448, 384, 320];

// First tile size that actually worked, reused for subsequent images so we
// don't re-pay the OOM probe on every file.
let workingTile = null;

/**
 * The ONLY files treated as photography. Everything else in /assets-raw is a
 * menu-text screenshot (menu data) and is intentionally excluded.
 *   food    — mild saturation lift (food shots only)
 *   duotone — also emit a navy/silver *-duo variant
 *   grade   — false to skip the photographic grade (the logo mark)
 */
const SOURCES = {
  "seating-area3.jpg": { food: false }, // daylight terrace / bay — hero
  "Seating-area1.jpg": { food: false, duotone: true }, // dining room, LED coves
  "seating-area2.jpg": { food: false }, // bar + brushed-metal wall logo
  "bar-area.jpg": { food: false, duotone: true }, // weaker candid interior
  "the-notorious-coachman-chair.jpg": { food: false }, // the teal chair — feature
  "food-image1.jpg": { food: true },
  "food-image2.jpg": { food: true },
  "food-image3.jpg": { food: true },
  "food-image4.jpg": { food: true },
  "food-image5.jpg": { food: true },
  "coachman-logo.jpg": { food: false, grade: false }, // logo mark — optimise only
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

/**
 * Upscale `inputPath` to a PNG in CACHE_DIR and return its path. Uses
 * Real-ESRGAN when available, otherwise a Lanczos Sharp upscale. `scale` is
 * one of 2/3/4.
 */
async function upscale(inputPath, scale, cacheKey) {
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
            "-n", "realesrgan-x4plus", // general photo model
            "-s", String(scale),
            "-t", String(tile), // large tiles avoid seam artifacts
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

        workingTile = tile;
        return {
          path: outPath,
          method: `realesrgan(t=${tile},g=${engine.gpuId ?? "auto"})`,
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

  // CPU fallback: Lanczos upscale to the target long edge.
  const meta = await sharp(inputPath).metadata();
  const targetLong = Math.max(meta.width, meta.height) * scale;
  await sharp(inputPath)
    .resize({
      width: meta.width >= meta.height ? targetLong : undefined,
      height: meta.height > meta.width ? targetLong : undefined,
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toFile(outPath);
  return { path: outPath, method: "lanczos" };
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

async function processOne(file, opts, manifest) {
  const rawPath = path.join(RAW_DIR, file);
  const rawBuf = await readFile(rawPath);
  const hash = sha256(rawBuf);
  const baseName = path.basename(file, path.extname(file));

  const prior = manifest.entries[file];
  if (
    prior &&
    prior.rawHash === hash &&
    prior.pipelineVersion === PIPELINE_VERSION &&
    (await allOutputsPresent(prior))
  ) {
    console.log(`  = ${file} (up to date)`);
    return prior;
  }

  const meta = await sharp(rawBuf).metadata();
  const longEdge = Math.max(meta.width, meta.height);
  const grade = opts.grade !== false;

  // Source for grading — upscaled intermediate or the raw buffer.
  let workingInput = rawPath;
  let upscaled = false;
  let method = "none";
  if (longEdge < UPSCALE_THRESHOLD) {
    const scale = Math.min(4, Math.max(2, Math.ceil(MAX_LONG_EDGE / longEdge)));
    const up = await upscale(rawPath, scale, baseName);
    workingInput = up.path;
    upscaled = true;
    method = up.method;
    console.log(`  ↑ ${file}  ${longEdge}px → ${scale}x (${method})`);
  } else {
    console.log(`  · ${file}  ${longEdge}px (no upscale needed)`);
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
    raw: `assets-raw/${file}`,
    rawHash: hash,
    pipelineVersion: PIPELINE_VERSION,
    source: { width: meta.width, height: meta.height },
    output: { width: finalMeta.width, height: finalMeta.height },
    upscaled,
    upscaleMethod: method,
    food: !!opts.food,
    graded: grade,
    outputs,
    ...(duotone ? { duotone } : {}),
  };
  manifest.entries[file] = entry;
  return entry;
}

async function main() {
  console.log("The Coachman — image pipeline\n");
  await mkdir(OUT_DIR, { recursive: true });

  const manifest = await loadManifest();
  const files = Object.keys(SOURCES);

  let processed = 0;
  let skipped = 0;
  for (const file of files) {
    if (!existsSync(path.join(RAW_DIR, file))) {
      console.warn(`  ! missing: ${file}`);
      continue;
    }
    const before = JSON.stringify(manifest.entries[file] ?? null);
    const entry = await processOne(file, SOURCES[file], manifest);
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
