import { useEffect } from "react";

/** Cards whose parts gather as they travel up the viewport. */
const SELECTOR = ".project-card, .about-card, .tech-card";

/**
 * Where the assembly starts and finishes, as a fraction of viewport height
 * measured against the card's own top edge. A card entering at the fold is
 * scattered; by the time its top reaches just above the middle it has formed.
 */
const SCATTERED_AT = 0.98;
const FORMED_AT = 0.52;

/**
 * Scroll-scrubbed card assembly.
 *
 * Writes one custom property per card - `--p`, 0 (scattered) to 1 (formed) -
 * and lets CSS do the rest. Scrubbing rather than firing once means scrolling
 * back up takes the cards apart again, which is what makes it read as gathering
 * with the scroll instead of a canned entrance.
 *
 * The resting value lives in CSS as `--p: 1`. That matters: a card parked at 0
 * with no JS to advance it would never appear at all, so the readable state is
 * the one that survives when this hook does not run.
 *
 * DO NOT reintroduce an IntersectionObserver here to cull off-screen cards.
 * It looks like the obvious optimisation and it silently breaks the effect:
 * IO tests an element's TRANSFORMED rect, and a scattered tech card is
 * translated a third of the viewport sideways, so IO correctly reports it as
 * not intersecting. Cull on that and the card is parked at 0, never measured
 * again, and stays stranded off-screen forever - a feedback loop where being
 * scattered is what keeps it scattered. Project and About cards hid the bug,
 * because they transform their children rather than the observed card itself.
 *
 * Reading every card each frame is cheap enough without it, provided the reads
 * and writes stay in separate passes - see measure().
 */
export function useScrollAssembly() {
  useEffect(() => {
    // Respect the OS setting by leaving every card at its CSS resting value.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cards = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
    if (!cards.length) return;

    const tops = new Array<number>(cards.length).fill(0);
    const written = new Array<string>(cards.length).fill("");

    let frame = 0;

    const measure = () => {
      frame = 0;

      const viewportHeight = window.innerHeight;
      const start = viewportHeight * SCATTERED_AT;
      const idealEnd = viewportHeight * FORMED_AT;

      /*
       * How much scroll is left in the document. Subtracting it from a card's
       * current top gives the highest that top will ever reach - and since
       * scrolling decreases both by the same amount, that figure is stable.
       */
      const remaining = Math.max(
        0,
        document.documentElement.scrollHeight -
          viewportHeight -
          window.scrollY,
      );

      // Read pass. Every measurement happens before any style is touched, so
      // the browser flushes layout once rather than once per card - interleave
      // these and thirty-odd cards thrash layout on every frame.
      for (let i = 0; i < cards.length; i++) {
        tops[i] = cards[i].getBoundingClientRect().top;
      }

      // Write pass.
      for (let i = 0; i < cards.length; i++) {
        const top = tops[i];

        /*
         * Cards in the last section can never rise to the ideal formed
         * position: the page bottoms out first. Left alone they stall
         * part-assembled and still translated far to one side, where the
         * section's overflow clip hides them - they read as missing rather
         * than as mid-animation. So the finish line moves up to whatever the
         * card can actually reach.
         */
        const end = Math.max(idealEnd, top - remaining);

        let progress: number;
        if (start <= end) {
          // No usable travel left (a card pinned to the very bottom of the
          // page). Showing it formed is the only correct answer.
          progress = 1;
        } else {
          progress = (start - top) / (start - end);
          if (progress < 0) progress = 0;
          else if (progress > 1) progress = 1;
        }

        // Cards resting off-screen settle on "0.000" or "1.000" and stop being
        // written at all, so the common case costs a comparison.
        const value = progress.toFixed(3);
        if (written[i] !== value) {
          cards[i].style.setProperty("--p", value);
          written[i] = value;
        }
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      for (const card of cards) card.style.removeProperty("--p");
    };
  }, []);
}
