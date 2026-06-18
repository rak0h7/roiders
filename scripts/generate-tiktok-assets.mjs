#!/usr/bin/env node
/**
 * Generates TikTok-ready PNG assets (720×1350) for Roiders Club.
 * Run: node scripts/generate-tiktok-assets.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "assets", "social", "tiktok");
const WIDTH = 720;
const HEIGHT = 1350;
const SX = WIDTH / 1080;
const SY = HEIGHT / 1920;
const px = (n) => Math.round(n * SX);
const py = (n) => Math.round(n * SY);
/** TikTok UI dead zones — caption/username/bottom nav + right action rail */
const SAFE = { top: py(108), right: px(148), bottom: py(400), left: px(56) };

const BRAND = {
  bg: "#07080c",
  fg: "#f2f4f8",
  muted: "#8b939f",
  labs: "#ff2e4a",
  protocol: "#ff6b8a",
  intel: "#c084fc",
  success: "#34d399",
};

const SLIDES = [
  {
    file: "01-brand-intro.png",
    accent: BRAND.labs,
    badge: "Performance health",
    headline: "Roiders Club",
    sub: "Labs · Gear · Training · Nutrition",
    body: "One private command center for everything you track on cycle.",
    footer: "roiders.club",
    visual: "hero",
  },
  {
    file: "02-labs.png",
    accent: BRAND.labs,
    badge: "Labs",
    headline: "Track every panel",
    sub: "Trends, flags & baselines",
    body: "Log bloodwork, chart markers over time, and catch out-of-range values before they stack up.",
    bullets: ["PDF import", "Baseline vs on-cycle ranges", "Cross-module alerts"],
    visual: "chart",
  },
  {
    file: "03-gear.png",
    accent: BRAND.protocol,
    badge: "Gear",
    headline: "Plan your stack",
    sub: "Saturation & risk analytics",
    body: "Build cycles, simulate steady-state curves, and see compound risk before you pin.",
    bullets: ["Cycle builder", "PK saturation curves", "127 compound guides"],
    visual: "stack",
  },
  {
    file: "04-training.png",
    accent: BRAND.protocol,
    badge: "Training",
    headline: "Log every session",
    sub: "Programs, PRs & volume",
    body: "Workout diary with rest timers, supersets, and weekly volume charts tied to your goals.",
    bullets: ["Workout log", "Program templates", "Progress charts"],
    visual: "bars",
  },
  {
    file: "05-nutrition.png",
    accent: BRAND.intel,
    badge: "Nutrition",
    headline: "Hit your macros",
    sub: "Diary + micronutrients",
    body: "Macro targets from your stats, daily food log, and micro tracking without a separate app.",
    bullets: ["Macro goals", "Food search", "Custom foods"],
    visual: "rings",
  },
  {
    file: "06-cross-intelligence.png",
    accent: BRAND.intel,
    badge: "Intelligence",
    headline: "Connect the dots",
    sub: "Cross-module alerts",
    body: "Labs, gear, training, and nutrition talk to each other — flags surface when data lines up.",
    bullets: ["HCT + dose context", "Recovery vs volume", "Unified dashboard"],
    visual: "nodes",
  },
  {
    file: "07-lab-upload-ocr.png",
    accent: BRAND.labs,
    badge: "New",
    headline: "Snap your labs",
    sub: "Screenshot → parsed panel",
    body: "Upload camera-roll screenshots. OCR reads your results and drops them straight into your log.",
    bullets: ["Multi-image upload", "On-device OCR", "No manual typing"],
    visual: "phone",
  },
  {
    file: "08-saturation-curves.png",
    accent: BRAND.protocol,
    badge: "Gear",
    headline: "See steady state",
    sub: "Saturation explained",
    body: "Visual PK curves show when compounds plateau — so dose changes match what’s actually in your system.",
    bullets: ["Half-life modeling", "Stack overlays", "Education built in"],
    visual: "curve",
  },
  {
    file: "09-compound-guides.png",
    accent: BRAND.intel,
    badge: "Guides",
    headline: "127 profiles",
    sub: "Steroids + OMA compounds",
    body: "In-depth compound guides with dosing context, sides, and practical notes — searchable in-app.",
    bullets: ["Steroid profiles", "Peptides & more", "One-tap lookup"],
    visual: "cards",
  },
  {
    file: "10-free-forever.png",
    accent: BRAND.success,
    badge: "Pricing",
    headline: "Free forever",
    sub: "$0 · full trackers",
    body: "All four modules, cross-intelligence, export/import, and private access-key login. No card required.",
    bullets: ["All modules unlocked", "On-device storage", "Create account in seconds"],
    visual: "check",
  },
  {
    file: "11-premium-sync.png",
    accent: BRAND.intel,
    badge: "Premium",
    headline: "Cloud sync",
    sub: "Multi-device backup",
    body: "Optional premium adds encrypted cloud sync, sources directory, and priority support — on request.",
    bullets: ["Cloud backup", "Premium sources", "Multi-device"],
    visual: "cloud",
  },
  {
    file: "12-cta-follow.png",
    accent: BRAND.labs,
    badge: "Link in bio",
    headline: "Start tracking",
    sub: "roiders.club",
    body: "Private performance health platform. Create your access key and log your first panel today.",
    footer: "Free account → roiders.club",
    visual: "cta",
  },
];

