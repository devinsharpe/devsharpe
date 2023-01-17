import "../styles/globals.css";

import {
  UilFileDownload,
  UilGithub,
  UilLinkedin,
  UilTwitter
} from "@iconscout/react-unicons";

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
      </Head>
      <Navbar handleClick={() => setIsContactOpen(true)} />
      <ContactDialog
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
      <Component {...pageProps} />
      <footer className="w-full px-2">
        <div className="grid max-w-3xl grid-cols-1 gap-2 p-4 mx-auto mb-4 border-2 rounded-lg md:grid-cols-2 text-zinc-600 dark:text-zinc-200 border-zinc-300/50 dark:border-zinc-600/50 bg-zinc-100 dark:bg-zinc-700">
          <div className="flex items-center justify-center space-x-2">
            <a
              href="https://github.com/devinsharpe"
              target="_blank"
              rel="noreferrer"
              aria-label="Github Link"
              className="hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              <UilGithub />
            </a>
            <a
              href="https://www.linkedin.com/in/devin-sharpe-8912b0191/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn Link"
              className="hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              <UilLinkedin />
            </a>
            <a
              href="https://twitter.com/Devin_Sharpe"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter Link"
              className="hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              <UilTwitter />
            </a>
            <a
              href="/resume - devin sharpe.pdf"
              target="_blank"
              rel="noreferrer"
              download
              aria-label="Download Resume Link"
              className="hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              <UilFileDownload />
            </a>
          </div>
          <div className="flex items-center justify-center h-full text-center">
            <p className="text-center">LH scores</p>
          </div>
          <p className="text-center md:col-span-2">
            <span>&copy;2019-2023</span>
            &nbsp;
            <a href="/#top" className="underline">
              Devin Sharpe
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}

export default MyApp;
