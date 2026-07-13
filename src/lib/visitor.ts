const STORAGE_KEY = "hanawari_visitor_id";

/**
 * Anonymous per-browser visitor ID, used to attribute and look up orders
 * without an account system.
 *
 * Stored in localStorage rather than a cookie: the storefront, backend, and
 * admin dashboard all live on different origins/ports, so a cookie would
 * need SameSite=None + Secure + credentialed CORS on every request just to
 * survive the cross-origin round trip. localStorage needs none of that —
 * the ID is just read here and sent explicitly as an X-Visitor-Id header.
 * The trade-off (JS-readable, doesn't sync across devices) is fine for an
 * anonymous tracking ID; it isn't a credential.
 */
export function getVisitorId(): string {
  if (typeof window === "undefined") return "";

  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;

  const id = crypto.randomUUID();
  window.localStorage.setItem(STORAGE_KEY, id);
  return id;
}
