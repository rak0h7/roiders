# TikTok / social assets — Roiders Club

**Dimensions:** Primary slides are **1080×1920** (9:16). Profile thumb is **1080×1080** (1:1).

**Safe zone:** All copy sits in the **top ~60%** with **400px** bottom margin and **148px** right margin so TikTok captions, username, and action buttons don’t cover text.

## Branded slides (PNG)

| File | Hook / use |
|------|------------|
| `01-brand-intro.png` | Brand intro, pinned video cover |
| `02-labs.png` | Labs / bloodwork tracking |
| `03-gear.png` | Cycle planner & stack |
| `04-training.png` | Workout log & programs |
| `05-nutrition.png` | Macros & food diary |
| `06-cross-intelligence.png` | Cross-module alerts |
| `07-lab-upload-ocr.png` | Screenshot OCR upload feature |
| `08-saturation-curves.png` | PK / steady-state education |
| `09-compound-guides.png` | Compound guide library |
| `10-free-forever.png` | Free tier / pricing |
| `11-premium-sync.png` | Premium cloud sync |
| `12-cta-follow.png` | Link-in-bio CTA |

## Backgrounds & profile

| File | Use |
|------|-----|
| `13-bg-ambient-red.png` | B-roll / text overlay backdrop |
| `14-bg-ambient-purple.png` | B-roll / text overlay backdrop |
| `profile-avatar.png` | TikTok profile pic (1080×1080, matches sidebar R tile) |
| `profile-avatar-2048.png` | High-res export |
| `profile-avatar-1024.png` | Standard high-res export |
| `profile-avatar-512.png` | Medium avatar export |
| `profile-avatar-180.png` | Small avatar / favicon-scale |

## Regenerate

```bash
npm run assets:tiktok
npm run assets:avatar
```

Edits to copy or layout: change `SLIDES` in `scripts/generate-tiktok-assets.mjs`, then re-run.

## TikTok tips

- Post slides as a **photo carousel** or stitch into a 6–15s video with screen recordings.
- Slides already reserve the bottom caption strip — add your TikTok caption freely.
- CTA slide (`12`) + brand intro (`01`) work well as pinned content.