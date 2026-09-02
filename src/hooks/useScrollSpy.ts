import { useEffect, useState } from "react";
import type { Section } from "../types";

/**
 * Tracks which section is currently in view so the rail nav can highlight it.
 *
 * The observer band sits in the upper third of the viewport: a section counts
 * as "current" once its top reaches roughly where the eye is reading, rather
 * than when it first peeks in at the bottom.
 */
export function useScrollSpy(ids: Section[], fallback: Section): Section {
  const [active, setActive] = useState<Section>(fallback);

  useEffect(() => {
    const visible = new Map<Section, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id as Section;
          if (entry.isIntersecting) visible.set(id, entry.intersectionRatio);
          else visible.delete(id);
        }

        // Whichever tracked section appears first in document order wins, so
        // scrolling up and down both settle on the same answer.
        const current = ids.find((id) => visible.has(id));
        if (current) setActive(current);
      },
      { rootMargin: "-10% 0px -60% 0px", threshold: [0, 0.15, 0.5] },
    );

    for (const id of ids) {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    }

    // The final section can never reach the observer band - the page bottom
    // stops it short - so resolve that case from the scroll position instead.
    const onScroll = () => {
      const atBottom =
        window.innerHeight + Math.ceil(window.scrollY) >=
        document.documentElement.scrollHeight - 2;
      if (atBottom) setActive(ids[ids.length - 1]);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [ids]);

  return active;
}
