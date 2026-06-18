type BackgroundPatternId = "none" | "grid" | "dots" | "scanlines" | "hex";
type FontFamilyId = "dm-sans" | "inter" | "satoshi" | "orbitron" | "syne" | "jetbrains";
type IconStyleId = "outline" | "filled" | "minimal" | "bold";
type ContentWidth = "narrow" | "default" | "wide" | "full";
type LayoutPresetId = "compact" | "spacious" | "dashboard" | "minimal";

interface PresetSurfaces {
  baseColor?: string;
  elevatedColor?: string;
  surfaceColor?: string;
}

interface PresetSettings {
  baseColor?: string;
  elevatedColor?: string;
  surfaceColor?: string;
  gradientIntensity?: number;
  glassBlur?: number;
  glassOpacity?: number;
  shadowDepth?: number;
  fontScale?: number;
  borderGlow?: boolean;
  animatedBackground?: boolean;
  showAmbientBackground?: boolean;
  showTopBarSubtitle?: boolean;
  density?: "comfortable" | "compact";
  radiusScale?: number;
  contentWidth?: ContentWidth;
  fontFamily?: FontFamilyId;
  fontWeight?: number;
  letterSpacing?: number;
  lineHeight?: number;
  iconStyle?: IconStyleId;
  iconSize?: number;
  buttonHoverIntensity?: number;
  pageTransitionSpeed?: number;
  parallaxStrength?: number;
  particleEffects?: boolean;
  backgroundPattern?: BackgroundPatternId;
  gradientAngle?: number;
  layoutPreset?: LayoutPresetId;
}

export interface ThemePresetDefinition {
  id: string;
  name: string;
  description: string;
  primary: string;
  secondary: string;
  tertiary: string;
  surfaces?: PresetSurfaces;
  settings?: PresetSettings;
}

const NEUTRAL_DARK: PresetSurfaces = { baseColor: "#0a0b0e", elevatedColor: "#101218", surfaceColor: "#161920" };
const NEUTRAL_WARM: PresetSurfaces = { baseColor: "#0c0b0a", elevatedColor: "#141210", surfaceColor: "#1a1816" };
const VOID: PresetSurfaces = { baseColor: "#050508", elevatedColor: "#09090f", surfaceColor: "#0e0e16" };
const DEEP: PresetSurfaces = { baseColor: "#06070b", elevatedColor: "#0b0d14", surfaceColor: "#10131c" };
const HALOTESTIN: PresetSurfaces = { baseColor: "#000000", elevatedColor: "#030308", surfaceColor: "#06060f" };

const PLAIN: PresetSettings = {
  gradientIntensity: 12,
  glassBlur: 6,
  glassOpacity: 3,
  shadowDepth: 18,
  borderGlow: false,
  animatedBackground: false,
  particleEffects: false,
  backgroundPattern: "none",
  buttonHoverIntensity: 28,
  parallaxStrength: 0,
  fontFamily: "inter",
  fontWeight: 500,
  radiusScale: 0.92,
};

const MUTED: PresetSettings = {
  gradientIntensity: 28,
  glassBlur: 10,
  glassOpacity: 4,
  shadowDepth: 30,
  borderGlow: false,
  animatedBackground: false,
  particleEffects: false,
  backgroundPattern: "none",
  buttonHoverIntensity: 40,
  parallaxStrength: 12,
  fontFamily: "dm-sans",
};

const BALANCED: PresetSettings = {
  gradientIntensity: 55,
  glassBlur: 14,
  glassOpacity: 5,
  shadowDepth: 48,
  borderGlow: true,
  animatedBackground: true,
  particleEffects: false,
  backgroundPattern: "none",
  buttonHoverIntensity: 58,
  parallaxStrength: 35,
};

const VIVID: PresetSettings = {
  gradientIntensity: 78,
  glassBlur: 20,
  glassOpacity: 7,
  shadowDepth: 68,
  borderGlow: true,
  animatedBackground: true,
  particleEffects: true,
  backgroundPattern: "dots",
  buttonHoverIntensity: 75,
  parallaxStrength: 58,
  pageTransitionSpeed: 62,
};

const INTENSE: PresetSettings = {
  gradientIntensity: 92,
  glassBlur: 26,
  glassOpacity: 9,
  shadowDepth: 82,
  borderGlow: true,
  animatedBackground: true,
  particleEffects: true,
  backgroundPattern: "grid",
  buttonHoverIntensity: 88,
  parallaxStrength: 75,
  pageTransitionSpeed: 72,
  fontFamily: "syne",
  fontWeight: 700,
};

const WILD: PresetSettings = {
  gradientIntensity: 100,
  glassBlur: 30,
  glassOpacity: 12,
  shadowDepth: 95,
  borderGlow: true,
  animatedBackground: true,
  particleEffects: true,
  backgroundPattern: "scanlines",
  buttonHoverIntensity: 100,
  parallaxStrength: 95,
  pageTransitionSpeed: 85,
  fontFamily: "orbitron",
  fontWeight: 700,
  letterSpacing: 4,
  gradientAngle: 160,
};