function slideHtml(slide, index) {
  const bullets = (slide.bullets ?? [])
    .map(
      (b) =>
        `<li><span class="dot" style="background:${slide.accent}"></span>${b}</li>`
    )
    .join("");

  return `<section class="slide" data-index="${index}">
  <div class="ambient" style="--accent:${slide.accent}"></div>
  <div class="grid-overlay"></div>
  <div class="content">
    <header class="header">
      <div class="brand-mark">
        <span class="logo" style="color:${slide.accent}">RC</span>
        <span>Roiders Club</span>
      </div>
      <span class="badge" style="color:${slide.accent};border-color:${slide.accent}40;background:${slide.accent}18">${slide.badge}</span>
    </header>
    <div class="copy">
      <h1 style="--accent:${slide.accent}">${slide.headline}</h1>
      <p class="sub">${slide.sub}</p>
      <p class="body">${slide.body}</p>
      ${bullets ? `<ul class="bullets">${bullets}</ul>` : ""}
      ${slide.footer ? `<p class="footer" style="color:${slide.accent}">${slide.footer}</p>` : ""}
    </div>
    <div class="visual-zone" aria-hidden="true">
      ${visualBlock(slide.visual, slide.accent)}
    </div>
  </div>
</section>`;
}

function visualBlock(type, accent) {
  const a = accent;
  const visuals = {
    hero: `<div class="visual hero">
      <div class="orb o1" style="background:${a}"></div>
      <div class="orb o2" style="background:${BRAND.protocol}"></div>
      <div class="orb o3" style="background:${BRAND.intel}"></div>
    </div>`,
    chart: `<div class="visual chart">
      <svg viewBox="0 0 320 180" class="mini-chart">
        <polyline points="10,150 50,120 90,130 130,80 170,95 210,40 250,55 290,20" fill="none" stroke="${a}" stroke-width="4" stroke-linecap="round"/>
        <line x1="10" y1="160" x2="310" y2="160" stroke="#ffffff20" stroke-width="2"/>
        ${[40, 80, 120].map((y) => `<line x1="10" y1="${y}" x2="310" y2="${y}" stroke="#ffffff08" stroke-width="1"/>`).join("")}
      </svg>
      <div class="flag" style="border-color:${a}60;color:${a}">HCT ↑</div>
    </div>`,
    stack: `<div class="visual stack">
      ${["Test E", "NPP", "Mast"].map((c, i) => `<div class="compound" style="border-color:${a}${60 - i * 15}">${c}</div>`).join("")}
    </div>`,
    bars: `<div class="visual bars">
      ${[65, 45, 80, 55, 90, 70].map((h, i) => `<div class="bar" style="height:${h}%;background:linear-gradient(180deg,${a},${a}55)"></div>`).join("")}
    </div>`,
    rings: `<div class="visual rings">
      <div class="ring r1" style="border-color:${a}"><span>Protein</span><strong>185g</strong></div>
      <div class="ring r2" style="border-color:${BRAND.protocol}"><span>Carbs</span><strong>320g</strong></div>
      <div class="ring r3" style="border-color:${BRAND.intel}"><span>Fats</span><strong>72g</strong></div>
    </div>`,
    nodes: `<div class="visual nodes">
      <div class="node center" style="border-color:${a};color:${a}">Intel</div>
      <div class="node n1" style="border-color:${BRAND.labs}50">Labs</div>
      <div class="node n2" style="border-color:${BRAND.protocol}50">Gear</div>
      <div class="node n3" style="border-color:${BRAND.protocol}50">Train</div>
      <div class="node n4" style="border-color:${BRAND.intel}50">Food</div>
      <svg class="node-lines" viewBox="0 0 300 200"><line x1="150" y1="100" x2="60" y2="40" stroke="${a}40" stroke-width="2"/><line x1="150" y1="100" x2="240" y2="40" stroke="${a}40" stroke-width="2"/><line x1="150" y1="100" x2="50" y2="160" stroke="${a}40" stroke-width="2"/><line x1="150" y1="100" x2="250" y2="160" stroke="${a}40" stroke-width="2"/></svg>
    </div>`,
    phone: `<div class="visual phone">
      <div class="phone-frame">
        <div class="screen">
          <div class="scan-line" style="background:${a}"></div>
          <div class="ocr-row"><span>ALT</span><b style="color:${a}">42</b></div>
          <div class="ocr-row"><span>HCT</span><b>48%</b></div>
          <div class="ocr-row"><span>Test</span><b>1,240</b></div>
        </div>
      </div>
    </div>`,
    curve: `<div class="visual curve">
      <svg viewBox="0 0 320 160" class="pk-curve">
        <path d="M10,140 C60,140 80,30 140,35 S220,40 310,38" fill="none" stroke="${a}" stroke-width="4"/>
        <line x1="140" y1="35" x2="140" y2="150" stroke="${a}60" stroke-dasharray="6 6" stroke-width="2"/>
        <text x="148" y="28" fill="${a}" font-size="14" font-family="sans-serif">steady state</text>
      </svg>
    </div>`,
    cards: `<div class="visual cards">
      ${["Tren", "BPC-157", "HGH"].map((t, i) => `<div class="guide-card" style="border-color:${a}${70 - i * 20}">${t}<small>guide</small></div>`).join("")}
    </div>`,
    check: `<div class="visual check">
      <div class="check-ring" style="border-color:${a}">
        <svg viewBox="0 0 24 24" width="80" height="80"><path d="M5 12l5 5L19 7" fill="none" stroke="${a}" stroke-width="3" stroke-linecap="round"/></svg>
      </div>
      <div class="price" style="color:${a}">$0</div>
    </div>`,
    cloud: `<div class="visual cloud">
      <div class="cloud-shape" style="border-color:${a}60">
        <div class="sync-dot" style="background:${a}"></div>
        <div class="sync-dot d2" style="background:${BRAND.protocol}"></div>
        <div class="sync-dot d3" style="background:${BRAND.intel}"></div>
      </div>
    </div>`,
    cta: `<div class="visual cta">
      <div class="cta-arrow" style="color:${a}">↓</div>
      <div class="cta-glow" style="background:radial-gradient(circle,${a}35,transparent 70%)"></div>
    </div>`,
  };
  return visuals[type] ?? visuals.hero;
}

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Syne:wght@600;700;800&display=swap" rel="stylesheet"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #111; font-family: 'DM Sans', system-ui, sans-serif; }
  .slide {
    width: ${WIDTH}px;
    height: ${HEIGHT}px;
    position: relative;
    overflow: hidden;
    background: ${BRAND.bg};
    color: ${BRAND.fg};
  }
  .ambient {
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 120% 80% at 10% -5%, color-mix(in srgb, var(--accent) 28%, transparent), transparent 55%),
      radial-gradient(ellipse 100% 70% at 95% 105%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 50%),
      ${BRAND.bg};
  }
  .grid-overlay {
    position: absolute; inset: 0; opacity: 0.35;
    background-image:
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: ${px(48)}px ${px(48)}px;
    mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, black, transparent);
  }
  .content {
    position: relative; z-index: 1;
    height: 100%;
    padding: ${SAFE.top}px ${SAFE.right}px ${SAFE.bottom}px ${SAFE.left}px;
    display: flex;
    flex-direction: column;
    gap: ${py(28)}px;
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${px(20)}px;
    flex-shrink: 0;
  }
  .badge {
    flex-shrink: 0;
    font-size: ${px(20)}px; font-weight: 600; letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: ${px(10)}px ${px(18)}px;
    border-radius: 999px;
    border: 1px solid;
  }
  .copy {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: ${py(18)}px;
    max-width: 100%;
  }
  h1 {
    font-family: 'Syne', sans-serif;
    font-size: ${px(80)}px;
    font-weight: 800;
    line-height: 0.98;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, ${BRAND.fg} 0%, color-mix(in srgb, var(--accent) 35%, ${BRAND.fg}) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .sub { font-size: ${px(32)}px; font-weight: 600; color: ${BRAND.muted}; letter-spacing: -0.01em; }
  .body { font-size: ${px(26)}px; line-height: 1.42; color: color-mix(in srgb, ${BRAND.fg} 82%, ${BRAND.muted}); max-width: 100%; }
  .bullets { list-style: none; display: flex; flex-direction: column; gap: ${py(12)}px; margin-top: 4px; }
  .bullets li { font-size: ${px(24)}px; display: flex; align-items: center; gap: ${px(12)}px; color: ${BRAND.fg}; }
  .dot { width: ${px(10)}px; height: ${px(10)}px; border-radius: 50%; flex-shrink: 0; }
  .footer {
    margin-top: 4px;
    font-family: 'Syne', sans-serif;
    font-size: ${px(34)}px;
    font-weight: 700;
  }
  .brand-mark {
    display: flex; align-items: center; gap: ${px(12)}px;
    font-size: ${px(20)}px; font-weight: 600; color: ${BRAND.muted};
    letter-spacing: 0.04em;
  }
  .logo {
    width: ${px(40)}px; height: ${px(40)}px; border-radius: ${px(11)}px;
    border: 1px solid currentColor;
    display: grid; place-items: center;
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: ${px(16)}px;
    background: rgba(255,255,255,0.04);
  }

  /* Decorative visuals — middle band only, no readable text */
  .visual-zone {
    flex: 0 0 auto;
    height: ${py(380)}px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: -${px(40)}px;
    pointer-events: none;
  }
  .visual { position: relative; width: 100%; height: 100%; }
  .hero .orb { position: absolute; border-radius: 50%; filter: blur(${px(40)}px); opacity: 0.5; }
  .hero .o1 { width: ${px(200)}px; height: ${px(200)}px; top: ${py(10)}px; left: ${px(20)}px; }
  .hero .o2 { width: ${px(160)}px; height: ${px(160)}px; top: ${py(60)}px; right: ${px(30)}px; }
  .hero .o3 { width: ${px(120)}px; height: ${px(120)}px; top: 50%; left: 45%; transform: translateY(-50%); }
  .chart { display: flex; align-items: center; justify-content: center; gap: ${px(20)}px; height: 100%; }
  .mini-chart { width: ${px(380)}px; height: auto; }
  .flag { padding: ${py(12)}px ${px(20)}px; border-radius: ${px(12)}px; border: 1px solid; font-weight: 700; font-size: ${px(24)}px; }
  .stack { height: 100%; }
  .compound {
    position: absolute; left: 50%; transform: translateX(-50%);
    padding: ${py(18)}px ${px(32)}px; border-radius: ${px(16)}px; border: 1px solid;
    font-size: ${px(28)}px; font-weight: 600;
    background: rgba(255,255,255,0.05);
    backdrop-filter: blur(6px);
  }
  .compound:nth-child(1) { top: ${py(40)}px; margin-left: -${px(40)}px; }
  .compound:nth-child(2) { top: ${py(120)}px; margin-left: 0; }
  .compound:nth-child(3) { top: ${py(200)}px; margin-left: ${px(40)}px; }
  .bars { display: flex; align-items: flex-end; justify-content: center; gap: ${px(18)}px; height: 100%; max-height: ${py(280)}px; }
  .bar { width: ${px(44)}px; border-radius: ${px(10)}px ${px(10)}px ${px(4)}px ${px(4)}px; min-height: ${py(20)}px; }
  .rings { display: flex; gap: ${px(18)}px; justify-content: center; align-items: center; height: 100%; }
  .ring {
    width: ${px(130)}px; height: ${px(130)}px; border-radius: 50%; border: ${px(6)}px solid;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.03);
  }
  .ring span { font-size: ${px(16)}px; color: ${BRAND.muted}; }
  .ring strong { font-size: ${px(26)}px; margin-top: 4px; }
  .nodes { position: relative; height: 100%; max-height: ${py(280)}px; margin: 0 auto; width: ${px(300)}px; }
  .node {
    position: absolute; padding: ${py(12)}px ${px(22)}px; border-radius: 999px; border: 1px solid;
    font-weight: 600; font-size: ${px(22)}px; background: rgba(255,255,255,0.05);
  }
  .node.center { left: 50%; top: 50%; transform: translate(-50%,-50%); font-family: 'Syne', sans-serif; font-size: ${px(24)}px; z-index: 2; }
  .node.n1 { left: ${px(10)}px; top: ${py(20)}px; }
  .node.n2 { right: ${px(10)}px; top: ${py(20)}px; }
  .node.n3 { left: 0; bottom: ${py(20)}px; }
  .node.n4 { right: 0; bottom: ${py(20)}px; }
  .node-lines { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  .phone { display: flex; justify-content: center; align-items: center; height: 100%; }
  .phone-frame {
    width: ${px(200)}px; height: ${py(340)}px; border-radius: ${px(28)}px;
    border: 3px solid rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.04);
    padding: ${px(16)}px;
    box-shadow: 0 ${py(20)}px ${px(60)}px rgba(0,0,0,0.4);
  }
  .screen { height: 100%; border-radius: ${px(16)}px; background: #0c0e14; padding: ${py(20)}px ${px(16)}px; position: relative; overflow: hidden; }
  .scan-line { position: absolute; left: 0; right: 0; height: 3px; top: 45%; opacity: 0.8; box-shadow: 0 0 ${px(20)}px currentColor; }
  .ocr-row { display: flex; justify-content: space-between; padding: ${py(14)}px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: ${px(22)}px; }
  .ocr-row b { font-family: 'Syne', sans-serif; }
  .curve { display: flex; justify-content: center; align-items: center; height: 100%; }
  .pk-curve { width: ${px(400)}px; }
  .cards { display: flex; gap: ${px(14)}px; justify-content: center; align-items: center; height: 100%; flex-wrap: wrap; }
  .guide-card {
    width: ${px(140)}px; padding: ${py(24)}px ${px(16)}px; border-radius: ${px(16)}px; border: 1px solid;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: ${px(28)}px; text-align: center;
    background: rgba(255,255,255,0.04);
  }
  .guide-card small { display: block; font-family: 'DM Sans', sans-serif; font-size: ${px(14)}px; font-weight: 500; color: ${BRAND.muted}; margin-top: 6px; }
  .check { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: ${py(20)}px; height: 100%; }
  .check-ring { width: ${px(140)}px; height: ${px(140)}px; border-radius: 50%; border: 4px solid; display: grid; place-items: center; background: rgba(255,255,255,0.03); }
  .price { font-family: 'Syne', sans-serif; font-size: ${px(72)}px; font-weight: 800; }
  .cloud { display: flex; justify-content: center; align-items: center; height: 100%; }
  .cloud-shape {
    width: ${px(200)}px; height: ${py(120)}px; border-radius: ${px(60)}px; border: 2px solid;
    position: relative; background: rgba(255,255,255,0.04);
  }
  .cloud-shape::before, .cloud-shape::after {
    content: ''; position: absolute; background: inherit; border: inherit; border-radius: 50%;
  }
  .cloud-shape::before { width: ${px(80)}px; height: ${px(80)}px; top: -${py(30)}px; left: ${px(30)}px; }
  .cloud-shape::after { width: ${px(100)}px; height: ${px(100)}px; top: -${py(40)}px; right: ${px(20)}px; }
  .sync-dot { position: absolute; width: ${px(16)}px; height: ${px(16)}px; border-radius: 50%; bottom: ${py(40)}px; left: 50%; transform: translateX(-50%); }
  .sync-dot.d2 { left: 35%; bottom: ${py(50)}px; }
  .sync-dot.d3 { left: 65%; bottom: ${py(50)}px; }
  .cta { display: flex; justify-content: center; align-items: center; height: 100%; position: relative; }
  .cta-arrow { font-size: ${px(64)}px; font-weight: 700; opacity: 0.35; }
  .cta-glow { position: absolute; width: ${px(280)}px; height: ${px(280)}px; border-radius: 50%; }
</style>
</head>
<body>
${SLIDES.map((s, i) => slideHtml(s, i)).join("\n")}
</body>
</html>`;

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const htmlPath = join(tmpdir(), "roiders-tiktok-render.html");
  await writeFile(htmlPath, HTML, "utf8");

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  });

  await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  for (let i = 0; i < SLIDES.length; i++) {
    const slide = SLIDES[i];
    const el = page.locator(`.slide[data-index="${i}"]`);
    const outPath = join(OUT_DIR, slide.file);
    await el.screenshot({ path: outPath, type: "png" });
    console.log(`✓ ${slide.file}`);
  }

  await browser.close();
  await unlink(htmlPath).catch(() => {});
  console.log(`\n${SLIDES.length} slides (${WIDTH}×${HEIGHT}) → ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});