import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/assets/logo-bg-ico.png" />
        <meta name="theme-color" content="#170f0a" />
        {/* PWA manifest — required for iOS Home-Screen install + web push. */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Hanawari" />
      </Head>
      <body className="antialiased bg-char-950 text-cream-50">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
