import {
  COMPOUND_PROFILES,
  getProfileById,
  listConceptProfiles,
  listGuideProfilesByCategory,
  listInjectableProfiles,
  listOralProfiles,
} from "@/data/compoundProfiles";
import type { CompoundCategory } from "@/data/compounds";
import type { CompoundProfile, ProfileBlock, ProfileRoute } from "@/lib/compoundProfileTypes";

export type GuideSectionId =
  | "concepts"
  | "injectables"
  | "orals"
  | "estrogen"
  | "peptides"
  | "fat-loss"
  | "cognitive"
  | "hair"
  | "support";

export interface GuideSectionDef {
  id: GuideSectionId;
  title: string;
  description: string;
  icon: string;
  getProfiles: () => CompoundProfile[];
}

export interface GuideListEntry {
  profile: CompoundProfile;
  sectionId: GuideSectionId;
  sectionTitle: string;
}

const PROFILE_TITLES = [...COMPOUND_PROFILES.map((p) => p.title)].sort((a, b) => b.length - a.length);

export const GUIDE_SECTIONS: GuideSectionDef[] = [
  {
    id: "concepts",
    title: "Core concepts",
    description: "Foundational classification and how compounds relate.",
    icon: "📚",
    getProfiles: listConceptProfiles,
  },
  {
    id: "injectables",
    title: "Anabolic injectables",
    description: "Classic injectable AAS profiles and bloodwork notes.",
    icon: "💉",
    getProfiles: listInjectableProfiles,
  },
  {
    id: "orals",
    title: "Anabolic orals",
    description: "Oral AAS — potency, liver load, and typical ranges.",
    icon: "💊",
    getProfiles: listOralProfiles,
  },
  {
    id: "estrogen",
    title: "Estrogen control & SERMs",
    description: "AIs, SERMs, and prolactin control for cycle support.",
    icon: "⭐",
    getProfiles: () => listGuideProfilesByCategory("estrogen"),
  },
  {
    id: "peptides",
    title: "Peptides & GH",
    description: "Healing peptides, GH secretagogues, and related agents.",
    icon: "🧪",
    getProfiles: () => listGuideProfilesByCategory("peptides"),
  },
  {
    id: "fat-loss",
    title: "Fat loss & metabolic",
    description: "GLP agonists, thermogenics, and metabolic enhancers.",
    icon: "🔥",
    getProfiles: () => listGuideProfilesByCategory("fat-loss"),
  },
  {
    id: "cognitive",
    title: "Cognitive & nootropics",
    description: "Focus, neuroprotection, and mood-adjacent compounds.",
    icon: "🧠",
    getProfiles: () => listGuideProfilesByCategory("cognitive"),
  },
  {
    id: "hair",
    title: "Hair & topicals",
    description: "Hair loss prevention, regrowth, and topical blends.",
    icon: "💇",
    getProfiles: () => listGuideProfilesByCategory("hair"),
  },
  {
    id: "support",
    title: "Support & ancillaries",
    description: "Organ support, blends, and cycle adjuncts.",
    icon: "🛡️",
    getProfiles: () => listGuideProfilesByCategory("support"),
  },
];

const SECTION_BY_ID = Object.fromEntries(GUIDE_SECTIONS.map((s) => [s.id, s])) as Record<
  GuideSectionId,
  GuideSectionDef
>;

export function sortProfiles(profiles: CompoundProfile[]): CompoundProfile[] {
  return [...profiles].sort((a, b) => a.title.localeCompare(b.title));
}

export function getGuideSection(sectionId: GuideSectionId): GuideSectionDef {
  return SECTION_BY_ID[sectionId];
}

export function buildGuideCatalog(): GuideListEntry[] {
  const entries: GuideListEntry[] = [];
  for (const section of GUIDE_SECTIONS) {
    for (const profile of sortProfiles(section.getProfiles())) {
      entries.push({
        profile: sanitizeProfile(profile),
        sectionId: section.id,
        sectionTitle: section.title,
      });
    }
  }
  return entries;
}

export function getDisplayProfileById(id: string): CompoundProfile | undefined {
  const profile = getProfileById(id);
  return profile ? sanitizeProfile(profile) : undefined;
}

export function getDisplayProfileForCompound(compoundId: string): CompoundProfile | undefined {
  const profile = COMPOUND_PROFILES.find((p) => p.compoundIds.includes(compoundId));
  return profile ? sanitizeProfile(profile) : undefined;
}

export function findGuideSectionForProfile(profileId: string): GuideSectionId | undefined {
  for (const section of GUIDE_SECTIONS) {
    if (section.getProfiles().some((p) => p.id === profileId)) return section.id;
  }
  return undefined;
}

