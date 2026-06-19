import { getCompoundById } from "@/data/compounds";
import type { CycleCompound } from "@/lib/cycleTypes";
import { COMPOUND_MONITOR_MARKERS } from "@/lib/compoundMonitorMarkers";

const ESTROGEN_CONTROL_TAGS = new Set(["AI", "SERM"]);
const LIVER_SUPPORT_IDS = new Set(["tudca", "nac", "udca"]);

export function hasAromatizer(compounds: CycleCompound[]): boolean {
  return compounds.some((c) => {
    const compound = getCompoundById(c.compoundId);
    return compound?.tags.includes("Test") || compound?.id.startsWith("test-");
  });
}

export function hasEstrogenControl(compounds: CycleCompound[]): boolean {
  return compounds.some((c) => {
    const compound = getCompoundById(c.compoundId);
    if (!compound) return false;
    return (
      compound.category === "estrogen" ||
      compound.tags.some((t) => ESTROGEN_CONTROL_TAGS.has(t))
    );
  });
}

export function has19Nor(compounds: CycleCompound[]): boolean {
  return compounds.some((c) => getCompoundById(c.compoundId)?.tags.includes("19-nor"));
}

export function hasLiverSupport(compounds: CycleCompound[]): boolean {
  return compounds.some((c) => LIVER_SUPPORT_IDS.has(c.compoundId));
}

export function compoundsLinkedToMarker(
  markerId: string,
  compounds: CycleCompound[]
): CycleCompound[] {
  return compounds.filter((c) => {
    const def = getCompoundById(c.compoundId);
    if (!def) return false;

    const hint = COMPOUND_MONITOR_MARKERS[c.compoundId];
    if (hint?.markers.includes(markerId)) return true;

    if (markerId === "prolactin" && def.tags.includes("19-nor")) return true;
    if (
      markerId === "estradiol" &&
      (def.tags.includes("Test") || def.id.startsWith("test-") || def.id === "dbol")
    ) {
      return true;
    }
    if (["alt", "ast", "ggt"].includes(markerId) && def.hepatotoxic) return true;
    if (
      ["hematocrit", "hemoglobin"].includes(markerId) &&
      (def.tags.includes("Test") || def.id === "anadrol" || def.id === "eq")
    ) {
      return true;
    }
    if (
      ["hdl", "ldl", "triglycerides"].includes(markerId) &&
      (def.hepatotoxic || def.id.includes("tren") || def.tags.includes("DHT"))
    ) {
      return true;
    }
    if (markerId === "creatinine" && def.category === "anabolics") return true;

    return false;
  });
}