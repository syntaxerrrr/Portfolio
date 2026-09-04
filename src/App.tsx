import { useCallback, useEffect, useRef, useState } from "react";
import { AboutSection } from "./components/AboutSection";
import { Chat } from "./components/Chat";
import { HeroSection } from "./components/HeroSection";
import { ParticleField } from "./components/ParticleField";
import { ProjectsSection } from "./components/ProjectsSection";
import { RoninBackdrop } from "./components/RoninBackdrop";
import { SECTIONS, SideRail } from "./components/SideRail";
import { TechSection } from "./components/TechSection";
import { useScrollAssembly } from "./hooks/useScrollAssembly";
import { useScrollSpy } from "./hooks/useScrollSpy";
import { profile } from "./data/profile";
import type { Section, Theme } from "./types";

const NEXT_THEME: Record<Theme, Theme> = {
  dark: "light",
  light: "flashlight",
  flashlight: "dark",
};

const OFFSCREEN = -9999;
const SECTION_IDS = SECTIONS.map((s) => s.id);

export default function App() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [avatarZoomed, setAvatarZoomed] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);

  const activeSection = useScrollSpy(SECTION_IDS, "about");

  useScrollAssembly();

  const portfolioRef = useRef<HTMLDivElement>(null);
  // Read every animation frame by the particles, so it stays a ref: tracking
  // the cursor in state would re-render the page on every mouse move.
  const pointer = useRef({ x: OFFSCREEN, y: OFFSCREEN });
  const themeRef = useRef(theme);

  const goToSection = useCallback((section: Section) => {
    document
      .getElementById(section)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const toggleChat = useCallback(() => setChatVisible((v) => !v), []);

  useEffect(() => {
    themeRef.current = theme;

    // Mirror the theme onto <html> so body - which paints the page ground and
    // the overscroll area - resolves the same palette tokens.
    const root = document.documentElement;
    root.classList.toggle("light-theme", theme === "light");
    root.classList.toggle("flashlight-theme", theme === "flashlight");
  }, [theme]);

  useEffect(() => {
    let frame = 0;

    /*
     * The backdrop mask repaints a full-viewport image whenever these two
     * props change, so writing them straight from the event would ask for a
     * re-raster faster than the compositor can land frames. A high-polling
     * mouse fires well above 60Hz; coalesce it down to one write per frame.
     */
    const flush = () => {
      frame = 0;
      const el = portfolioRef.current;
      if (!el) return;
      el.style.setProperty("--mouse-x", `${pointer.current.x}px`);
      el.style.setProperty("--mouse-y", `${pointer.current.y}px`);
    };

    const track = (x: number, y: number) => {
      pointer.current = { x, y };
      // Light is the one theme that paints no spotlight, so it needs no write.
      if (themeRef.current === "light") return;
      if (!frame) frame = requestAnimationFrame(flush);
    };

    const onMouseMove = (event: MouseEvent) =>
      track(event.clientX, event.clientY);

    // Touch has no hover, so the reveal follows the finger instead.
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) track(touch.clientX, touch.clientY);
    };

    // Park it offscreen rather than leaving the disc frozen where it exited.
    const onMouseLeave = () => track(OFFSCREEN, OFFSCREEN);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setAvatarZoomed(false);
      setChatVisible(false);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const themeClass = [
    "portfolio",
    theme === "light" && "light-theme",
    theme === "flashlight" && "flashlight-theme",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {/* Eye opening animation overlay */}
      <div className="eye-animation-overlay" />

      <div className={themeClass} ref={portfolioRef}>
        <RoninBackdrop />
        <ParticleField pointer={pointer} />

        <HeroSection />

        <div className="shell">
          <SideRail
            activeSection={activeSection}
            onNavigate={goToSection}
            theme={theme}
            onThemeToggle={() => setTheme((current) => NEXT_THEME[current])}
            onAvatarClick={() => setAvatarZoomed((zoomed) => !zoomed)}
          />

          <main className="content">
            <AboutSection />
            <ProjectsSection />
            <TechSection />

            <footer className="footer">
              <p>{profile.footer}</p>
            </footer>
          </main>
        </div>

        {avatarZoomed && (
          <div className="avatar-overlay" onClick={() => setAvatarZoomed(false)}>
            <img
              className="avatar-zoomed"
              src={profile.avatarUrl}
              alt={`${profile.shortName} profile photo zoomed`}
            />
          </div>
        )}

        <Chat visible={chatVisible} onToggle={toggleChat} onNavigate={goToSection} />
      </div>
    </>
  );
}
