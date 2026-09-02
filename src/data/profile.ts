import type { IconName } from "../components/Icon";

/** Everything in the About section. Edit freely — the UI follows this file. */
export const profile = {
  name: "Leinard Artajo",
  shortName: "Lei",
  role: "Mid Software Developer",
  headline: "Full-Stack Systems Specialist",
  location: "Alabel, Sarangani Province, PH",
  avatarUrl: "/avatar.jpg",
  resumeUrl: "/Leinard_Artajo_Resume.pdf",
  tagline:
    "I architect enterprise systems in .NET, Angular, and React — HR platforms, self-service portals, and gamified performance tools used by 1,000+ employees.",
  summary:
    "Results-driven Mid Software Developer with 3+ years in full-stack web and systems development. I specialize in architecting enterprise solutions with ASP.NET Zero and ASP.NET Core MVC/API, applying OOP and SOLID principles across PostgreSQL and MS SQL Server environments.",
  experience: "3+ years",
  specialty:
    "Architecting enterprise systems and tuning the data layer underneath them.",
  education: "BS Information Systems — GenSantos Foundation College, 2023",
  footer: "© 2026 Lei. Built with React.",
};

export interface AboutCard {
  icon: IconName;
  title: string;
  body: string;
}

export const aboutCards: AboutCard[] = [
  {
    icon: "box",
    title: "Enterprise Systems",
    body: "Architected the company-wide HRMS on ASP.NET Zero and Angular — MRF, Recruitment, Employee Data and Plantilla modules serving 1,000+ employees — plus a standalone ESS portal that cut manual HR processing by ~50%.",
  },
  {
    icon: "code",
    title: "Full-Stack Engineering",
    body: "Angular and React on the front end, ASP.NET Core MVC/API and Entity Framework Core behind it. SOLID and OOP applied across multi-tier architectures, reducing legacy technical debt by ~30%.",
  },
  {
    icon: "award",
    title: "Product & Engagement",
    body: "Layered game mechanics onto performance reviews — achievement badges, leaderboard rankings and quest completions — lifting evaluation-cycle engagement by ~40%. Grounded in a design background: 10+ responsive client sites, ~25% higher PageSpeed.",
  },
  {
    icon: "database",
    title: "Data & Performance",
    body: "PostgreSQL and MS SQL Server tuning — optimized complex queries and decoupled MVC code to improve database response times by ~35% without trading away security.",
  },
];
