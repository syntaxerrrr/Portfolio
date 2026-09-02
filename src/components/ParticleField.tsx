import { type RefObject } from "react";
import { useParticles } from "../hooks/useParticles";

export function ParticleField({
  pointer,
}: {
  pointer: RefObject<{ x: number; y: number }>;
}) {
  const { particles, registerNode } = useParticles(pointer);

  return (
    <div className="global-particles" aria-hidden="true">
      {particles.map((p, index) => (
        <span
          key={p.id}
          ref={registerNode(index)}
          className="particle"
          style={{
            transform: `translate(${p.x}px, ${p.y}px)`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}
