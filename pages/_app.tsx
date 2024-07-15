import "../styles/globals.css";
import "../styles/speedlify.css";

import { FileDown, Github, Linkedin } from "lucide-react";

import { Analytics } from "@vercel/analytics/react";
import type { AppProps } from "next/app";
import ContactDialog from "../components/ContactDialog";
import Head from "next/head";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Script from "next/script";

const speedlifyMap: Record<string, string> = {
  "/": "742c24c0",
  "/notes": "3b4614a3",
  "/notes/caddyfile-local-development": "a4024ef",
  "/notes/signin-with-apple-with-next-auth": "fa204c92",
};

function MyApp({ Component, pageProps }: AppProps) {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const router = useRouter();
  const [speedlify, setSpeedlify] = useState<JSX.Element | undefined>(
    undefined,
  );
  useEffect(() => {
    requestAnimationFrame(() =>
      setSpeedlify(
        <speedlify-score
          speedlify-url="https://speedlify-sandy.vercel.app/"
          hash={speedlifyMap[router.asPath]}
        />,
      ),
    );
    return () => {
      setSpeedlify(undefined);
    };
  }, [router.asPath]);

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
        <div className="mx-auto mb-4 grid max-w-3xl grid-cols-1 gap-2 rounded-lg p-4 text-zinc-600 md:grid-cols-2 dark:text-zinc-200">
          <div
            className={`flex items-center justify-center space-x-2 px-6 md:justify-start ${
              !speedlify ? "col-span-2 md:justify-center" : ""
            }`}
          >
            <a
              href="https://github.com/devinsharpe"
              target="_blank"
              rel="noreferrer"
              aria-label="Github Link"
              className="hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              <Github />
            </a>
            <a
              href="https://www.linkedin.com/in/devin-sharpe-8912b0191/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn Link"
              className="hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              <Linkedin />
            </a>
            <Link href="/resume-devin_sharpe-20240715.pdf" passHref>
              <a
                target="_blank"
                rel="noreferrer"
                download
                aria-label="Download Resume Link"
                className="hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                <FileDown />
              </a>
            </Link>
          </div>
          <div className="flex items-center justify-center px-6 md:justify-end">
            {speedlify}
          </div>
          <p className="text-center md:col-span-2">
            <span>&copy;2019-2023</span>
            &nbsp;
            <Link href="/#top" passHref>
              <a className="underline">Devin Sharpe</a>
            </Link>
          </p>
        </div>
      </footer>
      <Analytics />
      <Script src="/scripts/speedlify.js" />
    </>
  );
}

export default MyApp;
