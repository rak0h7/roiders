#!/usr/bin/env node
/**
 * TikTok assets — how bloodwork analysis works (720×1350, red/green theme).
 * Run: node scripts/generate-labs-analysis-assets.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "assets", "social", "tiktok", "labs-analysis");
const WIDTH = 720;
const HEIGHT = 1350;
const SX = WIDTH / 1080;
const SY = HEIGHT / 1920;
const px = (n) => Math.round(n * SX);
const py = (n) => Math.round(n * SY);
const SAFE = { top: py(108), right: px(148), bottom: py(400), left: px(56) };

const THEME = {
  bg: "#07080c",
  fg: "#f2f4f8",
  muted: "#8b939f",
  red: "#ff2e4a",
  redSoft: "#f87171",
  green: "#34d399",
  greenDim: "rgba(52, 211, 153, 0.14)",
  redDim: "rgba(255, 46, 74, 0.14)",
  yellow: "#fbbf24",
  yellowDim: "rgba(251, 191, 36, 0.14)",
};

const SLIDES = [
  {
    file: "01-how-it-works.png",
    step: "Labs analysis",
    headline: "How it works",
    sub: "Upload → parse → flag",
    body: "Roiders Club reads your panel, scores every category, and surfaces what’s green vs what needs attention.",
    visual: "flow",
  },
  {
    file: "02-upload.png",
    step: "Step 1",
    headline: "Get data in",
    sub: "PDF or screenshots",
    body: "Drop a lab PDF or upload camera-roll screenshots. OCR pulls values from photos — no manual typing.",
    bullets: ["PDF import", "Multi-image OCR", "Manual entry fallback"],
    visual: "upload",
  },
  {
    file: "03-parse.png",
    step: "Step 2",
    headline: "Match markers",
    sub: "48+ analytes · unit conversion",
    body: "Parser maps lab names to marker IDs, normalizes units (ng/dL, nmol/L, etc.), and logs the panel with a date.",
    bullets: ["Alias matching", "Auto unit convert", "Dated reports"],
    visual: "parse",
  },
  {
    file: "04-range-modes.png",
    step: "Step 3",
    headline: "Pick your ranges",
    sub: "Lab reference vs on-cycle",
    body: "Toggle between standard lab reference ranges and optimized on-cycle targets tuned for performance health tracking.",
    bullets: ["Lab reference mode", "On-cycle target mode", "Per-marker optimal bands"],
    visual: "modes",
  },
  {
    file: "05-traffic-light.png",
    step: "Step 4",
    headline: "Traffic light flags",
    sub: "Green · yellow · red",
    body: "Each marker is scored against your active range mode. Green = in target. Yellow = caution band. Red = act now.",
    bullets: ["Normal → green", "Caution → yellow", "High / stop → red"],
    visual: "traffic",
  },
  {
    file: "06-health-score.png",
    step: "Insights",
    headline: "Health score",
    sub: "One number · full picture",
    body: "Overall score rolls up every logged marker. Category bars show hormonal, CBC, liver, lipids, kidney & more at a glance.",
    visual: "score",
  },
  {
    file: "07-categories.png",
    step: "Breakdown",
    headline: "11 categories",
    sub: "Tap any panel for detail",
    body: "Hormonal, CBC, cardiovascular, liver, kidney, metabolic, thyroid, muscle, nutrients, immune, electrolytes — each with its own score.",
    visual: "categories",
  },
  {
    file: "08-review-flags.png",
    step: "Review flags",
    headline: "See the deviation",
    sub: "Not just high or low",
    body: "Flags show exactly how far a value sits from target — percent above optimal, caution bands, and strict stop thresholds.",
    visual: "flags",
  },
  {
    file: "09-stack-context.png",
    step: "Gear context",
    headline: "Linked to stack",
    sub: "Labs + compounds",
    body: "Active cycle compounds enrich flags — e.g. elevated HCT linked to test or EQ, ALT tied to oral hepatotoxicity.",
    visual: "stack",
  },
  {
    file: "10-cross-alerts.png",
    step: "Intelligence",
    headline: "Cross-alerts",
    sub: "Labs meet gear & training",
    body: "Cross-module engine connects panel flags with your protocol and training load — surfacing risks that siloed apps miss.",
    visual: "cross",
  },
  {
    file: "11-trends.png",
    step: "History",
    headline: "Track trends",
    sub: "Panel over panel",
    body: "Every report is stored with a date. Chart markers across time to see if interventions actually moved the needle.",
    visual: "trend",
  },
  {
    file: "12-cta.png",
    step: "Try it",
    headline: "Log your panel",
    sub: "roiders.club",
    body: "Free bloodwork tracking with real analysis — not just a spreadsheet. Upload your next panel today.",
    footer: "Free account → roiders.club",
    visual: "cta",
  },
];

function visualBlock(type) {
  const { red, green, yellow, redDim, greenDim, yellowDim, muted, fg } = THEME;
  const visuals = {
    flow: `<div class="visual flow">
      <div class="flow-step" style="border-color:${green}50;color:${green}">Upload</div>
      <div class="flow-arrow" style="color:${muted}">→</div>
      <div class="flow-step" style="border-color:${green}50;color:${fg}">Parse</div>
      <div class="flow-arrow" style="color:${muted}">→</div>
      <div class="flow-step" style="border-color:${red}50;color:${red}">Flag</div>
    </div>`,
    upload: `<div class="visual upload">
      <div class="drop-zone" style="border-color:${green}60">
        <span style="color:${green}">↓ Drop PDF</span>
        <small>or screenshots</small>
      </div>
    </div>`,
    parse: `<div class="visual parse">
      <div class="parse-row matched"><span class="lab-name">Hematocrit</span><span class="val" style="color:${green}">48%</span><span class="tag" style="background:${greenDim};color:${green}">matched</span></div>
      <div class="parse-row matched"><span class="lab-name">Estradiol</span><span class="val" style="color:${green}">34 pg/mL</span><span class="tag" style="background:${greenDim};color:${green}">matched</span></div>
      <div class="parse-row"><span class="lab-name">ALT (SGPT)</span><span class="val" style="color:${fg}">28 U/L</span><span class="tag" style="background:${greenDim};color:${green}">converted</span></div>
    </div>`,
    modes: `<div class="visual modes">
      <div class="mode-card active" style="border-color:${green};background:${greenDim}">
        <span class="mode-label" style="color:${green}">On-cycle target</span>
        <span class="mode-range">HCT 38–48%</span>
      </div>
      <div class="mode-card" style="border-color:${muted}40">
        <span class="mode-label" style="color:${muted}">Lab reference</span>
        <span class="mode-range">HCT 38–50%</span>
      </div>
    </div>`,
    traffic: `<div class="visual traffic">
      <div class="tl-row"><span class="tl-dot" style="background:${green}"></span><span class="tl-name">HDL</span><span class="tl-badge" style="background:${greenDim};color:${green}">NORMAL</span></div>
      <div class="tl-row"><span class="tl-dot" style="background:${yellow}"></span><span class="tl-name">Estradiol</span><span class="tl-badge" style="background:${yellowDim};color:${yellow}">CAUTION</span></div>
      <div class="tl-row"><span class="tl-dot" style="background:${red}"></span><span class="tl-name">Hematocrit</span><span class="tl-badge" style="background:${redDim};color:${red}">HIGH</span></div>
      <div class="tl-row"><span class="tl-dot" style="background:${red}"></span><span class="tl-name">ALT</span><span class="tl-badge" style="background:${redDim};color:${red}">STOP</span></div>
    </div>`,
    score: `<div class="visual score">
      <div class="score-ring" style="border-color:${green}50">
        <span class="score-num" style="color:${green}">84</span>
        <span class="score-label">Health score</span>
      </div>
      <div class="score-bars">
        <div class="sbar"><span>Hormonal</span><div class="bar-track"><div class="bar-fill" style="width:88%;background:${green}"></div></div></div>
        <div class="sbar"><span>Liver</span><div class="bar-track"><div class="bar-fill" style="width:62%;background:${red}"></div></div></div>
        <div class="sbar"><span>CBC</span><div class="bar-track"><div class="bar-fill" style="width:76%;background:${yellow}"></div></div></div>
      </div>
    </div>`,
    categories: `<div class="visual categories">
      ${[
        ["Hormonal", green, 88],
        ["CBC", yellow, 76],
        ["Liver", red, 62],
        ["Lipids", green, 91],
        ["Kidney", green, 85],
        ["Metabolic", green, 80],
      ]
        .map(
          ([name, color, sc]) =>
            `<div class="cat-chip" style="border-color:${color}40"><span>${name}</span><strong style="color:${color}">${sc}</strong></div>`
        )
        .join("")}
    </div>`,
    flags: `<div class="visual flags">
      <div class="flag-card" style="border-color:${red}50;background:${redDim}">
        <div class="flag-top"><span style="color:${red}">Hematocrit</span><span class="flag-sev" style="color:${red}">HIGH</span></div>
        <p>↑ 4.2% above optimal max (+9%)</p>
        <small style="color:${red}">Strict threshold: 52%</small>
      </div>
      <div class="flag-card ok" style="border-color:${green}40;background:${greenDim}">
        <div class="flag-top"><span style="color:${green}">HDL</span><span class="flag-sev" style="color:${green}">NORMAL</span></div>
        <p>In on-cycle target range</p>
      </div>
    </div>`,
    stack: `<div class="visual stack">
      <div class="stack-flag" style="border-color:${red}50">
        <span class="marker" style="color:${red}">HCT 51%</span>
        <span class="link" style="color:${muted}">↔</span>
        <span class="compounds">Test E · EQ</span>
      </div>
      <div class="stack-flag" style="border-color:${yellow}50">
        <span class="marker" style="color:${yellow}">ALT 38</span>
        <span class="link" style="color:${muted}">↔</span>
        <span class="compounds">Anavar</span>
      </div>
    </div>`,
    cross: `<div class="visual cross">
      <div class="cross-node labs" style="border-color:${red};color:${red}">HCT ↑</div>
      <div class="cross-node gear" style="border-color:${red}50">Test E</div>
      <div class="cross-node train" style="border-color:${green}50;color:${green}">Volume OK</div>
      <svg class="cross-lines" viewBox="0 0 280 160"><line x1="140" y1="80" x2="50" y2="35" stroke="${red}50" stroke-width="2"/><line x1="140" y1="80" x2="230" y2="35" stroke="${red}40" stroke-width="2"/><line x1="140" y1="80" x2="140" y2="140" stroke="${green}40" stroke-width="2"/></svg>
    </div>`,
    trend: `<div class="visual trend">
      <svg viewBox="0 0 300 140" class="trend-chart">
        <line x1="20" y1="120" x2="280" y2="120" stroke="#ffffff15" stroke-width="2"/>
        <polyline points="20,100 80,95 140,70 200,55 260,40" fill="none" stroke="${red}" stroke-width="3" stroke-linecap="round"/>
        <polyline points="20,110 80,108 140,100 200,92 260,88" fill="none" stroke="${green}" stroke-width="3" stroke-linecap="round"/>
        <text x="20" y="20" fill="${red}" font-size="12" font-family="sans-serif">HCT</text>
        <text x="20" y="36" fill="${green}" font-size="12" font-family="sans-serif">HDL</text>
      </svg>
    </div>`,
    cta: `<div class="visual cta">
      <div class="cta-panel" style="border-color:${green}50;background:${greenDim}">
        <span style="color:${green}">✓</span>
        <span>Ready to analyse</span>
      </div>
      <div class="cta-glow" style="background:radial-gradient(circle,${green}25,transparent 70%)"></div>
    </div>`,
  };
  return visuals[type] ?? visuals.flow;
}

function slideHtml(slide, index) {
  const bullets = (slide.bullets ?? [])
    .map(
      (b) =>
        `<li><span class="dot" style="background:${THEME.green}"></span>${b}</li>`
    )
    .join("");

  return `<section class="slide" data-index="${index}">
  <div class="ambient"></div>
  <div class="grid-overlay"></div>
  <div class="content">
    <header class="header">
      <div class="brand-mark">
        <span class="logo">R</span>
        <span>Roiders Club</span>
      </div>
      <span class="step-badge">${slide.step}</span>
    </header>
    <div class="copy">
      <h1>${slide.headline}</h1>
      <p class="sub">${slide.sub}</p>
      <p class="body">${slide.body}</p>
      ${bullets ? `<ul class="bullets">${bullets}</ul>` : ""}
      ${slide.footer ? `<p class="footer">${slide.footer}</p>` : ""}
    </div>
    <div class="visual-zone" aria-hidden="true">${visualBlock(slide.visual)}</div>
  </div>
</section>`;
}

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Syne:wght@600;700;800&display=swap" rel="stylesheet"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #111; font-family: 'DM Sans', system-ui, sans-serif; }
  .slide {
    width: ${WIDTH}px; height: ${HEIGHT}px;
    position: relative; overflow: hidden;
    background: ${THEME.bg}; color: ${THEME.fg};
  }
  .ambient {
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 100% 60% at 15% 0%, rgba(52, 211, 153, 0.12), transparent 55%),
      radial-gradient(ellipse 90% 55% at 90% 100%, rgba(255, 46, 74, 0.14), transparent 50%),
      ${THEME.bg};
  }
  .grid-overlay {
    position: absolute; inset: 0; opacity: 0.3;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: ${px(48)}px ${px(48)}px;
    mask-image: radial-gradient(ellipse 80% 65% at 50% 35%, black, transparent);
  }
  .content {
    position: relative; z-index: 1; height: 100%;
    padding: ${SAFE.top}px ${SAFE.right}px ${SAFE.bottom}px ${SAFE.left}px;
    display: flex; flex-direction: column; gap: ${py(28)}px;
  }
  .header { display: flex; align-items: center; justify-content: space-between; gap: ${px(16)}px; flex-shrink: 0; }
  .step-badge {
    font-size: ${px(18)}px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
    padding: ${px(8)}px ${px(16)}px; border-radius: 999px;
    border: 1px solid rgba(52, 211, 153, 0.35); color: ${THEME.green};
    background: ${THEME.greenDim};
  }
  .copy { flex-shrink: 0; display: flex; flex-direction: column; gap: ${py(16)}px; }
  h1 {
    font-family: 'Syne', sans-serif; font-size: ${px(76)}px; font-weight: 800;
    line-height: 0.98; letter-spacing: -0.03em;
    background: linear-gradient(135deg, ${THEME.fg} 30%, ${THEME.green} 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .sub { font-size: ${px(30)}px; font-weight: 600; color: ${THEME.muted}; }
  .body { font-size: ${px(24)}px; line-height: 1.42; color: color-mix(in srgb, ${THEME.fg} 80%, ${THEME.muted}); }
  .bullets { list-style: none; display: flex; flex-direction: column; gap: ${py(10)}px; }
  .bullets li { font-size: ${px(22)}px; display: flex; align-items: center; gap: ${px(10)}px; }
  .dot { width: ${px(8)}px; height: ${px(8)}px; border-radius: 50%; flex-shrink: 0; }
  .footer { font-family: 'Syne', sans-serif; font-size: ${px(30)}px; font-weight: 700; color: ${THEME.green}; }
  .brand-mark { display: flex; align-items: center; gap: ${px(10)}px; font-size: ${px(18)}px; font-weight: 600; color: ${THEME.muted}; }
  .logo {
    width: ${px(36)}px; height: ${px(36)}px; border-radius: ${px(10)}px;
    background: linear-gradient(135deg, ${THEME.red}, #ff6b8a);
    display: grid; place-items: center;
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: ${px(15)}px; color: #fff;
    box-shadow: 0 ${py(4)}px ${px(14)}px rgba(255, 46, 74, 0.28);
  }
  .visual-zone { flex: 0 0 auto; height: ${py(360)}px; display: flex; align-items: center; justify-content: center; }
  .visual { width: 100%; height: 100%; position: relative; display: flex; align-items: center; justify-content: center; }

  .flow { gap: ${px(10)}px; flex-wrap: wrap; }
  .flow-step { padding: ${py(14)}px ${px(22)}px; border-radius: ${px(14)}px; border: 1px solid; font-weight: 700; font-size: ${px(22)}px; background: rgba(255,255,255,0.03); }
  .flow-arrow { font-size: ${px(28)}px; }

  .drop-zone {
    width: ${px(280)}px; padding: ${py(36)}px; border-radius: ${px(18)}px; border: 2px dashed;
    text-align: center; background: rgba(255,255,255,0.03);
  }
  .drop-zone span { display: block; font-size: ${px(26)}px; font-weight: 700; }
  .drop-zone small { color: ${THEME.muted}; font-size: ${px(18)}px; }

  .parse { flex-direction: column; gap: ${py(12)}px; width: 100%; max-width: ${px(420)}px; }
  .parse-row {
    display: flex; align-items: center; gap: ${px(10)}px; padding: ${py(12)}px ${px(14)}px;
    border-radius: ${px(12)}px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
    font-size: ${px(18)}px;
  }
  .lab-name { flex: 1; color: ${THEME.muted}; }
  .val { font-weight: 700; font-family: 'Syne', sans-serif; min-width: ${px(72)}px; text-align: right; }
  .tag { font-size: ${px(13)}px; padding: ${px(4)}px ${px(8)}px; border-radius: 6px; font-weight: 600; }

  .modes { flex-direction: column; gap: ${py(14)}px; width: ${px(300)}px; }
  .mode-card { padding: ${py(18)}px ${px(20)}px; border-radius: ${px(14)}px; border: 1px solid; }
  .mode-label { display: block; font-size: ${px(14)}px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
  .mode-range { font-family: 'Syne', sans-serif; font-size: ${px(24)}px; font-weight: 700; }

  .traffic { flex-direction: column; gap: ${py(10)}px; width: 100%; max-width: ${px(400)}px; }
  .tl-row { display: flex; align-items: center; gap: ${px(12)}px; padding: ${py(10)}px ${px(14)}px; border-radius: ${px(10)}px; background: rgba(255,255,255,0.03); }
  .tl-dot { width: ${px(10)}px; height: ${px(10)}px; border-radius: 50%; flex-shrink: 0; }
  .tl-name { flex: 1; font-size: ${px(20)}px; font-weight: 600; }
  .tl-badge { font-size: ${px(13)}px; font-weight: 700; padding: ${px(4)}px ${px(10)}px; border-radius: 6px; letter-spacing: 0.06em; }

  .score { flex-direction: column; gap: ${py(20)}px; }
  .score-ring {
    width: ${px(120)}px; height: ${px(120)}px; border-radius: 50%; border: 3px solid;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    background: ${THEME.greenDim};
  }
  .score-num { font-family: 'Syne', sans-serif; font-size: ${px(44)}px; font-weight: 800; line-height: 1; }
  .score-label { font-size: ${px(12)}px; color: ${THEME.muted}; margin-top: 4px; }
  .score-bars { width: 100%; max-width: ${px(340)}px; display: flex; flex-direction: column; gap: ${py(10)}px; }
  .sbar { display: flex; align-items: center; gap: ${px(12)}px; font-size: ${px(16)}px; color: ${THEME.muted}; }
  .sbar span { width: ${px(72)}px; }
  .bar-track { flex: 1; height: ${py(8)}px; border-radius: 4px; background: rgba(255,255,255,0.06); overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 4px; }

  .categories { flex-wrap: wrap; gap: ${px(10)}px; max-width: ${px(400)}px; justify-content: center; }
  .cat-chip {
    padding: ${py(10)}px ${px(16)}px; border-radius: ${px(12)}px; border: 1px solid;
    display: flex; align-items: center; gap: ${px(10)}px; font-size: ${px(17)}px;
    background: rgba(255,255,255,0.03);
  }
  .cat-chip strong { font-family: 'Syne', sans-serif; font-size: ${px(20)}px; }

  .flags { flex-direction: column; gap: ${py(12)}px; width: 100%; max-width: ${px(400)}px; }
  .flag-card { padding: ${py(14)}px ${px(16)}px; border-radius: ${px(12)}px; border: 1px solid; font-size: ${px(17)}px; }
  .flag-top { display: flex; justify-content: space-between; font-weight: 700; font-family: 'Syne', sans-serif; margin-bottom: 6px; }
  .flag-sev { font-size: ${px(13)}px; letter-spacing: 0.06em; }
  .flag-card p { color: ${THEME.muted}; line-height: 1.35; }
  .flag-card small { font-size: ${px(14)}px; }

  .stack { flex-direction: column; gap: ${py(14)}px; width: ${px(340)}px; }
  .stack-flag {
    display: flex; align-items: center; gap: ${px(12)}px; padding: ${py(14)}px ${px(18)}px;
    border-radius: ${px(12)}px; border: 1px solid; background: rgba(255,255,255,0.03);
    font-size: ${px(18)}px;
  }
  .marker { font-family: 'Syne', sans-serif; font-weight: 700; }
  .compounds { color: ${THEME.fg}; font-weight: 600; }

  .cross { width: ${px(280)}px; height: ${py(160)}px; position: relative; }
  .cross-node { position: absolute; padding: ${py(8)}px ${px(14)}px; border-radius: 999px; border: 1px solid; font-size: ${px(16)}px; font-weight: 600; background: rgba(255,255,255,0.04); z-index: 1; }
  .cross-node.labs { left: 50%; top: 42%; transform: translate(-50%,-50%); }
  .cross-node.gear { left: 8%; top: 8%; }
  .cross-node.train { left: 50%; bottom: 0; transform: translateX(-50%); }
  .cross-lines { position: absolute; inset: 0; width: 100%; height: 100%; }

  .trend-chart { width: ${px(320)}px; }

  .cta { position: relative; }
  .cta-panel {
    padding: ${py(18)}px ${px(32)}px; border-radius: 999px; border: 1px solid;
    font-size: ${px(22)}px; font-weight: 700; display: flex; align-items: center; gap: ${px(10)}px;
  }
  .cta-glow { position: absolute; width: ${px(240)}px; height: ${px(240)}px; border-radius: 50%; z-index: -1; }
</style>
</head>
<body>
${SLIDES.map((s, i) => slideHtml(s, i)).join("\n")}
</body>
</html>`;

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const htmlPath = join(tmpdir(), "roiders-labs-analysis-render.html");
  await writeFile(htmlPath, HTML, "utf8");

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  });
  await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  for (let i = 0; i < SLIDES.length; i++) {
    const outPath = join(OUT_DIR, SLIDES[i].file);
    await page.locator(`.slide[data-index="${i}"]`).screenshot({ path: outPath, type: "png" });
    console.log(`✓ ${SLIDES[i].file}`);
  }

  await browser.close();
  await unlink(htmlPath).catch(() => {});
  console.log(`\n${SLIDES.length} slides (${WIDTH}×${HEIGHT}) → ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});