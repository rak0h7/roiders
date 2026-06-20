"use client";

import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/markers";
import { cn } from "@/lib/utils";
import { ui } from "@/lib/ui";
import type { MarkerCategory } from "@/lib/types";

export type LabsCategoryFilterValue = "all" | MarkerCategory;

type LabsCategoryFilterProps = {
  value: LabsCategoryFilterValue;
  onChange: (value: LabsCategoryFilterValue) => void;
  counts?: Partial<Record<MarkerCategory, number>>;
};

export function LabsCategoryFilter({ value, onChange, counts }: LabsCategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        type="button"
        onClick={() => onChange("all")}
        className={cn(
          "rounded-full px-3 py-1 text-xs font-medium transition",
          value === "all"
            ? "bg-[var(--labs-dim)] text-[var(--labs)]"
            : "text-[var(--muted)] hover:bg-[var(--bg-hover)]"
        )}
      >
        All
      </button>
      {CATEGORY_ORDER.map((cat) => {
        const count = counts?.[cat];
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition",
              value === cat
                ? "bg-[var(--labs-dim)] text-[var(--labs)]"
                : "text-[var(--muted)] hover:bg-[var(--bg-hover)]"
            )}
          >
            {CATEGORY_LABELS[cat]}
            {count !== undefined && count > 0 ? (
              <span className="ml-1 text-[10px] opacity-70">({count})</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}