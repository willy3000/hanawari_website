import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/assets/logo-bg.png" />
        <title>Hanawari Salsa – Premium Homemade Salsa in Kenya</title>
        <meta
          name="description"
          content="Premium homemade salsa made with fresh ingredients. Order online for fast delivery."
        />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
