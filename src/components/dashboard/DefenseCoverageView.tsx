"use client";

import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";
import { useCycleStore } from "@/store/cycleStore";
import { calculateRiskProfile, dosesPerWeek } from "@/lib/cycleCalculations";
import { getCompoundById } from "@/data/compounds";
import { ui } from "@/lib/ui";

const DEFENDERS: Record<string, string[]> = {
  HEPATIC: ["TUDCA", "NAC", "Lipo GSH"],
  CARDIO: ["Telmisartan", "Nebivolol", "Eplerenone"],
  NEURO: ["Memantine", "Mag Glycinate", "NAC"],
  ENDOCRINE: ["Aromasin", "Caber", "HCG"],
  DERM: ["Finasteride", "NAC"],
  METABOLIC: ["Berberine", "Omega-3", "NAC"],
};

const GAP_RECS: Record<string, string> = {
  HEPATIC: "TUDCA 500–1000 mg/day, NAC 1800 mg/day",
  CARDIO: "Telmisartan 40–80 mg, Nebivolol 5 mg, Omega-3 4 g/day",
  NEURO: "Memantine 10–20 mg, L-Theanine 200 mg",
  ENDOCRINE: "HCG 250–500 iu 2×/wk, AI titrated to E2",
  DERM: "Finasteride 1 mg or Dutasteride 0.5 mg",
  METABOLIC: "Berberine 1500 mg, Omega-3, R-ALA 300 mg",
};

const DEFENDER_AXES: Record<string, string[]> = {
  tudca: ["HEPATIC"],
  nac: ["HEPATIC", "NEURO", "METABOLIC"],
  udca: ["HEPATIC"],
  caber: ["ENDOCRINE"],
  hcg: ["ENDOCRINE"],
  aromasin: ["ENDOCRINE"],
  arimidex: ["ENDOCRINE"],
  nolvadex: ["ENDOCRINE"],
};

function defenseScoreForAxis(axis: string, compounds: ReturnType<typeof useCycleStore.getState>["compounds"]): number {
  let score = 0;
  for (const cc of compounds) {
    const axes = DEFENDER_AXES[cc.compoundId];
    if (!axes?.includes(axis)) continue;
    const compound = getCompoundById(cc.compoundId);
    if (!compound) continue;
    const weekly = cc.doseMg * dosesPerWeek(cc.frequency);
    score += compound.unit === "mg" ? weekly / 100 : weekly / 50;
  }
  return score;
}

export function DefenseCoverageView() {
  const { compounds } = useCycleStore();
  const threats = calculateRiskProfile(compounds);
  const defenders = compounds.filter((c) => DEFENDER_AXES[c.compoundId]);

  const radarData = threats.map((t) => {
    const defRaw = defenseScoreForAxis(t.axis, compounds);
    const defense = Math.min(t.value, Math.round(defRaw * 12));
    return {
      axis: t.axis,
      threat: t.value,
      defense,
    };
  });

  const uncovered = threats.length > 0
    ? Math.round(100 - threats.reduce((s, t, i) => s + (radarData[i].defense / Math.max(t.value, 1)) * 100, 0) / threats.length)
    : 0;

  return (
    <div className="space-y-4">
      <div className={`${ui.card} ${ui.cardPad}`}>
        <h2 className="text-lg font-bold text-green-400">Defense Coverage</h2>
        <p className={`${ui.sectionSub} mb-4`}>Ancillary and support compound coverage vs threat profile</p>

        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-2">
          <div className="h-[17.5rem] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#3f3f46" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: "#71717a", fontSize: 10 }} />
                <Radar dataKey="threat" stroke="#f97316" fill="#f97316" fillOpacity={0.15} name="Threat" />
                <Radar dataKey="defense" stroke="#22c55e" fill="#22c55e" fillOpacity={0.35} name="Defense" />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-full max-w-xs rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-4 text-center">
              <p className="text-3xl font-black leading-none text-[var(--danger)]">{uncovered}%</p>
              <p className="mt-1 text-[10px] font-bold uppercase text-[var(--danger)]">Uncovered</p>
            </div>
            <p className={ui.sectionSub}>{defenders.length} defenders in stack</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {threats.map((t) => {
          const def = radarData.find((r) => r.axis === t.axis);
          const pct = def && t.value > 0 ? Math.round((def.defense / t.value) * 100) : 0;
          return (
            <div key={t.axis} className={`${ui.cardInner} p-3`}>
              <div className={`${ui.rowBetween} mb-1`}>
                <span className="text-sm font-semibold text-white">{t.axis}</span>
                <span className="rounded-full bg-[var(--danger)]/10 px-2 py-0.5 text-[9px] font-bold uppercase text-[var(--danger)]">
                  {pct < 30 ? "Exposed" : pct < 60 ? "Partial" : "Covered"}
                </span>
              </div>
              <div className="mb-1 h-1.5 overflow-hidden rounded-full bg-[var(--bg-hover)]">
                <div className="h-full rounded-full bg-green-500" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-[10px] text-[var(--muted-2)]">Defenders: {DEFENDERS[t.axis]?.join(", ")}</p>
            </div>
          );
        })}
      </div>

      <div className={`${ui.card} ${ui.cardPad}`}>
        <h3 className={`${ui.label} mb-3 text-orange-400`}>Gap Recommendations</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(GAP_RECS).map(([system, rec]) => (
            <p key={system} className="text-[10px] leading-relaxed text-[var(--muted)]">
              <span className="font-bold text-[var(--foreground)]">{system}:</span> {rec}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}