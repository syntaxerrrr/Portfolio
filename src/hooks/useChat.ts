import { useCallback, useState } from "react";
import { CHAT_GREETING, MAX_VIOLATIONS } from "../data/assistant";
import { askAssistant } from "../services/assistant";
import type { ChatMessage, Section } from "../types";

export function useChat(onNavigate: (section: Section) => void) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: "ai", text: CHAT_GREETING },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [violations, setViolations] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  const reply = useCallback((text: string) => {
    setMessages((current) => [...current, { sender: "ai", text }]);
  }, []);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading || isBlocked) return;

    // The opening greeting is decorative, so it stays out of the history
    // the model sees — Gemini expects the exchange to start with the visitor.
    const history = messages.slice(1);
    setMessages((current) => [...current, { sender: "user", text }]);
    setInput("");
    setIsLoading(true);

    try {
      const command = await askAssistant(history, text);

      switch (command.action) {
        case "navigate":
          reply(command.response);
          if (command.target) onNavigate(command.target);
          break;

        case "warn": {
          const count = violations + 1;
          setViolations(count);
          const warningsLeft = MAX_VIOLATIONS - count;

          reply(
            warningsLeft > 0
              ? `${command.response} You have ${warningsLeft} warning(s) left.`
              : command.response,
          );

          if (count >= MAX_VIOLATIONS) {
            setIsBlocked(true);
            reply(
              "You have been temporarily blocked due to repeated off-topic questions. Please refresh the page to start a new session.",
            );
          }
          break;
        }

        default:
          reply(command.response);
      }
    } finally {
      setIsLoading(false);
    }
  }, [input, isBlocked, isLoading, messages, onNavigate, reply, violations]);

  return { messages, input, setInput, isLoading, isBlocked, send };
}
