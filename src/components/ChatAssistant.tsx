import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  assistantChatRequest,
  type AssistantMessage,
} from "@/lib/api";
import { WHATSAPP_URL } from "@/lib/contact";

const STORAGE_KEY = "hanawari_assistant_chat_v1";
const GREETING =
  "Karibu! 🌶️ I'm Moto, Hanawari's salsa assistant. Ask me about our jars, heat levels, delivery, or anything about ordering.";

function readStoredChat(): AssistantMessage[] {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m): m is AssistantMessage =>
        typeof m === "object" &&
        m !== null &&
        ((m as AssistantMessage).role === "user" ||
          (m as AssistantMessage).role === "assistant") &&
        typeof (m as AssistantMessage).content === "string",
    );
  } catch {
    return [];
  }
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
          className="h-1.5 w-1.5 rounded-full bg-cream-50/60"
        />
      ))}
    </span>
  );
}

/**
 * Floating AI assistant: a chat popup backed by the backend's
 * /api/assistant/chat endpoint. Conversation survives navigation via
 * sessionStorage; the greeting is display-only and never sent to the API.
 */
export function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    setMessages(readStoredChat());
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Storage blocked — chat still works for this page view.
    }
  }, [messages]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  // Keep the newest message in view.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, thinking, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || thinking) return;
    setError(null);
    setInput("");

    const history = [...messages, { role: "user" as const, content: text }];
    setMessages(history);
    setThinking(true);
    try {
      const reply = await assistantChatRequest(history.slice(-20));
      setMessages((current) => [
        ...current,
        { role: "assistant", content: reply },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "I couldn't reply just now — try again in a moment.",
      );
    } finally {
      setThinking(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="assistant-panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="fixed right-4 bottom-20 z-40 flex w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-cream-50/15 bg-char-800 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.7)]"
            style={{ height: "min(30rem, 70vh)" }}
            role="dialog"
            aria-label="Chat with the Hanawari assistant"
          >
            <div className="flex items-center justify-between border-b border-cream-50/10 bg-char-900 px-4 py-3">
              <div>
                <p className="font-display text-sm font-bold text-cream-50">
                  Moto 🌶️
                </p>
                <p className="text-[11px] text-cream-50/50">
                  Hanawari's AI assistant
                </p>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setMessages([]);
                      setError(null);
                    }}
                    className="text-[11px] text-cream-50/45 hover:text-cream-50/80"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-cream-50/70 hover:bg-cream-50/10 hover:text-cream-50"
                >
                  ✕
                </button>
              </div>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-char-900 px-3.5 py-2.5 text-sm leading-relaxed text-cream-50/90">
                {GREETING}
              </div>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={
                    message.role === "user" ? "flex justify-end" : undefined
                  }
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "rounded-tr-sm bg-ember-600 text-cream-50"
                        : "rounded-tl-sm bg-char-900 text-cream-50/90"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {thinking && (
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-char-900 px-3.5 py-2.5">
                  <TypingDots />
                </div>
              )}
              {error && (
                <p className="rounded-lg bg-ember-600/12 px-3 py-2 text-xs text-ember-500">
                  {error}
                </p>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
              className="border-t border-cream-50/10 px-3 py-3"
            >
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={2000}
                  placeholder="Ask about our salsas…"
                  aria-label="Message the assistant"
                  className="w-full rounded-full border border-cream-50/15 bg-char-950 px-4 py-2.5 text-sm text-cream-50 outline-none placeholder:text-cream-50/35 focus:border-gold-400"
                />
                <button
                  type="submit"
                  disabled={thinking || !input.trim()}
                  aria-label="Send message"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ember-600 text-cream-50 transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4.5 w-4.5"
                  >
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] text-cream-50/35">
                AI answers can slip up — prices at checkout are what count.{" "}
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-gold-300/80 underline hover:text-gold-300"
                >
                  Prefer a human? WhatsApp us
                </a>
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close the assistant" : "Chat with our AI assistant"}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 20 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed right-4 bottom-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-ember-600 text-cream-50 shadow-[0_8px_30px_-6px_rgba(255,69,0,0.7)]"
      >
        {open ? (
          <span className="text-lg leading-none">✕</span>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5.5 w-5.5"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <path d="M8 9h8" />
            <path d="M8 13h5" />
          </svg>
        )}
      </motion.button>
    </>
  );
}
