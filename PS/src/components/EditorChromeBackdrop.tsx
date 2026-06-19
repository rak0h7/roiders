"use client";

/** Static editor shell backdrop — independent of per-project canvas theme. */
export function EditorChromeBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden bg-[#07080c]">
      <div
        className="absolute inset-[-12%] opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(255, 46, 74, 0.12), transparent 55%), radial-gradient(ellipse 70% 50% at 85% 80%, rgba(192, 132, 252, 0.08), transparent 50%)",
        }}
      />
    </div>
  );
}