import { contactLinks } from "../data/contact";
import { profile } from "../data/profile";
import type { Section, Theme } from "../types";
import { Icon, type IconName } from "./Icon";

export const SECTIONS: { id: Section; label: string }[] = [
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "tech", label: "Tech" },
];

const THEME_ICON: Record<Theme, IconName> = {
  dark: "sun",
  light: "moon",
  flashlight: "flashlight",
};

const NEXT_THEME_LABEL: Record<Theme, string> = {
  dark: "light mode",
  light: "flashlight mode",
  flashlight: "dark mode",
};

interface SideRailProps {
  activeSection: Section;
  onNavigate: (section: Section) => void;
  theme: Theme;
  onThemeToggle: () => void;
  onAvatarClick: () => void;
}

/**
 * The sticky half of the split layout: identity and navigation stay put while
 * the content column scrolls past them.
 */
export function SideRail({
  activeSection,
  onNavigate,
  theme,
  onThemeToggle,
  onAvatarClick,
}: SideRailProps) {
  return (
    <header className="rail">
      <div className="rail-top">
        <div className="rail-identity">
          <img
            className="rail-avatar"
            src={profile.avatarUrl}
            alt={`${profile.shortName} profile photo`}
            role="button"
            tabIndex={0}
            onClick={onAvatarClick}
            onKeyDown={(event) => {
              if (event.key === "Enter") onAvatarClick();
            }}
          />
          <button
            className="rail-theme"
            onClick={onThemeToggle}
            aria-label={`Switch to ${NEXT_THEME_LABEL[theme]}`}
          >
            <Icon name={THEME_ICON[theme]} size={18} />
          </button>
        </div>

        <h1 className="rail-name">{profile.name}</h1>
        <h2 className="rail-role">{profile.role}</h2>
        <p className="rail-headline">{profile.headline}</p>
        <p className="rail-tagline">{profile.tagline}</p>

        <nav className="rail-nav" aria-label="Sections">
          <ul>
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <button
                  className={section.id === activeSection ? "active" : undefined}
                  aria-current={section.id === activeSection ? "true" : undefined}
                  onClick={() => onNavigate(section.id)}
                >
                  <span className="rail-nav-rule" aria-hidden="true" />
                  <span className="rail-nav-label">{section.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <ul className="rail-socials">
        {contactLinks.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              aria-label={link.label}
              title={link.label}
              {...(link.external ? { target: "_blank", rel: "noopener" } : {})}
            >
              <Icon name={link.icon} size={22} />
            </a>
          </li>
        ))}
      </ul>
    </header>
  );
}
