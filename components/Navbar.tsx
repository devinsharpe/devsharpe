import {
  UilEnvelope,
  UilLinkedin,
  UilNotes,
  UilTwitter
} from "@iconscout/react-unicons";

import { ChevronDownIcon } from "@heroicons/react/outline";
import Link from "next/link";
import { Menu } from "@headlessui/react";
import React from "react";

const Navbar: React.FC<{ handleClick: () => void }> = ({ handleClick }) => {
  return (
    <nav className="fixed inset-x-0 top-0 z-40 flex flex-col items-center justify-between gap-2 px-6 py-4 md:flex-row bg-white/75 dark:bg-zinc-800/75 backdrop-blur-lg">
      <Link href="/" passHref>
        <a>
          <h1 className="text-xl font-bold cursor-pointer">DevSharpe</h1>
        </a>
      </Link>
      <div className="flex items-stretch">
        <Link href="/notes" passHref>
          <a className="flex items-center px-4 mr-2 space-x-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 hover:bg-zinc-200">
            <UilNotes />
            <span>Notes</span>
          </a>
        </Link>

        <button
          type="button"
          className="flex items-center justify-center h-10 px-4 rounded-l-lg bg-zinc-800 text-zinc-200 dark:bg-white hover:bg-black dark:hover:bg-zinc-200 dark:text-zinc-800 whitespace-nowrap"
          onClick={handleClick}
        >
          Contact Me
        </button>

        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button
              aria-label="Contact menu toggle"
              className="flex items-center justify-center h-10 leading-none text-white border-l border-white rounded-r-lg dark:text-zinc-800 bg-zinc-800 dark:bg-white hover:bg-black dark:hover:bg-zinc-200 aspect-square"
            >
              <ChevronDownIcon className="w-6 h-6" />
            </Menu.Button>
          </div>

          <Menu.Items
            as="div"
            className="absolute right-0 text-white rounded-lg top-12 bg-zinc-800 dark:bg-white"
          >
            <Menu.Item
              as="a"
              href="https://twitter.com/messages/compose?recipient_id=2312246869"
              target="_blank"
              rel="noreferrer"
              className="flex items-center px-4 py-2 space-x-2 border-b whitespace-nowrap text-zinc-100 dark:text-zinc-800 dark:hover:text-cyan-500 hover:text-cyan-400"
            >
              <UilTwitter />
              <p>Twitter</p>
            </Menu.Item>
            <Menu.Item
              as="a"
              href="https://www.linkedin.com/in/devin-sharpe-8912b0191/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center px-4 py-2 space-x-2 border-b whitespace-nowrap text-zinc-100 dark:text-zinc-800 dark:hover:text-blue-500 hover:text-blue-400"
            >
              <UilLinkedin />
              <p>LinkedIn</p>
            </Menu.Item>
            <Menu.Item
              as="a"
              href="mailto:devin@devsharpe.io"
              target="_blank"
              rel="noreferrer"
              className="flex items-center px-4 py-2 space-x-2 whitespace-nowrap text-zinc-100 dark:text-zinc-800 dark:hover:text-emerald-500 hover:text-emerald-400"
            >
              <UilEnvelope />
              <p>Email</p>
            </Menu.Item>
          </Menu.Items>
        </Menu>
      </div>
    </nav>
  );
};

export default Navbar;