const CHAOS: PresetSettings = {
  ...WILD,
  backgroundPattern: "hex",
  fontFamily: "orbitron",
  iconStyle: "bold",
  gradientAngle: 225,
  parallaxStrength: 100,
};

function p(
  id: string,
  name: string,
  description: string,
  primary: string,
  secondary: string,
  tertiary: string,
  extra?: Pick<ThemePresetDefinition, "surfaces" | "settings">,
): ThemePresetDefinition {
  return { id, name, description, primary, secondary, tertiary, ...extra };
}

/** Ordered plain → balanced → vivid → wild. Display order matches array order. */
export const THEME_PRESET_DEFINITIONS = [
  p("graphite", "Graphite", "Neutral steel — almost no glow", "#94a3b8", "#cbd5e1", "#64748b", { surfaces: NEUTRAL_DARK, settings: PLAIN }),
  p("slate", "Slate", "Cool gray workspace", "#64748b", "#94a3b8", "#475569", { surfaces: NEUTRAL_DARK, settings: PLAIN }),
  p("charcoal", "Charcoal", "Matte dark with whisper accents", "#6b7280", "#9ca3af", "#4b5563", { surfaces: NEUTRAL_DARK, settings: PLAIN }),
  p("stone", "Stone", "Warm concrete tones", "#a8a29e", "#d6d3d1", "#78716c", { surfaces: NEUTRAL_WARM, settings: PLAIN }),
  p("ash", "Ash", "Soft monochrome haze", "#9ca3af", "#d1d5db", "#6b7280", { surfaces: NEUTRAL_DARK, settings: PLAIN }),
  p("ink", "Ink", "Near-black with blue-gray hints", "#64748b", "#475569", "#334155", { surfaces: VOID, settings: PLAIN }),
  p("bone", "Bone", "Warm off-white accents on dark", "#e7e5e4", "#d6d3d1", "#a8a29e", { surfaces: NEUTRAL_WARM, settings: PLAIN }),
  p("pearl", "Pearl", "Delicate silver shimmer", "#e2e8f0", "#f1f5f9", "#cbd5e1", { surfaces: NEUTRAL_DARK, settings: PLAIN }),
  p("mist", "Mist", "Foggy blue-gray calm", "#94a3b8", "#bfdbfe", "#64748b", { surfaces: DEEP, settings: MUTED }),
  p("frost-plain", "Frost Plain", "Icy minimal — no effects", "#bae6fd", "#e0f2fe", "#7dd3fc", { surfaces: DEEP, settings: MUTED }),

  p("crimson", "Crimson", "Bold red with soft rose gradients", "#ff2e4a", "#ff6b8a", "#c084fc", { settings: BALANCED }),
  p("ember", "Ember", "Warm orange and amber fire", "#f97316", "#fb923c", "#fbbf24", { settings: BALANCED }),
  p("violet", "Violet Night", "Deep purple neon accents", "#a855f7", "#c084fc", "#818cf8", { settings: BALANCED }),
  p("ocean", "Ocean", "Cool cyan and teal currents", "#06b6d4", "#22d3ee", "#34d399", { settings: BALANCED }),
  p("rose-gold", "Rose Gold", "Luxury rose with gold highlights", "#e11d48", "#fda4af", "#fbbf24", { settings: BALANCED }),
  p("matrix", "Matrix", "Electric green cyber tones", "#22c55e", "#4ade80", "#06b6d4", { settings: VIVID }),

  p("sage", "Sage", "Muted herbal green", "#84cc16", "#a3e635", "#65a30d", { settings: MUTED }),
  p("mint", "Mint", "Fresh aqua pastel pop", "#2dd4bf", "#5eead4", "#34d399", { settings: MUTED }),
  p("lavender", "Lavender", "Soft purple dusk", "#a78bfa", "#c4b5fd", "#8b5cf6", { settings: MUTED }),
  p("copper", "Copper", "Burnished metal warmth", "#b45309", "#d97706", "#f59e0b", { settings: BALANCED }),
  p("gold", "Gold", "Rich amber highlights", "#ca8a04", "#eab308", "#facc15", { settings: BALANCED }),
  p("coral", "Coral", "Tropical pink-orange", "#f43f5e", "#fb7185", "#fb923c", { settings: BALANCED }),
  p("berry", "Berry", "Deep magenta fruit", "#db2777", "#ec4899", "#be185d", { settings: BALANCED }),
  p("teal", "Teal", "Balanced blue-green", "#14b8a6", "#2dd4bf", "#0d9488", { settings: BALANCED }),
  p("indigo", "Indigo", "Royal blue depth", "#4f46e5", "#6366f1", "#818cf8", { settings: BALANCED }),
  p("sunset", "Sunset", "Dusk orange to violet", "#f97316", "#ec4899", "#8b5cf6", { settings: VIVID }),
  p("aurora", "Aurora", "Northern lights blend", "#22d3ee", "#a78bfa", "#34d399", { settings: VIVID }),
  p("wine", "Wine", "Dark burgundy velvet", "#9f1239", "#be123c", "#881337", { surfaces: VOID, settings: BALANCED }),
  p("midnight", "Midnight", "Deep navy with cobalt", "#1e3a8a", "#3b82f6", "#1d4ed8", { surfaces: VOID, settings: BALANCED }),
  p("jungle", "Jungle", "Lush emerald canopy", "#15803d", "#22c55e", "#166534", { settings: VIVID }),
  p("honey", "Honey", "Golden syrup glow", "#f59e0b", "#fbbf24", "#fcd34d", { settings: VIVID }),

  p("arctic-frost", "Arctic Frost", "Icy blue & platinum shimmer", "#38bdf8", "#a5f3fc", "#e0f2fe", { settings: VIVID }),
  p("solar-flare", "Solar Flare", "Blazing gold & coral eruption", "#ff4500", "#ff8c00", "#ffd700", { settings: INTENSE }),
  p("deep-void", "Deep Void", "Ultraviolet abyss & indigo bloom", "#6366f1", "#8b5cf6", "#312e81", { surfaces: VOID, settings: INTENSE }),
  p(
    "halotestin",
    "Halotestin",
    "Pure black with deep cobalt voltage",
    "#1e3a8a",
    "#1e40af",
    "#172554",
    {
      surfaces: HALOTESTIN,
      settings: {
        ...INTENSE,
        gradientIntensity: 38,
        glassBlur: 12,
        glassOpacity: 4,
        shadowDepth: 70,
        borderGlow: true,
        animatedBackground: true,
        particleEffects: false,
        backgroundPattern: "none",
        buttonHoverIntensity: 72,
        parallaxStrength: 40,
        fontFamily: "syne",
        fontWeight: 700,
        gradientAngle: 200,
      },
    },
  ),
  p("blood-moon", "Blood Moon", "Crimson eclipse intensity", "#dc2626", "#991b1b", "#7f1d1d", { surfaces: VOID, settings: INTENSE }),
  p("toxic", "Toxic", "Acid green radiation", "#84cc16", "#a3e635", "#22c55e", { settings: INTENSE, surfaces: { baseColor: "#050a04", elevatedColor: "#0a1408", surfaceColor: "#0f1a0c" } }),
  p("cyberpunk-neon", "Cyberpunk Neon", "Magenta pulse & cyan voltage", "#ff00ff", "#00ffff", "#7c3aed", { settings: WILD }),
  p("vaporwave", "Vaporwave", "Pink sunset & purple haze", "#ff71ce", "#b967ff", "#01cdfe", { settings: { ...WILD, gradientAngle: 120 } }),
  p("synthwave", "Synthwave", "Retro grid sunset", "#ff6ec7", "#ff9a3c", "#7b2ff7", { settings: WILD, surfaces: { baseColor: "#0d0221", elevatedColor: "#150433", surfaceColor: "#1a0540" } }),
  p("inferno", "Inferno", "Molten core heat", "#ff2200", "#ff6600", "#ffaa00", { settings: WILD }),
  p("plasma", "Plasma", "Electric violet discharge", "#c026d3", "#e879f9", "#7c3aed", { settings: WILD }),
  p("hologram", "Hologram", "Iridescent chrome shift", "#67e8f9", "#c084fc", "#f0abfc", { settings: { ...WILD, backgroundPattern: "hex" } }),
  p("laser", "Laser", "Sharp red beam cut", "#ff0040", "#ff4d6d", "#ff758f", { settings: WILD }),
  p("radioactive", "Radioactive", "Nuclear lime pulse", "#ccff00", "#39ff14", "#00ff88", { surfaces: { baseColor: "#030a00", elevatedColor: "#061200", surfaceColor: "#0a1a00" }, settings: CHAOS }),
  p("supernova", "Supernova", "White-hot stellar burst", "#fff7ed", "#fbbf24", "#f97316", { settings: CHAOS }),
  p("neon-noir", "Neon Noir", "Rain-slick pink & teal", "#ff2a6d", "#05d9e8", "#d1f7ff", { surfaces: VOID, settings: CHAOS }),
  p("electric-dream", "Electric Dream", "Hyper-saturated candy voltage", "#00f5ff", "#ff00e5", "#ffe600", { settings: CHAOS }),
  p("abyss", "Abyss", "Bottomless ultraviolet trench", "#4c1d95", "#6d28d9", "#1e1b4b", { surfaces: VOID, settings: CHAOS }),
  p("glitch", "Glitch", "Broken signal chromatic tear", "#00ff41", "#ff0080", "#00d4ff", { settings: { ...CHAOS, backgroundPattern: "scanlines", fontFamily: "jetbrains" } }),
  p("chaos", "Chaos", "Maximum everything — go wild", "#ff0080", "#00ffcc", "#ffe600", { settings: CHAOS }),
] as const satisfies readonly ThemePresetDefinition[];

export const THEME_PRESETS = THEME_PRESET_DEFINITIONS;