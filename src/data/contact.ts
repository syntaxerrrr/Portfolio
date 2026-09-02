import type { IconName } from "../components/Icon";

export interface ContactLink {
  icon: IconName;
  label: string;
  /** Text shown on the card. */
  value: string;
  href: string;
  external?: boolean;
}

export const contactLinks: ContactLink[] = [
  {
    icon: "mail",
    label: "Email",
    value: "zhylegaming@gmail.com",
    href: "mailto:zhylegaming@gmail.com",
  },
  {
    icon: "linkedin",
    label: "LinkedIn",
    value: "/in/leinard-artajo-1124ab310",
    href: "https://www.linkedin.com/in/leinard-artajo-1124ab310/",
    external: true,
  },
  {
    icon: "github",
    label: "GitHub",
    value: "/syntaxerrrr",
    href: "https://github.com/syntaxerrrr",
    external: true,
  },
];
