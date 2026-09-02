import { projects } from "../data/projects";
import { Icon } from "./Icon";
import { SectionHeading } from "./SectionHeading";

export function ProjectsSection() {
  return (
    <section id="projects" className="section" aria-label="Projects">
      <SectionHeading>Projects</SectionHeading>

      <div className="projects-grid">
        {projects.map((project) => (
          <article className="project-card" key={project.title}>
            <div className="project-header">
              <div className="project-icon">
                <Icon name={project.icon} />
              </div>
              <span className="project-type">{project.type}</span>
            </div>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            {project.impact && <p className="project-impact">{project.impact}</p>}
            <div className="project-tags">
              {project.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
