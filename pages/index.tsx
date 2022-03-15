import { ChevronDownIcon } from "@heroicons/react/outline";
import Head from "next/head";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Devin Sharpe</title>
        <meta
          name="description"
          content="Devin Sharpe's portfolio site - A place of fun, excitement, and weird design decisions."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav className="fixed inset-x-0 top-0 flex items-center justify-between px-6 py-4 mx-4 mt-4 bg-white">
        <h1 className="text-xl">DevSharpe</h1>
        <div className="flex items-stretch">
          <button
            type="button"
            className="flex items-center justify-center h-10 px-4 text-white bg-black hover:bg-zinc-800 whitespace-nowrap"
          >
            Contact Me
          </button>
          <button
            type="button"
            className="flex items-center justify-center h-10 leading-none text-white bg-black border-l border-white aspect-square hover:bg-zinc-800"
          >
            <ChevronDownIcon className="w-6 h-6 text-white" />
          </button>
        </div>
      </nav>
      <main className="container px-6 mx-auto mt-32 space-y-8 md:flex md:space-x-8 md:space-y-0 md:p-0">
        <section className="p-4 bg-white md:w-1/2">Hello world</section>
        <section className="p-4 bg-white md:w-1/2">Hello world</section>
      </main>
    </>
  );
};

export default Home;
