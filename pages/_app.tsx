import "../styles/globals.css";

import type { AppProps } from "next/app";
import ContactDialog from "../components/ContactDialog";
import Head from "next/head";
import Navbar from "../components/Navbar";
import { useState } from "react";

function MyApp({ Component, pageProps }: AppProps) {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <>
      <Head>
        <title>DevSharpe 👋</title>
        <meta
          name="description"
          content="Devin Sharpe's portfolio site - A place of fun, excitement, and weird design decisions."
        />
        <link
          rel="icon"
          type="image/svg"
          href="/api/favicon?emoji=%F0%9F%90%B1"
        />
      </Head>
      <Navbar handleClick={() => setIsContactOpen(true)} />
      <ContactDialog
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
      <div id="top"></div>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
