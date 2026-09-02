import { aboutCards, profile } from "../data/profile";
import { Icon } from "./Icon";
import { SectionHeading } from "./SectionHeading";

export function AboutSection() {
  return (
    <section id="about" className="section" aria-label="About">
      <SectionHeading>About</SectionHeading>

      <p className="section-lede">{profile.summary}</p>

      <div className="about-grid">
        {aboutCards.map((card) => (
          <div className="about-card" key={card.title}>
            <div className="about-card-icon">
              <Icon name={card.icon} />
            </div>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </div>
        ))}
      </div>

      <dl className="about-facts">
        <div>
          <dt>Education</dt>
          <dd>{profile.education}</dd>
        </div>
        <div>
          <dt>Based in</dt>
          <dd>{profile.location}</dd>
        </div>
      </dl>

      <a
        className="resume-link"
        href={profile.resumeUrl}
        target="_blank"
        rel="noopener"
      >
        View Full Resume
        <Icon name="arrowUpRight" size={16} className="resume-link-arrow" />
      </a>
    </section>
  );
}
