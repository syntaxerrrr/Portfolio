/*
 * The two-plate backdrop.
 *
 * A base scene sits behind the whole page, and an armoured alternate of the
 * same pose is revealed through a soft radial mask that tracks the pointer.
 * Both plates are fixed, so the art holds still while the page scrolls past -
 * stretching a single image down a 5000px document would only crop it badly.
 *
 * The mask reads --mouse-x / --mouse-y off .portfolio, the same pair the
 * flashlight theme already uses; App owns writing them.
 *
 * Each plate bakes its own scrim into the background stack rather than sharing
 * one overlay, because the two need *different* scrims: the base has to carry
 * the legibility budget for cream text, while the reveal stays light enough
 * that the glowing frame reads as a genuine second image.
 */
export function RoninBackdrop() {
  return (
    <div className="ronin-backdrop" aria-hidden="true">
      <div className="ronin-layer is-base" />
      <div className="ronin-layer is-reveal" />
    </div>
  );
}
