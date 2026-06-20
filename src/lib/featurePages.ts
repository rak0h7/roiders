export type FeatureSlug = "labs" | "gear" | "training";

export type FeatureSubFeature = {
  title: string;
  description: string;
};

export type FeatureSection = {
  heading: string;
  summary: string;
  subFeatures: FeatureSubFeature[];
};

export type FeaturePage = {
  slug: FeatureSlug;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  highlights: string[];
  sections: FeatureSection[];
  accent: "labs" | "protocol" | "intel";
};

export const FEATURE_PAGES: FeaturePage[] = [
  {
    slug: "labs",
    title: "Bloodwork Tracking for Performance Athletes",
    metaDescription:
      "Track bloodwork trends, upload lab PDFs and screenshots, and get traffic-light analysis flags with baseline and on-cycle range modes in Roiders Club.",
    h1: "Advanced Bloodwork Tracking for Performance Athletes",
    intro:
      "Log markers over time, compare against optimized ranges, and surface review flags before small drift becomes a bigger problem. Labs connects directly to your gear and training context.",
    highlights: [
      "Trend charts for every logged marker",
      "OCR upload for lab PDFs and screenshots",
      "Baseline vs on-cycle range modes",
      "Cross-module flags when labs and protocol align",
    ],
    accent: "labs",
    sections: [
      {
        heading: "Log and visualize every blood panel",
        summary: "Build a longitudinal record of lipids, hormones, liver enzymes, and more.",
        subFeatures: [
          {
            title: "Marker history",
            description: "Chart any logged value across dates with clear deltas and reference context.",
          },
          {
            title: "Category breakdown",
            description: "Group markers by system — metabolic, hormonal, hepatic — for faster review.",
          },
          {
            title: "Export and import",
            description: "Keep your data portable with backup exports you control.",
          },
        ],
      },
      {
        heading: "Traffic-light analysis flags",
        summary: "See what needs attention without reading every number on every panel.",
        subFeatures: [
          {
            title: "Optimized range modes",
            description: "Switch between general baseline ranges and on-cycle optimized thresholds.",
          },
          {
            title: "Review flags",
            description: "Red, amber, and green states highlight markers that moved outside target.",
          },
          {
            title: "Cross-module intelligence",
            description: "Flags surface when labs trends line up with active protocol or training load.",
          },
        ],
      },
      {
        heading: "Fast capture from real lab reports",
        summary: "Skip manual entry when you already have a PDF or phone screenshot.",
        subFeatures: [
          {
            title: "OCR screenshot upload",
            description: "Parse common lab layouts from images and confirm values before saving.",
          },
          {
            title: "Structured logging",
            description: "Attach date, lab source, and notes so panels stay searchable later.",
          },
          {
            title: "Previous bloodwork archive",
            description: "Revisit older panels alongside current analysis in one view.",
          },
        ],
      },
    ],
  },
  {
    slug: "gear",
    title: "Cycle Planning & Compound Reference",
    metaDescription:
      "Plan cycles, simulate PK saturation curves, assess compound risk, and browse 100+ compound guides in the Roiders Club Gear module.",
    h1: "Cycle Planning, Saturation Curves & Compound Risk",
    intro:
      "Model your stack before you pin, see how saturation builds over time, and keep a deep compound reference library beside your live plan.",
    highlights: [
      "Visual cycle builder with compound slots",
      "PK saturation curve simulation",
      "Compound risk scoring",
      "100+ in-app compound guides",
    ],
    accent: "protocol",
    sections: [
      {
        heading: "Build and compare cycle layouts",
        summary: "Sketch protocols with realistic dosing and frequency inputs.",
        subFeatures: [
          {
            title: "Cycle builder",
            description: "Add compounds, set doses, and map injection or oral schedules.",
          },
          {
            title: "Stack overview",
            description: "See total load, overlapping compounds, and support drugs in one dashboard.",
          },
          {
            title: "Simulation view",
            description: "Preview how the plan unfolds week by week before you commit.",
          },
        ],
      },
      {
        heading: "PK saturation and timing insight",
        summary: "Understand when levels accumulate and where steady state likely lands.",
        subFeatures: [
          {
            title: "Saturation curves",
            description: "Visualize buildup and decay based on compound half-life models.",
          },
          {
            title: "Dose timing",
            description: "Compare daily, EOD, and weekly pinning patterns side by side.",
          },
          {
            title: "Front-load modeling",
            description: "See how loading doses change early-week exposure.",
          },
        ],
      },
      {
        heading: "Risk context and compound guides",
        summary: "Pair planning tools with reference material for mechanism, labs, and safety notes.",
        subFeatures: [
          {
            title: "Compound risk flags",
            description: "Highlight overlapping stressors — estrogen load, liver load, lipids, and more.",
          },
          {
            title: "100+ compound profiles",
            description: "Browse injectables, orals, peptides, and support drugs with structured sections.",
          },
          {
            title: "Premium sources list",
            description: "Optional vendor references for users who need sourcing context.",
          },
        ],
      },
    ],
  },
  {
    slug: "training",
    title: "Workout Logging & Progress Analytics",
    metaDescription:
      "Log workouts, build training programs, track PRs and weekly volume, and connect training load with labs and gear in Roiders Club.",
    h1: "Workout Logging & Progress Analytics",
    intro:
      "Record every session with sets, reps, and RPE — then review volume trends, personal records, and program adherence over time.",
    highlights: [
      "Live workout diary with rest timers",
      "Custom programs and routines",
      "PR tracking across lifts",
      "Weekly volume analytics",
    ],
    accent: "protocol",
    sections: [
      {
        heading: "Log workouts as you train",
        summary: "Capture work sets, supersets, and session notes without leaving the gym.",
        subFeatures: [
          {
            title: "Workout diary",
            description: "Add exercises, log sets and reps, and mark set types — warm-up, working, drop.",
          },
          {
            title: "Rest timers",
            description: "Built-in timers between sets so sessions stay on pace.",
          },
          {
            title: "Supersets and circuits",
            description: "Group movements for efficient logging of complex sessions.",
          },
        ],
      },
      {
        heading: "Programs that match how you train",
        summary: "Save templates and run structured blocks instead of rebuilding each week.",
        subFeatures: [
          {
            title: "Routine editor",
            description: "Define exercises, default sets, and progression rules per program.",
          },
          {
            title: "Exercise library",
            description: "Search by muscle group and equipment to build sessions quickly.",
          },
          {
            title: "Session history",
            description: "Reopen past workouts to compare performance on the same movements.",
          },
        ],
      },
      {
        heading: "Progress you can actually see",
        summary: "Turn logged sessions into trends that inform deloads and volume changes.",
        subFeatures: [
          {
            title: "Personal records",
            description: "Surface best sets automatically as you beat previous marks.",
          },
          {
            title: "Weekly volume charts",
            description: "Track total sets and volume by muscle group over time.",
          },
          {
            title: "Cross-module context",
            description: "Training load sits beside labs and gear for a fuller performance picture.",
          },
        ],
      },
    ],
  },
];

const PAGE_BY_SLUG = Object.fromEntries(FEATURE_PAGES.map((page) => [page.slug, page])) as Record<
  FeatureSlug,
  FeaturePage
>;

export const FEATURE_SLUGS = FEATURE_PAGES.map((p) => p.slug);

export function getFeaturePage(slug: string): FeaturePage | undefined {
  return PAGE_BY_SLUG[slug as FeatureSlug];
}

export function isFeatureSlug(slug: string): slug is FeatureSlug {
  return slug in PAGE_BY_SLUG;
}