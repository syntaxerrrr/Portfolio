import { useEffect, useRef, type RefObject } from "react";
import type { Particle } from "../types";

const PARTICLE_COUNT = 16;
const INTERACTION_RADIUS = 100;
const REPEL_FORCE = 2.5;

function createParticle(isReset = false): Particle {
  const size = Math.random() * 5 + 3; // 3px – 8px
  const vy = -(Math.random() * 0.8 + 0.2); // drifts upward
  return {
    id: Math.random(),
    x: Math.random() * window.innerWidth,
    y: isReset ? window.innerHeight + size : Math.random() * window.innerHeight,
    vx: 0,
    vy,
    baseVy: vy,
    size,
    opacity: Math.random() * 0.22 + 0.08,
  };
}

/**
 * Animates the drifting background dots, which scatter away from the cursor.
 *
 * The loop writes `transform` straight onto each node instead of going through
 * state — 30 particles at 60fps would otherwise re-render the page 60 times a
 * second. React paints the initial positions; this hook owns every frame after.
 */
export function useParticles(pointer: RefObject<{ x: number; y: number }>) {
  const particlesRef = useRef<Particle[] | null>(null);
  particlesRef.current ??= Array.from({ length: PARTICLE_COUNT }, () =>
    createParticle(),
  );
  const particles = particlesRef as { current: Particle[] };
  const nodes = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    let frame = requestAnimationFrame(function step() {
      const { x: mouseX, y: mouseY } = pointer.current;

      particles.current = particles.current.map((p, index) => {
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < INTERACTION_RADIUS && dist > 0) {
          const force = (INTERACTION_RADIUS - dist) / INTERACTION_RADIUS;
          p.vx += (dx / dist) * force * REPEL_FORCE;
          p.vy += (dy / dist) * force * REPEL_FORCE;
        }

        p.vx *= 0.95; // friction
        p.vy = p.vy * 0.95 + p.baseVy * 0.05; // ease back to the base drift

        p.x += p.vx;
        p.y += p.vy;

        const offScreen =
          p.y < -p.size || p.x < -p.size || p.x > window.innerWidth + p.size;
        const next = offScreen ? createParticle(true) : p;

        const node = nodes.current[index];
        if (node) {
          node.style.transform = `translate(${next.x}px, ${next.y}px)`;
          if (offScreen) {
            node.style.width = `${next.size}px`;
            node.style.height = `${next.size}px`;
            node.style.opacity = `${next.opacity}`;
          }
        }

        return next;
      });

      frame = requestAnimationFrame(step);
    });

    return () => cancelAnimationFrame(frame);
  }, [pointer]);

  const registerNode = (index: number) => (node: HTMLSpanElement | null) => {
    nodes.current[index] = node;
  };

  return { particles: particles.current, registerNode };
}
