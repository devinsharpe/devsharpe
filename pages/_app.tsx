import "../styles/globals.css";

import type { AppProps } from "next/app";
import Head from "next/head";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link
          rel="icon"
          type="image/svg"
          href="/api/favicon?emoji=%F0%9F%90%B1"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
