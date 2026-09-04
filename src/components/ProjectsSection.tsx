import { projects } from "../data/projects";
import { SectionHeading } from "./SectionHeading";

/**
 * Each card leads with the outcome, because that is the argument. The title
 * names the subject underneath it, the description explains how, and a
 * hairline separates the claim from the machinery that produced it.
 */
export function ProjectsSection() {
  return (
    <section id="projects" className="section" aria-label="Projects">
      <SectionHeading>Projects</SectionHeading>

      <div className="projects-grid">
        {projects.map((project) => (
          <article className="project-card" key={project.title}>
            {project.impact && (
              <p className="project-outcome">{project.impact}</p>
            )}

            <h3>{project.title}</h3>

            <p className="project-desc">{project.description}</p>

            <p className="project-stack">
              {project.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
