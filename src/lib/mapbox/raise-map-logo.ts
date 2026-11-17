"use client";

import { useEffect, type RefObject } from "react";

/** Lift the Mapbox logo above a bottom sheet on a phone. */
export function useRaiseMapLogo(
  active: boolean,
  ref: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const node = ref.current;
    if (!active || !node) return;

    const apply = () => {
      const top = node.getBoundingClientRect().top;
      const lift = Math.max(0, Math.ceil(window.innerHeight - top + 8));
      document.documentElement.style.setProperty("--map-logo-lift", `${lift}px`);
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(node);
    window.addEventListener("resize", apply);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", apply);
      document.documentElement.style.setProperty("--map-logo-lift", "0px");
    };
  }, [active, ref]);
}
