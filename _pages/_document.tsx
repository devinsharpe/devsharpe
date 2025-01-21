import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          rel="icon"
          type="image/svg"
          href="/api/favicon?emoji=%F0%9F%90%B1"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div id="top"></div>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
