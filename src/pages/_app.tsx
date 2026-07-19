import type { AppProps } from "next/app";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { MotionConfig } from "framer-motion";
import { CartProvider } from "@/lib/cart-context";
import { StoreChrome } from "@/components/StoreChrome";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${inter.variable} ${bricolage.variable}`}>
      {/* reducedMotion="user": every framer animation collapses to a fade
          when the OS asks for reduced motion, matching the 3D layer. */}
      <MotionConfig reducedMotion="user">
        <CartProvider>
          <Component {...pageProps} />
          <StoreChrome />
        </CartProvider>
      </MotionConfig>
    </div>
  );
}
