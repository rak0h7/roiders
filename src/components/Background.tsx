"use client";

import { useEffect, useRef } from "react";
import { useSettings } from "@/context/SettingsContext";

export function Background() {
  const { theme, reducedMotion } = useSettings();
  const ambientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ambientRef.current;
    if (!el || reducedMotion || theme.parallaxStrength === 0) return;

    const strength = theme.parallaxStrength / 100;
    let frame = 0;

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY * strength * 0.08;
        el.style.transform = `translate3d(0, ${y}px, 0)`;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      el.style.transform = "";
    };
  }, [theme.parallaxStrength, reducedMotion]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden bg-[var(--bg-base)]">
      {theme.showAmbientBackground && (
        <div
          ref={ambientRef}
          className="ambient-bg absolute inset-[-12%]"
          style={{ background: "var(--gradient-ambient)" }}
        />
      )}
    </div>
  );
}