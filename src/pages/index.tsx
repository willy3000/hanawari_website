import Head from "next/head";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { BrandStory } from "@/components/BrandStory";
import { ProductsSection } from "@/components/ProductsSection";
import { Testimonials } from "@/components/Testimonials";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";

export default function Home() {
  return (
    <>
      <Head>
        <title>Hanawari — Homemade Kenyan Salsa | Taste the Moto</title>
        <meta
          name="description"
          content="Hanawari is homemade Kenyan salsa, hand-blended in three heat levels — Gentle, Classic and Volcanic. Taste the Moto."
        />
        <meta property="og:title" content="Hanawari — Homemade Kenyan Salsa" />
        <meta
          property="og:description"
          content="Small-batch Kenyan salsa in three heat levels. Taste the Moto."
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/assets/logo-bg.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <Nav />
      <main>
        <Hero />
        <BrandStory />
        <ProductsSection />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
