import type { IconName } from "../components/Icon";

export interface TechItem {
  name: string;
  caption: string;
  /** Two-letter badge, or an `icon` for an SVG glyph instead. */
  label?: string;
  icon?: IconName;
}

export interface TechGroup {
  title: string;
  items: TechItem[];
}

/** Add a tech card by appending to the relevant group. */
export const techGroups: TechGroup[] = [
  {
    title: "Front-End",
    items: [
      { name: "Angular", caption: "Component framework", label: "Ng" },
      { name: "React", caption: "Component framework", label: "Re" },
      { name: "TypeScript", caption: "Type-safe JavaScript", label: "TS" },
      { name: "JavaScript", caption: "ES2022+", label: "JS" },
      { name: "Blazor", caption: "C# on the web", label: "Bl" },
      { name: "HTML5 & CSS3", caption: "Semantic markup & styling", icon: "code" },
      { name: "Bootstrap", caption: "Responsive UI toolkit", label: "Bs" },
    ],
  },
  {
    title: "Back-End",
    items: [
      { name: "C#", caption: "Primary language", label: "C#" },
      { name: "ASP.NET Core", caption: "MVC & Web API", label: ".N" },
      { name: "ASP.NET Zero", caption: "Enterprise boilerplate", label: "AZ" },
      { name: ".NET MAUI", caption: "Cross-platform apps", label: "MA" },
      { name: "Node.js", caption: "JavaScript runtime", label: "No" },
      { name: "Express.js", caption: "HTTP framework", label: "Ex" },
      { name: "Java", caption: "OOP systems", label: "Ja" },
    ],
  },
  {
    title: "Data, Cloud & DevOps",
    items: [
      { name: "PostgreSQL", caption: "Relational database", icon: "database" },
      { name: "MS SQL Server", caption: "SSMS & query tuning", icon: "database" },
      { name: "Entity Framework Core", caption: "ORM & data access", label: "EF" },
      { name: "AWS", caption: "Cloud hosting", label: "AW" },
      { name: "Docker", caption: "Containerization", label: "Do" },
      { name: "GitHub", caption: "Version control", icon: "git" },
      { name: "SourceTree", caption: "Git client", label: "ST" },
    ],
  },
  {
    title: "Architecture & Concepts",
    items: [
      { name: "OOP", caption: "Object-oriented design", label: "OO" },
      { name: "SOLID Principles", caption: "Maintainable architecture", label: "SO" },
      { name: "MVC Architecture", caption: "Separation of concerns", label: "MV" },
      { name: "RESTful APIs", caption: "API design & integration", icon: "externalLink" },
      { name: "OAuth2", caption: "Auth & authorization", label: "OA" },
      { name: "Gamification UI/UX", caption: "Engagement mechanics", label: "GX" },
    ],
  },
];
