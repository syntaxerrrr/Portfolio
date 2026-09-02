import type { ReactNode } from "react";

/**
 * Sticky uppercase label shown only on narrow screens. On desktop the rail nav
 * already names the section, so repeating it here would be noise.
 */
export function SectionHeading({ children }: { children: ReactNode }) {
  return <h2 className="section-heading">{children}</h2>;
}
