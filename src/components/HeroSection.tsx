import { profile } from "../data/profile";

/**
 * The opening screen: the page's h1, full-bleed above the shell, so the claim
 * lands before the rail and the sections begin.
 *
 * It deliberately carries no backdrop plates of its own. The fixed pair behind
 * the whole document already shows through here, which keeps one cursor reveal
 * running across every section instead of stranding the effect up top.
 *
 * The type sits left because that is where both plates are empty gradient -
 * the figure occupies the right, and setting a headline over it would fight
 * the art and the scrim at once.
 *
 * Identity lives in the rail below, not here: the claim opens the page alone.
 */
export function HeroSection() {
  return (
    <section className="hero-intro" aria-label="Introduction">
      <div className="hero-intro-inner">
        <h1 className="hero-claim">{profile.heroClaim}</h1>

        <p className="hero-sub">{profile.heroSub}</p>
      </div>
    </section>
  );
}
