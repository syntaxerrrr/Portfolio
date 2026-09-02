export type Section = "about" | "projects" | "tech";

export type Theme = "dark" | "light" | "flashlight";

export interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVy: number;
  size: number;
  opacity: number;
}

/**
 * Every icon the site can render. Declared here rather than derived from
 * `Icon.tsx` so the data modules never reach into a `.tsx` file — the
 * serverless function imports those modules, and pulling JSX into a Node
 * bundle breaks it. `Icon.tsx` asserts its map covers this union.
 */
export type IconName =
  | "user"
  | "monitor"
  | "code"
  | "mail"
  | "sun"
  | "moon"
  | "flashlight"
  | "server"
  | "settings"
  | "layers"
  | "externalLink"
  | "arrowUpRight"
  | "award"
  | "box"
  | "database"
  | "git"
  | "linkedin"
  | "github"
  | "smile"
  | "chatBubble"
  | "close"
  | "send"
  | "blocked";
