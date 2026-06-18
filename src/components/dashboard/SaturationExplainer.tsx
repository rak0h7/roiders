"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SATURATION_REFERENCE, saturationExplainerSummary } from "@/lib/saturation";
import { AppIcon } from "@/components/ui/AppIcon";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";

function ReferenceTable({
  title,
  rows,
  oralNote,
}: {
  title: string;
  rows: typeof SATURATION_REFERENCE.testEsters;
  oralNote?: string;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-[var(--foreground)]">{title}</p>
      <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border)]">
        <table className="w-full min-w-[28rem] text-left text-[11px]">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--bg-elevated)]/60 text-[var(--muted)]">
              <th className="px-3 py-2 font-medium">Compound</th>
              <th className="px-3 py-2 font-medium">Half-Life</th>
              <th className="px-3 py-2 font-medium">Time to Saturation</th>
              <th className="hidden px-3 py-2 font-medium sm:table-cell">Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.compound} className="border-b border-[var(--border)]/60 last:border-0">
                <td className="px-3 py-2 text-[var(--foreground)]">{row.compound}</td>
                <td className="px-3 py-2 text-[var(--muted)]">{row.halfLife}</td>
                <td className="px-3 py-2 text-[var(--protocol)]">{row.timeToSaturation}</td>
                <td className="hidden px-3 py-2 text-[var(--muted-2)] sm:table-cell">{row.notes ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {oralNote ? <p className="mt-2 text-[11px] leading-relaxed text-[var(--muted)]">{oralNote}</p> : null}
    </div>
  );
}

export function SaturationExplainer() {
  const [open, setOpen] = useState(false);

  return (
    <div className={`${ui.cardIntel} ${ui.cardPad}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <div>
          <p className={ui.overline}>Saturation (Steady State)</p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--foreground)]">{saturationExplainerSummary()}</p>
          <p className="mt-1.5 text-xs text-[var(--muted)]">
            General rule: ~4–5 half-lives to full saturation. Curves below mark when each compound hits that point.
          </p>
        </div>
        <AppIcon
          icon={ChevronDown}
          size="sm"
          className={cn("mt-1 shrink-0 text-[var(--muted)] transition", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div className="mt-4 space-y-5 border-t border-[var(--border)] pt-4">
          <ReferenceTable title="Testosterone Esters" rows={SATURATION_REFERENCE.testEsters} />
          <ReferenceTable title="Other Injectable Steroids" rows={SATURATION_REFERENCE.injectables} />
          <ReferenceTable
            title="Oral Steroids"
            rows={SATURATION_REFERENCE.orals}
            oralNote="Orals saturate fast but also clear quickly — often used as kick-starts or finishers."
          />
          <ReferenceTable title="Other Common Compounds" rows={SATURATION_REFERENCE.other} />
        </div>
      ) : null}
    </div>
  );
}