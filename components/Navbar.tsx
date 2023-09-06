import { Mail, Laptop, Linkedin, StickyNote, ChevronDown } from "lucide-react";

import Link from "next/link";
import { Menu } from "@headlessui/react";
import React from "react";

const Navbar: React.FC<{ handleClick: () => void }> = ({ handleClick }) => {
  // const router = useRouter();
  return (
    <nav className="fixed inset-x-0 top-0 z-40 flex flex-col items-center justify-between gap-2 bg-white/75 px-6 py-4 backdrop-blur-lg dark:bg-zinc-800/75 md:flex-row">
      <Link href="/" passHref>
        <a>
          <h1 className="cursor-pointer text-xl font-bold">DevSharpe</h1>
        </a>
      </Link>
      <div className="flex items-stretch">
        <Link href="/uses" passHref>
          <a className="mr-2 flex items-center space-x-2 rounded-lg bg-zinc-200 px-4 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600">
            <Laptop />
            <span className="sr-only">DevSharpe uses</span>
          </a>
        </Link>

        <Link href="/notes" passHref>
          <a className="mr-2 flex items-center space-x-2 rounded-lg bg-zinc-200 px-4 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600">
            <StickyNote />
            <span>Notes</span>
          </a>
        </Link>

        <button
          type="button"
          className="flex h-10 items-center justify-center whitespace-nowrap rounded-l-lg bg-zinc-800 px-4 text-zinc-200 hover:bg-black dark:bg-white dark:text-zinc-800 dark:hover:bg-zinc-200"
          onClick={handleClick}
        >
          Contact Me
        </button>

        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button
              aria-label="Contact menu toggle"
              className="flex aspect-square h-10 items-center justify-center rounded-r-lg border-l border-white bg-zinc-800 leading-none text-white hover:bg-black dark:bg-white dark:text-zinc-800 dark:hover:bg-zinc-200"
            >
              <ChevronDown className="h-6 w-6" />
            </Menu.Button>
          </div>

          <Menu.Items
            as="div"
            className="absolute right-0 top-12 rounded-lg bg-zinc-800 text-white dark:bg-white"
          >
            <Menu.Item
              as="a"
              href="https://www.linkedin.com/in/devin-sharpe-8912b0191/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-2 whitespace-nowrap border-b px-4 py-2 text-zinc-100 hover:text-blue-400 dark:text-zinc-800 dark:hover:text-blue-500"
            >
              <Linkedin />
              <p>LinkedIn</p>
            </Menu.Item>
            <Menu.Item
              as="a"
              href="mailto:devin@devsharpe.io"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-2 whitespace-nowrap px-4 py-2 text-zinc-100 hover:text-emerald-400 dark:text-zinc-800 dark:hover:text-emerald-500"
            >
              <Mail />
              <p>Email</p>
            </Menu.Item>
          </Menu.Items>
        </Menu>
      </div>
    </nav>
  );
};

export default Navbar;
