import { getVisitorId } from "@/lib/visitor";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * Web-push opt-in client. Once subscribed, notifications are delivered by
 * the browser's push service to the service worker — they show even when
 * the site is closed or the phone is locked. (iOS additionally requires the
 * site to be added to the Home Screen.)
 */

export type PushSupport = "supported" | "unsupported" | "needs-install";

export function getPushSupport(): PushSupport {
  if (typeof window === "undefined") return "unsupported";
  const hasApis =
    "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  if (hasApis) return "supported";
  // iOS Safari exposes push APIs only for Home-Screen-installed sites.
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  return isIos ? "needs-install" : "unsupported";
}

export function getNotificationPermission(): NotificationPermission | null {
  if (typeof window === "undefined" || !("Notification" in window)) return null;
  return Notification.permission;
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(normalized);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

/** Registers the SW, asks permission, subscribes, and stores it server-side. */
export async function enablePushNotifications(): Promise<void> {
  const { publicKey } = (await fetch(`${API_URL}/api/push/public-key`).then(
    (r) => r.json(),
  )) as { publicKey: string | null };
  if (!publicKey) {
    throw new Error("Notifications aren't set up on the server yet.");
  }

  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error(
      "Notifications are blocked — allow them in your browser settings to opt in.",
    );
  }

  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    }));

  const json = subscription.toJSON();
  const response = await fetch(`${API_URL}/api/push/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Visitor-Id": getVisitorId(),
    },
    body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
  });
  if (!response.ok) {
    throw new Error("Could not save your subscription — try again.");
  }
}

/** Unsubscribes locally and removes the stored subscription server-side. */
export async function disablePushNotifications(): Promise<void> {
  const registration = await navigator.serviceWorker.getRegistration("/sw.js");
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  await fetch(`${API_URL}/api/push/unsubscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint }),
  }).catch(() => undefined);
}

/** True when this browser currently holds an active push subscription. */
export async function isPushSubscribed(): Promise<boolean> {
  if (getPushSupport() !== "supported") return false;
  if (getNotificationPermission() !== "granted") return false;
  const registration = await navigator.serviceWorker.getRegistration("/sw.js");
  return Boolean(await registration?.pushManager.getSubscription());
}
