This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Order-confirmation emails (Resend)

Placing an order with an email address triggers a confirmation email, sent
server-side via [Resend](https://resend.com) from a Next.js API route.

**Required env var** (in `.env.local`, server-side only — never `NEXT_PUBLIC_`):

```
RESEND_API_KEY=re_xxxxxxxx
```

**Endpoint contract** — `POST /api/orders/confirm`:

```jsonc
{
  "customerName": "Jane",
  "customerEmail": "jane@example.com",
  "items": [{ "name": "Classic", "quantity": 2, "unitPriceKes": 899 }],
  "totalKes": 1798,
  "orderId": "HN-ABC123" // optional
}
```

Responses: `200 {"sent":true,"id":"..."}` on success; `400 {"error":"..."}` for a
missing/invalid email or empty items; `405` for non-POST; `502` with a generic
message if Resend rejects the send (details are logged server-side only).

The checkout flow calls this fire-and-forget after the order is accepted — a
failed email never blocks or fails the order.

**Test locally:**

```bash
npm run dev
curl -X POST http://localhost:3000/api/orders/confirm \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Test","customerEmail":"delivered@resend.dev","items":[{"name":"Classic","quantity":1,"unitPriceKes":899}],"totalKes":899}'
```

`delivered@resend.dev` is Resend's test inbox — the send is real but goes
nowhere. Check the [Resend dashboard](https://resend.com/emails) to preview it.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
