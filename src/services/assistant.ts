import { type AssistantCommand, fallbackAnswer } from "../data/fallback";
import type { ChatMessage } from "../types";

/**
 * Talks to our own `/api/chat` route, never to Gemini directly — the API key
 * stays on the server, so nothing secret ships in the browser bundle.
 *
 * If the route is unreachable (dead key, rate limit, offline visitor) we answer
 * locally rather than showing an error, so the assistant always responds.
 */
const ENDPOINT = "/api/chat";
const TIMEOUT_MS = 15_000;

const toApiRole = (sender: ChatMessage["sender"]) =>
  sender === "user" ? ("user" as const) : ("model" as const);

export async function askAssistant(
  history: ChatMessage[],
  message: string,
): Promise<AssistantCommand> {
  const messages = [
    ...history.map((m) => ({ role: toApiRole(m.sender), text: m.text })),
    { role: "user" as const, text: message },
  ];

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`Assistant route returned ${response.status}`);
    }

    const command = (await response.json()) as AssistantCommand;
    if (!command?.action || typeof command.response !== "string") {
      throw new Error("Malformed assistant response");
    }

    return command;
  } catch (error) {
    console.warn("Assistant unavailable, answering locally:", error);
    return fallbackAnswer(message);
  }
}
