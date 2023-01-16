import {
  UilEnvelope,
  UilLinkedin,
  UilNotes,
  UilTwitter
} from "@iconscout/react-unicons";

import { ChevronDownIcon } from "@heroicons/react/outline";
import { Menu } from "@headlessui/react";
import React from "react";
import Link from "next/link";

const Navbar: React.FC<{ handleClick: () => void }> = ({ handleClick }) => {
  return (
    <nav className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-4 mx-4 mt-4 bg-white rounded-lg shadow-lg text-zinc-800">
      <Link href="/" passHref>
        <a>
          <h1 className="text-xl font-bold cursor-pointer">DevSharpe</h1>
        </a>
      </Link>
      <div className="flex items-stretch">
        <Link href="/notes" passHref>
          <a className="flex items-center px-4 mr-2 space-x-2 rounded-lg hover:bg-zinc-200">
            <UilNotes />
            <span>Notes</span>
          </a>
        </Link>

        <button
          type="button"
          className="flex items-center justify-center h-10 px-4 text-white rounded-l-lg bg-zinc-800 hover:bg-black whitespace-nowrap"
          onClick={handleClick}
        >
          Contact Me
        </button>

        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="flex items-center justify-center h-10 leading-none text-white border-l border-white rounded-r-lg bg-zinc-800 aspect-square hover:bg-black">
              <ChevronDownIcon className="w-6 h-6 text-white" />
            </Menu.Button>
          </div>

          <Menu.Items
            as="div"
            className="absolute right-0 text-white rounded-lg top-12 bg-zinc-800"
          >
            <Menu.Item
              as="a"
              href="https://twitter.com/messages/compose?recipient_id=2312246869"
              target="_blank"
              rel="noreferrer"
              className="flex items-center px-4 py-2 space-x-2 border-b whitespace-nowrap hover:text-cyan-400"
            >
              <UilTwitter />
              <p>Twitter</p>
            </Menu.Item>
            <Menu.Item
              as="a"
              href="https://www.linkedin.com/in/devin-sharpe-8912b0191/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center px-4 py-2 space-x-2 border-b whitespace-nowrap hover:text-blue-400"
            >
              <UilLinkedin />
              <p>LinkedIn</p>
            </Menu.Item>
            <Menu.Item
              as="a"
              href="mailto:devin@devsharpe.io"
              target="_blank"
              rel="noreferrer"
              className="flex items-center px-4 py-2 space-x-2 whitespace-nowrap hover:text-emerald-400"
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
