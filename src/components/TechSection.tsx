import { techGroups } from "../data/tech";
import { Icon } from "./Icon";
import { SectionHeading } from "./SectionHeading";

export function TechSection() {
  return (
    <section id="tech" className="section" aria-label="Tech">
      <SectionHeading>Tech</SectionHeading>

      {techGroups.map((group) => (
        <div className="tech-section" key={group.title}>
          <h3 className="tech-category-title">{group.title}</h3>
          <div className="tech-grid">
            {group.items.map((item) => (
              <div className="tech-card" key={item.name}>
                <div className="tech-card-icon">
                  {item.icon ? (
                    <Icon name={item.icon} size={18} round={false} />
                  ) : (
                    item.label
                  )}
                </div>
                <div className="tech-card-info">
                  <strong>{item.name}</strong>
                  <span>{item.caption}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
