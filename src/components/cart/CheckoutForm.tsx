import { useState, type FormEvent } from "react";
import { useCart } from "@/lib/cart-context";
import { formatKes } from "@/lib/format";
import { PinIcon, StoreIcon } from "@/components/icons";

const PHONE_PATTERN = /^(?:\+254|0)(7|1)\d{8}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export function CheckoutForm() {
  const {
    totalKes,
    deliveryMethod,
    deliveryLocation,
    deliveryFeeKes,
    deliveryConfig,
    placeOrder,
    backToCart,
    isPlacingOrder,
    placeOrderError,
  } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const isPickup = deliveryMethod === "pickup";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const cleanedPhone = phone.replace(/\s+/g, "");
    const nextErrors: FormErrors = {};

    if (!name.trim()) nextErrors.name = "Enter your name.";
    if (!cleanedPhone) {
      nextErrors.phone = "Enter a phone number.";
    } else if (!PHONE_PATTERN.test(cleanedPhone)) {
      nextErrors.phone = "Use a Kenyan number, e.g. 07XX XXX XXX.";
    }
    if (email.trim() && !EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = "That email doesn't look right.";
    }
    if (!isPickup && !address.trim()) {
      nextErrors.address = "Enter a detailed delivery address.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const resolvedAddress = isPickup
      ? `Pickup — ${deliveryConfig.dispatchPoint.label}`
      : `${deliveryLocation?.areaName ?? ""} — ${address.trim()}`.trim();

    await placeOrder({
      name: name.trim(),
      phone: cleanedPhone,
      email: email.trim() || undefined,
      address: resolvedAddress,
      note: note.trim() || undefined,
      marketingConsent,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-1 flex-col overflow-y-auto px-6 pb-6"
    >
      <div className="space-y-5 py-2">
        <div className="flex items-center gap-2.5 rounded-lg bg-cream-50/5 px-3 py-2.5 text-xs text-cream-50/75">
          {isPickup ? (
            <>
              <StoreIcon className="h-4 w-4 shrink-0 text-gold-400" />
              <span>
                Picking up from{" "}
                <strong className="text-cream-50">
                  {deliveryConfig.dispatchPoint.label}
                </strong>
              </span>
            </>
          ) : (
            <>
              <PinIcon className="h-4 w-4 shrink-0 text-gold-400" />
              <span>
                Delivering to{" "}
                <strong className="text-cream-50">
                  {deliveryLocation?.areaName}
                </strong>
                {deliveryFeeKes > 0 && (
                  <> — {formatKes(deliveryFeeKes)} delivery fee</>
                )}
              </span>
            </>
          )}
        </div>

        <Field label="Full name" htmlFor="checkout-name" error={errors.name}>
          <input
            id="checkout-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(errors.name)}
            className="w-full rounded-lg border border-cream-50/15 bg-char-900 px-4 py-3 text-sm text-cream-50 outline-none focus:border-gold-400"
          />
        </Field>

        <Field
          label="Phone number"
          htmlFor="checkout-phone"
          hint="e.g. 0712 345 678"
          error={errors.phone}
        >
          <input
            id="checkout-phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-invalid={Boolean(errors.phone)}
            placeholder="07XX XXX XXX"
            className="w-full rounded-lg border border-cream-50/15 bg-char-900 px-4 py-3 text-sm text-cream-50 outline-none placeholder:text-cream-50/30 focus:border-gold-400"
          />
        </Field>

        <Field
          label="Email (optional)"
          htmlFor="checkout-email"
          hint="We'll send your order confirmation here."
          error={errors.email}
        >
          <input
            id="checkout-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(errors.email)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-cream-50/15 bg-char-900 px-4 py-3 text-sm text-cream-50 outline-none placeholder:text-cream-50/30 focus:border-gold-400"
          />
        </Field>

        {!isPickup && (
          <Field
            label="Detailed address"
            htmlFor="checkout-address"
            hint="Building, street or landmark within the area you selected."
            error={errors.address}
          >
            <textarea
              id="checkout-address"
              rows={2}
              autoComplete="street-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              aria-invalid={Boolean(errors.address)}
              className="w-full resize-none rounded-lg border border-cream-50/15 bg-char-900 px-4 py-3 text-sm text-cream-50 outline-none focus:border-gold-400"
            />
          </Field>
        )}

        <Field label="Note (optional)" htmlFor="checkout-note">
          <textarea
            id="checkout-note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              isPickup
                ? "Preferred pickup time..."
                : "Gate code, preferred delivery time..."
            }
            className="w-full resize-none rounded-lg border border-cream-50/15 bg-char-900 px-4 py-3 text-sm text-cream-50 outline-none placeholder:text-cream-50/30 focus:border-gold-400"
          />
        </Field>

        <label className="flex items-start gap-3 rounded-lg border border-cream-50/10 bg-cream-50/5 px-3 py-3 text-sm text-cream-50/75">
          <input
            type="checkbox"
            checked={marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-cream-50/20 bg-char-900"
          />
          <span>
            I agree to receive emails about my order and Hanawari products and
            offers.
          </span>
        </label>
      </div>

      <div className="mt-auto space-y-3 pt-4">
        {placeOrderError && (
          <p
            role="alert"
            className="rounded-lg bg-ember-600/12 px-3 py-2.5 text-xs text-ember-500"
          >
            {placeOrderError}
          </p>
        )}
        <div className="flex justify-between text-sm font-semibold text-cream-50">
          <span>Total</span>
          <span>{formatKes(totalKes)}</span>
        </div>
        <button
          type="submit"
          disabled={isPlacingOrder}
          className="w-full rounded-full bg-ember-600 py-3.5 text-sm font-semibold uppercase tracking-[0.06em] text-cream-50 transition-transform hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
          {isPlacingOrder ? "Placing order…" : "Place order"}
        </button>
        <button
          type="button"
          onClick={backToCart}
          disabled={isPlacingOrder}
          className="w-full rounded-full border border-cream-50/15 py-3 text-sm font-medium text-cream-50/75 hover:border-gold-400 hover:text-gold-400 disabled:opacity-50"
        >
          Back to cart
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-medium text-cream-50/70"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs text-ember-500">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-cream-50/40">{hint}</p>
      ) : null}
    </div>
  );
}
