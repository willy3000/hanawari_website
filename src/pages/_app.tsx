import type { AppProps } from "next/app";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { CartProvider } from "@/lib/cart-context";
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
      <CartProvider>
        <Component {...pageProps} />
      </CartProvider>
    </div>
  );
}
