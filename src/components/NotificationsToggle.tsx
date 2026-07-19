import { useEffect, useState } from "react";
import {
  disablePushNotifications,
  enablePushNotifications,
  getNotificationPermission,
  getPushSupport,
  isPushSubscribed,
} from "@/lib/push";

type ToggleState =
  | "loading"
  | "unsupported"
  | "needs-install"
  | "blocked"
  | "off"
  | "on"
  | "working";

/**
 * Push-notification opt-in. Once enabled, announcements and promo pushes
 * arrive as system notifications — even with the site closed or the phone
 * locked. iOS shows an "add to Home Screen first" hint instead.
 */
export function NotificationsToggle() {
  const [state, setState] = useState<ToggleState>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const support = getPushSupport();
    if (support === "unsupported") {
      setState("unsupported");
      return;
    }
    if (support === "needs-install") {
      setState("needs-install");
      return;
    }
    if (getNotificationPermission() === "denied") {
      setState("blocked");
      return;
    }
    isPushSubscribed()
      .then((subscribed) => setState(subscribed ? "on" : "off"))
      .catch(() => setState("off"));
  }, []);

  const toggle = async () => {
    setError(null);
    const previous = state;
    setState("working");
    try {
      if (previous === "on") {
        await disablePushNotifications();
        setState("off");
      } else {
        await enablePushNotifications();
        setState("on");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "That didn't work — try again.");
      setState(getNotificationPermission() === "denied" ? "blocked" : previous);
    }
  };

  if (state === "unsupported") return null;

  if (state === "needs-install") {
    return (
      <p className="mt-3 text-xs text-cream-50/40">
        🔔 On iPhone: add Hanawari to your Home Screen (Share → Add to Home
        Screen) to get drop alerts.
      </p>
    );
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => void toggle()}
        disabled={state === "loading" || state === "working" || state === "blocked"}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors disabled:opacity-50 ${
          state === "on"
            ? "border-herb-400/40 text-herb-400"
            : "border-cream-50/20 text-cream-50/70 hover:border-gold-400 hover:text-gold-300"
        }`}
      >
        <span aria-hidden="true">🔔</span>
        {state === "on"
          ? "Notifications on — tap to turn off"
          : state === "working"
            ? "One moment…"
            : state === "blocked"
              ? "Notifications blocked in browser"
              : "Notify me about drops & deals"}
      </button>
      {state === "blocked" && (
        <p className="mt-1.5 text-xs text-cream-50/40">
          You've blocked notifications for this site — re-allow them in your
          browser's site settings, then try again.
        </p>
      )}
      {error && <p className="mt-1.5 text-xs text-ember-500">{error}</p>}
    </div>
  );
}
