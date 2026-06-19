"use client";

import { forwardRef, useEffect, useRef } from "react";
import { useSettings } from "@/context/SettingsContext";
import { applyThemeToElement } from "@/lib/themes";
import { cn } from "@/lib/utils";

type CanvasThemeScopeProps = React.HTMLAttributes<HTMLDivElement>;

/** Applies project theme variables only inside the canvas artboard — not the editor chrome. */
export const CanvasThemeScope = forwardRef<HTMLDivElement, CanvasThemeScopeProps>(
  function CanvasThemeScope({ className, style, children, ...rest }, ref) {
    const { theme } = useSettings();
    const innerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      applyThemeToElement(el, theme);
    }, [theme]);

    const setRef = (node: HTMLDivElement | null) => {
      innerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    return (
      <div ref={setRef} className={cn("relative", className)} style={style} {...rest}>
        {children}
      </div>
    );
  },
);