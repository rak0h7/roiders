#!/usr/bin/env node
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "og.png");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#07080c"/>
      <stop offset="50%" stop-color="#120a0e"/>
      <stop offset="100%" stop-color="#07080c"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff2e4a"/>
      <stop offset="50%" stop-color="#ff6b8a"/>
      <stop offset="100%" stop-color="#ff2e4a"/>
    </linearGradient>
    <radialGradient id="glow" cx="30%" cy="20%" r="60%">
      <stop offset="0%" stop-color="#ff2e4a" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#ff2e4a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="80" y="200" width="72" height="72" rx="18" fill="url(#accent)"/>
  <text x="116" y="248" text-anchor="middle" fill="#fff" font-family="system-ui,sans-serif" font-size="32" font-weight="700">R</text>
  <text x="180" y="210" fill="#f2f4f8" font-family="system-ui,sans-serif" font-size="56" font-weight="800">Roiders Club</text>
  <text x="180" y="270" fill="#8b939f" font-family="system-ui,sans-serif" font-size="28">Labs · Gear · Training · Nutrition</text>
  <text x="180" y="340" fill="#f2f4f8" font-family="system-ui,sans-serif" font-size="26">Performance health command center — roiders.club</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(out);
console.log(`✓ ${out}`);