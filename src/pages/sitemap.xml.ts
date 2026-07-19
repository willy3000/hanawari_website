import type { GetServerSideProps } from "next";
import type { Product } from "@/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hanawari.store";

/** Static route + one entry per live product, straight from the backend. */
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  let products: Product[] = [];
  try {
    const response = await fetch(`${apiUrl}/api/products`);
    if (response.ok) {
      products = ((await response.json()) as { products: Product[] }).products;
    }
  } catch {
    // Backend down — the static pages alone still make a valid sitemap.
  }

  const urls = [
    `${SITE_URL}/`,
    `${SITE_URL}/products`,
    ...products.map((p) => `${SITE_URL}/products/${p.slug}`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  res.write(xml);
  res.end();

  return { props: {} };
};

export default function Sitemap() {
  return null;
}
