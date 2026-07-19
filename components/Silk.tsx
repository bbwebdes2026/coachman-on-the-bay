"use client";

import { useEffect, useRef } from "react";
import { Color, Mesh, Program, Renderer, Triangle } from "ogl";

/**
 * Silk background (react.bits, adapted) — Luxury Collection section ONLY.
 *
 * A slow midnight-navy silk shader: a single full-screen fragment program that
 * undulates a deep-navy sheen. Faithful to the react.bits Silk maths; the only
 * changes are the tokens — the colour is pulled down to the site's navy and the
 * speed slowed right down so it reads as luxury fabric, not a screensaver.
 *
 * This module is the only place `ogl` (WebGL) is imported. It is loaded through
 * `next/dynamic(..., { ssr: false })` from LuxuryCollection, and only on capable
 * viewports once the section scrolls into view — so `ogl` lives in a lazy chunk
 * that mobile and reduced-motion visitors never download, and the static gradient
 * fallback carries those cases. See components/LuxuryCollection.tsx.
 */

const vertexShader = `
precision highp float;
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd = noise(gl_FragCoord.xy);
  vec2  uv = rotateUvs(vUv * uScale, uRotation);
  vec2  tex = uv * uScale;
  float tOffset = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                            sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec4 col = vec4(uColor, 1.0) * vec4(vec3(pattern), 1.0) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  gl_FragColor = col;
}
`;

export default function Silk() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({
      alpha: false,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
    const gl = renderer.gl;
    // Midnight, so the very first painted frame matches the fallback gradient.
    gl.clearColor(0.039, 0.071, 0.125, 1);

    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    container.appendChild(canvas);

    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        // Deep navy sheen — pulled toward the cove hue but kept dark.
        uColor: { value: new Color(0.11, 0.18, 0.34) },
        uSpeed: { value: 1.8 },
        uScale: { value: 1.0 },
        uRotation: { value: 0.0 },
        uNoiseIntensity: { value: 1.3 },
      },
    });

    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      renderer.setSize(w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      program.uniforms.uTime.value = (now - start) * 0.001;
      renderer.render({ scene: mesh });
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
}
