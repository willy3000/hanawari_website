import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MailIcon,
  WhatsAppIcon,
  InstagramIcon,
  PhoneIcon,
} from "@/components/icons";
import { subscribeNewsletterRequest } from "@/lib/api";
import { NotificationsToggle } from "@/components/NotificationsToggle";
import {
  EMAIL,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  PHONE,
  PHONE_DISPLAY,
  WHATSAPP_URL,
} from "@/lib/contact";

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setState("saving");
    try {
      await subscribeNewsletterRequest(email.trim());
      setState("done");
      setEmail("");
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <p className="mt-4 text-sm text-herb-400">
        Karibu! You're on the list — fresh drops land in your inbox first.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          aria-label="Email address for the newsletter"
          className="w-full min-w-0 rounded-full border border-cream-50/15 bg-char-950 px-4 py-2 text-sm text-cream-50 outline-none placeholder:text-cream-50/35 focus:border-gold-400"
        />
        <button
          type="submit"
          disabled={state === "saving"}
          className="shrink-0 rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-char-950 transition-transform hover:scale-105 disabled:opacity-60"
        >
          {state === "saving" ? "…" : "Join"}
        </button>
      </div>
      {state === "error" && (
        <p className="mt-2 text-xs text-ember-500">
          Couldn't sign you up — try again in a moment.
        </p>
      )}
      <p className="mt-2 text-xs text-cream-50/40">
        New drops and subscriber-only promo codes. Unsubscribe anytime.
      </p>
    </form>
  );
}

export function Footer() {
  return (
    <footer
      id="contact"
      className="border-t border-clay-700/40 bg-char-900 px-5 py-16 sm:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Image
              src="/assets/logo.png"
              alt="Hanawari — Homemade Kenyan Salsa, Taste the Moto"
              width={220}
              height={147}
              className="h-auto w-40"
            />
            <p className="mt-3 text-sm leading-relaxed text-cream-50/55">
              Small-batch, hand-blended in Kenya.
            </p>
            <NewsletterForm />
            <NotificationsToggle />
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
              Shop
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-cream-50/65">
              <li>
                <a href="#shop" className="hover:text-gold-400">
                  All heat levels
                </a>
              </li>
              <li>
                <a href="#story" className="hover:text-gold-400">
                  Our story
                </a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-gold-400">
                  Reviews
                </a>
              </li>
              <li>
                <Link href="/orders" className="hover:text-gold-400">
                  My orders
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
              Contact
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-cream-50/65">
              <li>
                <a
                  href={`tel:${PHONE}`}
                  className="flex items-center gap-2.5 hover:text-gold-400"
                >
                  <PhoneIcon className="h-4 w-4 shrink-0" />
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-2.5 hover:text-gold-400"
                >
                  <WhatsAppIcon className="h-4 w-4 shrink-0" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${EMAIL}`}
                  className="flex items-center gap-2.5 hover:text-gold-400"
                >
                  <MailIcon className="h-4 w-4 shrink-0" />
                  {EMAIL}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
              Follow
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-cream-50/65">
              <li>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-2.5 hover:text-gold-400"
                >
                  <InstagramIcon className="h-4 w-4 shrink-0" />
                  {INSTAGRAM_HANDLE}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-clay-700/40 pt-8 text-xs text-cream-50/40">
          <p>{`${new Date().getFullYear()} Hanawari. All rights reserved. Made in Kenya.`}</p>
        </div>
      </div>
    </footer>
  );
}
