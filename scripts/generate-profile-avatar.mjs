#!/usr/bin/env node
/**
 * Profile avatar matching the in-app sidebar corner badge (gradient tile + Syne "R").
 * Run: node scripts/generate-profile-avatar.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "assets", "social", "tiktok");

/** Matches Sidebar.tsx — control-height-sm tile with site initial */
const LOGO = {
  letter: "R",
  gradient: "linear-gradient(135deg, #ff2e4a 0%, #ff6b8a 50%, #ff2e4a 100%)",
  glow: "rgba(255, 46, 74, 0.28)",
  bg: "#07080c",
  /** 36px tile, 14px radius in app */
  tileRatio: 14 / 36,
};

const SIZES = [
  { file: "profile-avatar.png", size: 1080, tileScale: 0.72 },
  { file: "profile-avatar-2048.png", size: 2048, tileScale: 0.72 },
  { file: "profile-avatar-1024.png", size: 1024, tileScale: 0.72 },
  { file: "profile-avatar-512.png", size: 512, tileScale: 0.72 },
  { file: "profile-avatar-180.png", size: 180, tileScale: 0.78 },
];

function avatarHtml(size, tileScale) {
  const tile = Math.round(size * tileScale);
  const radius = Math.round(tile * LOGO.tileRatio);
  const fontSize = Math.round(tile * (14 / 36));
  const shadowBlur = Math.round((16 / 36) * tile);
  const shadowY = Math.round((4 / 36) * tile);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap" rel="stylesheet"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: ${size}px;
    height: ${size}px;
    background: ${LOGO.bg};
    display: grid;
    place-items: center;
    overflow: hidden;
  }
  .ambient {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 90% 70% at 50% 38%, rgba(255, 46, 74, 0.14) 0%, transparent 58%),
      ${LOGO.bg};
  }
  .tile {
    position: relative;
    z-index: 1;
    width: ${tile}px;
    height: ${tile}px;
    border-radius: ${radius}px;
    background: ${LOGO.gradient};
    box-shadow: 0 ${shadowY}px ${shadowBlur}px ${LOGO.glow};
    display: grid;
    place-items: center;
  }
  .tile span {
    font-family: 'Syne', system-ui, sans-serif;
    font-size: ${fontSize}px;
    font-weight: 700;
    line-height: 1;
    color: #ffffff;
    user-select: none;
    transform: translateY(${Math.round(fontSize * 0.02)}px);
  }
</style>
</head>
<body>
  <div class="ambient"></div>
  <div class="tile" aria-label="Roiders Club"><span>${LOGO.letter}</span></div>
</body>
</html>`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();

  for (const { file, size, tileScale } of SIZES) {
    const htmlPath = join(tmpdir(), `roiders-avatar-${size}.html`);
    await writeFile(htmlPath, avatarHtml(size, tileScale), "utf8");

    const page = await browser.newPage({
      viewport: { width: size, height: size },
      deviceScaleFactor: 1,
    });
    await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);

    await page.screenshot({
      path: join(OUT_DIR, file),
      type: "png",
      omitBackground: false,
    });
    await page.close();
    await unlink(htmlPath).catch(() => {});
    console.log(`✓ ${file} (${size}×${size})`);
  }

  await browser.close();
  console.log(`\nAvatars → ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});