import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <title>Vexlore — Launchpad</title>
        <meta name="description" content="Vexlore branded Solana launchpad. Launch tokens with optional VEXLOREBOT pairing." />
        <link rel="icon" href="/vexlore-logo.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/vexlore-logo.jpg" />
        <meta name="theme-color" content="#e23a32" />
        <Script src="https://terminal.jup.ag/main-v4.js" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