export function matchesGuideQuery(profile: CompoundProfile, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    profile.title,
    profile.tagline ?? "",
    ...(profile.aliases ?? []),
    ...profile.compoundIds,
    ...flattenBlockText(profile.sections),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export function filterGuideEntries(
  entries: GuideListEntry[],
  query: string,
  sectionId: GuideSectionId | "all"
): GuideListEntry[] {
  return entries.filter((entry) => {
    const matchesSection = sectionId === "all" || entry.sectionId === sectionId;
    return matchesSection && matchesGuideQuery(entry.profile, query);
  });
}

export function sanitizeProfile(profile: CompoundProfile): CompoundProfile {
  return {
    ...profile,
    tagline: resolveTagline(profile),
    sections: profile.sections.map(sanitizeBlock),
  };
}

function sanitizeBlock(block: ProfileBlock): ProfileBlock {
  return {
    ...block,
    heading: block.heading ? cleanText(block.heading) : undefined,
    body: block.body ? cleanBody(block.body, block.heading) : undefined,
    list: block.list?.map((item) => cleanBody(item)),
    blocks: block.blocks?.map(sanitizeBlock),
  };
}

function resolveTagline(profile: CompoundProfile): string | undefined {
  const raw = profile.tagline?.trim();
  if (!raw) return undefined;
  if (!raw.endsWith("…")) return cleanText(raw);

  const primaryUses = findBlockBody(profile.sections, "Primary Uses");
  if (primaryUses) return truncateAtWord(cleanText(primaryUses), 160);

  const mechanism = findBlockBody(profile.sections, "Mechanism of Action");
  if (mechanism) return truncateAtWord(cleanText(mechanism), 160);

  return cleanText(raw.replace(/…$/, ""));
}

function findBlockBody(blocks: ProfileBlock[], heading: string): string | undefined {
  for (const block of blocks) {
    if (block.heading === heading && block.body) return block.body;
    if (block.blocks) {
      const nested = findBlockBody(block.blocks, heading);
      if (nested) return nested;
    }
  }
  return undefined;
}

export function cleanText(text: string): string {
  return text.replace(/^:\s*/, "").replace(/\s+/g, " ").trim();
}

function cleanBody(text: string, heading?: string): string {
  let result = cleanText(text);
  result = stripTrailingArtifacts(result);
  if (heading?.toLowerCase().includes("side effect")) {
    result = stripMidSentenceConcatenation(result);
  }
  return result;
}

function stripTrailingArtifacts(text: string): string {
  let result = text.trim();

  for (const title of PROFILE_TITLES) {
    if (result.endsWith(title)) {
      result = result.slice(0, -title.length).trimEnd();
      break;
    }
  }

  result = result.replace(/\s*\/\s*$/, "").trim();

  const lastPeriod = result.lastIndexOf(".");
  if (lastPeriod >= 0 && lastPeriod < result.length - 1) {
    const tail = result.slice(lastPeriod + 1).trim();
    const matchedTitle = PROFILE_TITLES.find(
      (title) => tail === title || title.startsWith(tail) || tail.startsWith(title)
    );
    if (matchedTitle) {
      result = result.slice(0, lastPeriod + 1).trim();
    }
  }

  const categoryArtifacts = [
    "Weight Loss Peptides (GLP-1 & Multi-Agonists)",
    "Skin, Hair & Anti-Aging (Topicals & Systemics)",
    "ProGlow (Topical Skin Blend)",
    "ProViper (Topical DHT/Estrogen Modulating Blend)",
  ];
  for (const artifact of categoryArtifacts) {
    if (result.endsWith(artifact)) {
      result = result.slice(0, -artifact.length).trimEnd();
      result = result.replace(/\.\s*$/, ".").trim();
    }
  }

  return result;
}

function stripMidSentenceConcatenation(text: string): string {
  const splitMarkers = [
    " Tesamorelin /",
    " PEG-MGF (Pegylated Mechano Growth Factor)",
    " Des is literally",
  ];
  for (const marker of splitMarkers) {
    const idx = text.indexOf(marker);
    if (idx > 40) return text.slice(0, idx).trimEnd().replace(/\.\s*$/, ".");
  }
  return text;
}

function truncateAtWord(text: string, max: number): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return `${(lastSpace > 60 ? slice.slice(0, lastSpace) : slice).trim()}…`;
}

function flattenBlockText(blocks: ProfileBlock[]): string[] {
  const parts: string[] = [];
  for (const block of blocks) {
    if (block.heading) parts.push(block.heading);
    if (block.body) parts.push(block.body);
    if (block.list) parts.push(...block.list);
    if (block.blocks) parts.push(...flattenBlockText(block.blocks));
  }
  return parts;
}

export type GuideSectionKind =
  | "mechanism"
  | "uses"
  | "dosage"
  | "safety"
  | "labs"
  | "context"
  | "general";

export function classifySectionHeading(heading: string): GuideSectionKind {
  const h = heading.toLowerCase();
  if (h.includes("mechanism") || h.includes("receptor") || h.includes("aromatization") || h.includes("5-alpha")) {
    return "mechanism";
  }
  if (h.includes("primary uses") || h.includes("odd") || h.includes("unique")) return "uses";
  if (h.includes("dosage")) return "dosage";
  if (h.includes("safety") || h.includes("side effect") || h.includes("opinion")) return "safety";
  if (h.includes("blood marker")) return "labs";
  if (h.includes("aas context")) return "context";
  return "general";
}

export function slugifyHeading(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const ROUTE_LABEL: Record<ProfileRoute, string> = {
  injectable: "Injectable",
  oral: "Oral",
  topical: "Topical",
  concept: "Core concept",
};

export const SECTION_KIND_LABEL: Record<GuideSectionKind, string> = {
  mechanism: "Mechanism",
  uses: "Uses",
  dosage: "Dosage",
  safety: "Safety",
  labs: "Bloodwork",
  context: "AAS context",
  general: "Overview",
};

export function categoryForSection(sectionId: GuideSectionId): CompoundCategory | "concept" {
  if (sectionId === "concepts") return "concept";
  if (sectionId === "injectables" || sectionId === "orals") return "anabolics";
  return sectionId;
}