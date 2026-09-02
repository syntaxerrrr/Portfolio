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
