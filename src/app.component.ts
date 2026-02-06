import {
  Component,
  ChangeDetectionStrategy,
  signal,
  effect,
  inject,
  ElementRef,
  computed,
  OnInit,
} from "@angular/core";
import { GeminiService } from "./gemini.service";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVy: number;
  size: number;
  opacity: number;
}

type Tab = "about" | "projects" | "tech" | "contact";
type Theme = "dark" | "light" | "flashlight";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "(document:keydown.escape)": "onEscKey()",
    "(document:mousemove)": "onMouseMove($event)",
    "(document:mouseleave)": "onMouseLeave()",
  },
})
export class AppComponent implements OnInit {
  private geminiService = inject(GeminiService);
  private elementRef = inject(ElementRef);

  activeTab = signal<Tab>("about");
  avatarZoomed = signal(false);
  theme = signal<Theme>("dark");

  // Particle signals
  particles = signal<Particle[]>([]);
  mouseX = signal(-9999);
  mouseY = signal(-9999);

  // Chat state signals
  chatVisible = signal(false);
  chatMessages = signal<ChatMessage[]>([]);
  isLoading = signal(false);
  userInput = signal("");
  showChatTooltip = signal(true);
  violationCount = signal(0);
  isBlocked = signal(false);

  nextTheme = computed(() => {
    switch (this.theme()) {
      case "dark":
        return "light mode";
      case "light":
        return "flashlight mode";
      case "flashlight":
        return "dark mode";
    }
  });

  constructor() {
    // Scroll to top when tab changes
    effect(() => {
      this.activeTab();
      window.scrollTo(0, 0);
    });

    // Add initial AI message
    this.chatMessages.set([
      {
        sender: "ai",
        text: "Hello! I'm Lei's AI assistant. Ask me anything about his skills, projects, or experience.",
      },
    ]);

    // Hide the tooltip after a delay
    setTimeout(() => this.showChatTooltip.set(false), 8000);
  }

  ngOnInit() {
    this.initializeParticles();
    this.animateParticles();
  }

  initializeParticles() {
    const numParticles = 30;
    const newParticles: Particle[] = [];
    for (let i = 0; i < numParticles; i++) {
      newParticles.push(this.createParticle());
    }
    this.particles.set(newParticles);
  }

  createParticle(isReset: boolean = false): Particle {
    const size = Math.random() * 8 + 4; // size between 4 and 12
    const x = Math.random() * window.innerWidth;
    const y = isReset
      ? window.innerHeight + size
      : Math.random() * window.innerHeight;
    const vy = -(Math.random() * 0.8 + 0.2); // upward velocity
    return {
      id: Math.random(),
      x,
      y,
      vx: 0,
      vy: vy,
      baseVy: vy,
      size,
      opacity: Math.random() * 0.5 + 0.2,
    };
  }

  animateParticles() {
    const update = () => {
      this.particles.update((currentParticles) => {
        return currentParticles.map((p) => {
          // Interaction logic
          const dx = p.x - this.mouseX();
          const dy = p.y - this.mouseY();
          const dist = Math.sqrt(dx * dx + dy * dy);
          const interactionRadius = 100;

          if (dist < interactionRadius) {
            const force = (interactionRadius - dist) / interactionRadius;
            p.vx += (dx / dist) * force * 2.5; // Increased force for faster bounce
            p.vy += (dy / dist) * force * 2.5; // Increased force for faster bounce
          }

          // Damping / return to base velocity
          p.vx *= 0.95; // friction
          // Gently return to original upward velocity
          p.vy = p.vy * 0.95 + p.baseVy * 0.05;

          // Update position
          p.x += p.vx;
          p.y += p.vy;

          // Reset particle if it goes off screen
          if (
            p.y < -p.size ||
            p.x < -p.size ||
            p.x > window.innerWidth + p.size
          ) {
            return this.createParticle(true);
          }
          return p;
        });
      });

      requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  }

  setTab(tab: Tab) {
    this.activeTab.set(tab);
  }

  toggleTheme() {
    this.theme.update((current) => {
      if (current === "dark") return "light";
      if (current === "light") return "flashlight";
      return "dark";
    });
  }

  toggleAvatarZoom() {
    this.avatarZoomed.update((v) => !v);
  }

  onMouseMove(event: MouseEvent) {
    const { clientX, clientY } = event;
    this.mouseX.set(clientX);
    this.mouseY.set(clientY);

    if (this.theme() === "flashlight") {
      this.elementRef.nativeElement.style.setProperty(
        "--mouse-x",
        `${clientX}px`,
      );
      this.elementRef.nativeElement.style.setProperty(
        "--mouse-y",
        `${clientY}px`,
      );
    }
  }

  onMouseLeave() {
    this.mouseX.set(-9999);
    this.mouseY.set(-9999);
  }

  onEscKey() {
    if (this.avatarZoomed()) {
      this.avatarZoomed.set(false);
    }
    if (this.chatVisible()) {
      this.chatVisible.set(false);
    }
  }

  toggleChat() {
    this.chatVisible.update((v) => !v);
    this.showChatTooltip.set(false); // Permanently hide tooltip on first interaction
  }

  async sendMessage() {
    const messageText = this.userInput().trim();
    if (!messageText || this.isLoading() || this.isBlocked()) {
      return;
    }

    // Add user message to chat
    this.chatMessages.update((messages) => [
      ...messages,
      { sender: "user", text: messageText },
    ]);
    this.userInput.set("");
    this.isLoading.set(true);

    try {
      const aiResponse = await this.geminiService.sendMessage(messageText);
      let responseToParse = aiResponse;

      // The model sometimes wraps the JSON in markdown, let's strip it.
      const match = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (match && match[1]) {
        responseToParse = match[1];
      }

      // Every response should be a JSON command now
      try {
        const command = JSON.parse(responseToParse);

        switch (command.action) {
          case "navigate":
            this.chatMessages.update((messages) => [
              ...messages,
              { sender: "ai", text: command.response },
            ]);
            this.setTab(command.target as Tab);
            break;

          case "answer":
            this.chatMessages.update((messages) => [
              ...messages,
              { sender: "ai", text: command.response },
            ]);
            break;

          case "warn":
            this.violationCount.update((v) => v + 1);
            const warningsLeft = 3 - this.violationCount();
            const violationMessage = `${command.response} You have ${warningsLeft} warning(s) left.`;

            this.chatMessages.update((messages) => [
              ...messages,
              {
                sender: "ai",
                text: warningsLeft > 0 ? violationMessage : command.response,
              },
            ]);

            if (this.violationCount() >= 3) {
              this.isBlocked.set(true);
              this.chatMessages.update((messages) => [
                ...messages,
                {
                  sender: "ai",
                  text: "You have been temporarily blocked due to repeated off-topic questions. Please refresh the page to start a new session.",
                },
              ]);
            }
            break;

          default:
            // Fallback for unexpected JSON action
            this.chatMessages.update((messages) => [
              ...messages,
              {
                sender: "ai",
                text: "I received an unexpected response. Please try rephrasing.",
              },
            ]);
        }
      } catch (e) {
        // This catch block now handles cases where the AI failed to return valid JSON
        console.error("Failed to parse AI JSON response:", e);
        this.chatMessages.update((messages) => [
          ...messages,
          {
            sender: "ai",
            text: "Sorry, I'm having trouble formatting my response. Please try again.",
          },
        ]);
      }
    } catch (error) {
      this.chatMessages.update((messages) => [
        ...messages,
        {
          sender: "ai",
          text: "Sorry, I'm having trouble connecting right now.",
        },
      ]);
    } finally {
      this.isLoading.set(false);
    }
  }
}
