import { contactLinks } from "./contact";
import { profile } from "./profile";
import { projects } from "./projects";
import { techGroups } from "./tech";
import type { Section } from "../types";

export interface AssistantCommand {
  action: "navigate" | "answer" | "warn";
  target?: Section;
  response: string;
}

/**
 * Keyword responder used when the API is unreachable — a dead key, a rate
 * limit, an offline visitor. It answers from the same data the page renders,
 * so the assistant degrades to something useful instead of an error bubble.
 *
 * Every pattern is anchored on word boundaries. Bare substring matching is a
 * trap here: "pos" would fire inside "possible", "app" inside "happens".
 */

/** A content question outranks any pleasantry it is wrapped in. */
const SECTION_PATTERNS: { section: Section; pattern: RegExp }[] = [
  {
    section: "projects",
    pattern:
      /\b(projects?|built|build|made|shipped|apps?|applications?|systems?|hrms|pos|point of sale|ess|portal|case stud(y|ies)|show me his work|see his work)\b/i,
  },
  {
    section: "tech",
    pattern:
      /\b(tech|technolog(y|ies)|stacks?|skills?|languages?|frameworks?|tools?|angular|react|typescript|javascript|sql|asp|dotnet|net|c#|csharp|ef core|entity framework|rxjs|postman|git|databases?|front.?end|back.?end)\b/i,
  },
  {
    section: "about",
    pattern:
      /\b(about|bio|background|experience|years?|career|work history|worked|who is|introduce|himself|his story|senior|junior)\b/i,
  },
];

/*
 * Answered inline rather than by navigating: the rail links are the contact
 * surface now, so there is no section left to scroll to.
 */
const CONTACT =
  /\b(contacts?|e?mail|reach|hire|hiring|available|availability|linkedin|github|connect|get in touch|resume|cv|freelance|open to work|opportunit(y|ies)|interview)\b/i;

const GREETING =
  /\b(hi|hey|hello|yo|sup|howdy|greetings|good (morning|afternoon|evening|day))\b/i;
const THANKS = /\b(thanks|thank you|thx|appreciate it|cheers)\b/i;
const IDENTITY =
  /\b(who are you|what are you|your name|are you (a )?(bot|ai|robot|human|real|person))\b/i;
const CAPABILITY =
  /\b(what can you (do|help|tell)|how (can|do) you help|what do you do|help me)\b/i;
const WELLBEING = /\b(how are you|how'?s it going|how do you do)\b/i;
const COMPLIMENT = /\b(nice|cool|awesome|great|love|impressive|slick|clean)\b/i;
const SITE = /\b(site|website|portfolio|design|page|this)\b/i;

/** Small rotation so a repeated "hi" doesn't return the identical string. */
let turn = 0;
const pick = (options: string[]) => options[turn++ % options.length];

const SECTION_REPLIES: Record<Section, () => string> = {
  projects: () =>
    `${profile.shortName} has shipped ${projects.length} standout projects — ${projects
      .slice(0, 3)
      .map((p) => p.title)
      .join(", ")} and more. I've scrolled you down to Projects for the details.`,
  tech: () =>
    `Mostly ${techGroups[0].items
      .slice(0, 2)
      .map((i) => i.name)
      .join(" and ")} on the front end, and ${techGroups[1].items
      .slice(0, 2)
      .map((i) => i.name)
      .join(" and ")} on the back end. The Tech section has the full list.`,
  about: () =>
    `${profile.shortName} is a ${profile.role} with ${profile.experience} of experience. ${profile.specialty} Scroll up to About for the longer version.`,
};

const answer = (response: string): AssistantCommand => ({
  action: "answer",
  response,
});

export function fallbackAnswer(message: string): AssistantCommand {
  const text = message.trim();

  const topic = SECTION_PATTERNS.find(({ pattern }) => pattern.test(text));
  if (topic) {
    return {
      action: "navigate",
      target: topic.section,
      response: SECTION_REPLIES[topic.section](),
    };
  }

  if (CONTACT.test(text)) {
    return answer(
      `${contactLinks
        .map((c) => `${c.label}: ${c.value}`)
        .join(" · ")} — the links are in the sidebar too.`,
    );
  }

  if (IDENTITY.test(text)) {
    return answer(
      pick([
        `I'm ${profile.shortName}'s assistant — I can walk you through his work, his stack, or how to reach him.`,
        `An AI assistant for ${profile.shortName}'s portfolio. Ask me anything about his projects or experience.`,
      ]),
    );
  }

  if (GREETING.test(text)) {
    return answer(
      pick([
        `Hey! I'm ${profile.shortName}'s assistant. What would you like to know — his projects, his tech stack, or how to get in touch?`,
        `Hi there! Happy to tell you about ${profile.shortName}'s work. What are you curious about?`,
        `Hello! Ask me about ${profile.shortName}'s projects, his stack, or his background.`,
      ]),
    );
  }

  if (THANKS.test(text)) {
    return answer(
      pick([
        "Anytime! Anything else you'd like to know?",
        `Happy to help. Just say the word if you want to hear more about ${profile.shortName}'s work.`,
      ]),
    );
  }

  if (WELLBEING.test(text)) {
    return answer(
      `Doing well, thanks for asking! What can I tell you about ${profile.shortName}?`,
    );
  }

  if (CAPABILITY.test(text)) {
    return answer(
      `I can tell you about ${profile.shortName}'s projects, the technologies he works with, his background, or how to get in touch — and I'll jump you to the right section as we go.`,
    );
  }

  if (COMPLIMENT.test(text) && SITE.test(text)) {
    return answer(
      "Thank you — he built it himself! Anything you'd like to know about his work?",
    );
  }

  return answer(
    `I'm not sure I caught that. I can tell you about ${profile.shortName}'s projects, his tech stack, his background, or how to reach him — which sounds useful?`,
  );
}
