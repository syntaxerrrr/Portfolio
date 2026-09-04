import type { IconName } from "../types";

export interface Project {
  icon: IconName;
  type: string;
  title: string;
  description: string;
  /** The measurable result. Rendered as the highlighted line on the card. */
  impact?: string;
  tags: string[];
}

/** Add a project by appending an entry here. */
export const projects: Project[] = [
  {
    icon: "layers",
    type: "Enterprise Platform",
    title: "HRMS Platform",
    description:
      "The core company-wide Human Resource Management System, built on ASP.NET Zero with an Angular front end. Four critical modules — MRF, Recruitment, Employee Data and Plantilla — running on MS SQL Server.",
    impact: "Streamlined HR operations for 1,000+ employees",
    tags: ["ASP.NET Zero", "Angular", "MS SQL Server", "SSMS"],
  },
  {
    icon: "user",
    type: "Web Platform",
    title: "Employee Self-Service (ESS) Portal",
    description:
      "A standalone portal that automates staff leave processing, profile management and timekeeping, so employees handle their own records instead of routing everything through HR.",
    impact: "Cut manual processing time by ~50%",
    tags: ["ASP.NET Core", "Angular", "MS SQL Server"],
  },
  {
    icon: "box",
    type: "Full-Stack · Gamified",
    title: "Performance Management System (PMS)",
    description:
      "A standalone performance platform with game mechanics layered onto evaluation cycles — achievement badges, leaderboard rankings and quest completions — architected on ASP.NET Core, React and PostgreSQL.",
    impact: "~40% increase in employee engagement during evaluations",
    tags: ["ASP.NET Core", "React", "PostgreSQL", "Gamification"],
  },
  {
    icon: "database",
    type: "Systems · Java",
    title: "Computerized Library Management System",
    description:
      "The institution's first fully functional library system, engineered from the ground up on Java OOP principles. Automated book cataloging, circulation tracking, fine management and borrowing records, cutting checkout time by ~60%.",
    impact: "Digitized library records for 2,000+ students and faculty",
    tags: ["Java", "OOP", "Systems Design"],
  },
  {
    icon: "monitor",
    type: "Client Work",
    title: "Responsive Websites for International Clients",
    description:
      "Designed, built and launched 10+ custom responsive sites — including Glocom.org, Jvillalobosart.com and Findweedhere.com — with cross-browser UI/UX and load-time tuning that lifted Google PageSpeed scores by ~25%.",
    impact: "~35% more engagement across 10+ client sites",
    tags: ["WordPress", "Divi Builder", "UI/UX", "SEO"],
  },
];
