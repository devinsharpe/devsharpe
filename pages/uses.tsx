import React from "react";
import type { NextPage } from "next";

const UsesPage: NextPage = () => {
  return (
    <main className="page-container">
      <div className="mx-auto max-w-4xl py-8">
        <h3 className="text-center font-display text-xl font-bold tracking-wide text-zinc-600 dark:text-zinc-300 md:text-3xl">
          Salut!
        </h3>
        <h2 className="text-center font-display text-3xl font-bold text-black dark:text-white md:text-6xl">
          Gear & Things
        </h2>
      </div>
      <section className="section-body">
        <h4 className="border-b border-zinc-600 pb-2 font-display text-2xl font-bold tracking-wide text-black dark:border-zinc-300 dark:text-white md:text-4xl">
          Daily Software
        </h4>
        <ul className="list-disc space-y-2 pl-6 text-lg">
          <li>
            <span className="font-semibold">Editor:</span>
            &nbsp;
            <span>
              <a
                href="https://zed.dev"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Zed
              </a>
              &nbsp;&ndash;&nbsp;I still have VS Code installed; however, I have
              become exhausted with how many resources it demands. Zed&apos;s
              innovative rendering approach keeps my system cool and allows me
              to work remotely for longer.
            </span>
          </li>
          <li>
            <span className="font-semibold">Color Theme:</span>
            &nbsp;
            <span>
              Andromeda &ndash; One of the default color scheme for Zed. Even
              though Zed doesn&apos;t support custom color schemes (yet), I
              really don&apos;t see myself changing it in the foreseeable
              future.
            </span>
          </li>
          <li>
            <span className="font-semibold">Linting & Formatting:</span>
            &nbsp;
            <span>ESLint + Prettier &ndash;</span>
            <span>
              &nbsp; Zed handles prettier formatting on save, and ESLint has
              &quot;saved my bacon&quot; numerous times. I&apos;m a huge fan of
              using Prettier plugins like&nbsp;
              <a
                href="https://github.com/tailwindlabs/prettier-plugin-tailwindcss"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                prettier-plugin-tailwindcss.
              </a>
            </span>
          </li>
          <li>
            <span className="font-semibold">Terminal:</span>
            &nbsp;
            <span>
              <a
                href="https://iterm2.com"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                iTerm2
              </a>
              &nbsp;&ndash;&nbsp;I&apos;m using a matching Androdema theme;
              It&apos;s very satisfying seeing a consistent color schema between
              Zed and iTerm. Of course, I&apos;m using&nbsp;
              <a
                href="https://ohmyz.sh"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                oh my zsh
              </a>
              &nbsp;as well, but my config is very lightweight. I&apos;m also a
              fan of tmux for grouping related terminal windows instead of
              iTerm&apos;s tab system.
            </span>
          </li>
          <li>
            <span className="font-semibold">Web Browser:</span>
            &nbsp;
            <span>Safari &ndash;</span>This is probably my most controversial
            piece of software. I try to prioritize efficiency and battery life
            above &quot;bells and whistles.&quot;
          </li>
        </ul>
      </section>

      <section className="section-body">
        <h4 className="border-b border-zinc-600 pb-2 font-display text-2xl font-bold tracking-wide text-black dark:border-zinc-300 dark:text-white md:text-4xl">
          Desktop Apps & Services
        </h4>
        <ul className="list-disc space-y-2 pl-6 text-lg">
          <li>
            <a
              href="https://tableplus.com"
              target="_blank"
              rel="noreferrer"
              className="font-semibold underline"
            >
              TablePlus
            </a>
            &nbsp;&ndash;&nbsp;When I&apos;m not able to use drizzle studio, I
            prefer peeking into Postgres and MySQL databases with this
            lightweight, native app for MacOS.
          </li>
          <li>
            <a
              href="https://todoist.com"
              target="_blank"
              rel="noreferrer"
              className="font-semibold underline"
            >
              Todoist
            </a>
            &nbsp;&ndash;&nbsp;Keeping track of projects and tasks can be a
            little daunting at times, and this app makes the &quot;to do
            list&quot; experience more efficient. Eventually, I would love to
            replace Todoist with&nbsp;
            <a
              href="https://ikigai.devsharpe.io"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Ikigai
            </a>
            &nbsp;soon.
          </li>
          <li>
            <a
              href="https://toggl.com"
              target="_blank"
              rel="noreferrer"
              className="font-semibold underline"
            >
              Toggl Track
            </a>
            &nbsp;&ndash;&nbsp;I like to have mini-retrospectives with myself at
            the end of the week. Keeping track of where my time is spent has
            been a great way to hold myself accountable.&nbsp;
            <a
              href="https://ikigai.devsharpe.io"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Ikigai
            </a>
            &nbsp;should replace this app soon.
          </li>
          <li>
            <a
              href="https://www.notion.so"
              target="_blank"
              rel="noreferrer"
              className="font-semibold underline"
            >
              Notion
            </a>
            &nbsp;&ndash;&nbsp;Notes, projects, personal databases, and things.
          </li>
          <li>
            <a
              href="https://sparkmailapp.com"
              target="_blank"
              rel="noreferrer"
              className="font-semibold underline"
            >
              Spark Mail
            </a>
            &nbsp;&ndash;&nbsp;Managing email is impossible; at least, it feels
            like it. Spark&apos;s smart inbox takes a lot of the frustration out
            of email for me.
          </li>
          <li>
            <a
              href="https://rectangleapp.com"
              target="_blank"
              rel="noreferrer"
              className="font-semibold underline"
            >
              Rectangle
            </a>
            &nbsp;&ndash;&nbsp;Why doesn&apos;t MacOS have a window manager?
            Stage manager doesn&apos;t count...
          </li>
          <li>
            <a
              href="http://tbswitcher.rugarciap.com"
              target="_blank"
              rel="noreferrer"
              className="font-semibold underline"
            >
              Turbo Boost Switcher Pro
            </a>
            &nbsp;&ndash;&nbsp;As much as I love my 2019 16-inch MacBook Pro,
            this chasis cannot keep up with the Intel i9 processor I have
            equipped. TB Switcher allows me to turn off the Intel Turbo Boost
            feature, so that I can trade some personal patience for much longer
            battery life and a cooler lap.
          </li>
        </ul>
      </section>

      <section className="section-body">
        <h4 className="border-b border-zinc-600 pb-2 font-display text-2xl font-bold tracking-wide text-black dark:border-zinc-300 dark:text-white md:text-4xl">
          Hardware
        </h4>

        <ul className="list-disc space-y-2 pl-6 text-lg">
          <li>
            <span className="font-semibold">Primary Machine:</span>
            <span>&nbsp;2019 16-inch Macbook Pro</span>
            <span className="italic text-zinc-600 dark:text-zinc-300">
              &nbsp;&ndash; Intel i9, 16 GB RAM, Radeon Pro 5500M, MacOS Beta
            </span>
          </li>
          <li>
            <span className="font-semibold">Secondary Machine:</span>
            <span>&nbsp;Desktop Computer</span>
            <span className="italic text-zinc-600 dark:text-zinc-300">
              &nbsp;&ndash; Intel i7 11700k, 32 GB RAM, Radeon RX 6600, Windows
              11 Pro
            </span>
          </li>
          <li>
            <span className="font-semibold">Monitor:&nbsp;</span>
            <a
              href="https://www.samsung.com/us/computing/monitors/smart-monitors/32-m8-4k-smart-monitor-and-streaming-tv-white-ls32bm801unxgo/"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Samsung M8
            </a>
            <span className="italic text-zinc-600 dark:text-zinc-300">
              &nbsp;&ndash; 32-inch, 4K
            </span>
          </li>
          <li>
            <span className="font-semibold">Keyboard:&nbsp;</span>
            <a
              href="https://www.logitech.com/en-us/products/keyboards/mx-mechanical.920-010552.html"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Logitech MX Mechnical Keys Mini
            </a>
          </li>
          <li>
            <span className="font-semibold">Laptop Mouse:&nbsp;</span>
            <a
              href="https://www.logitech.com/en-us/products/mice/mx-master-3s.910-006556.html"
              target="_blank"
              rel="noreferrer"
              className=" underline"
            >
              Logitech MX Master 3
            </a>
          </li>
          <li>
            <span className="font-semibold">Desktop Mouse:&nbsp;</span>
            <a
              href="https://www.logitechg.com/en-us/products/gaming-mice/g502-x-wireless-lightforce.910-006178.html"
              target="_blank"
              rel="noreferrer"
              className=" underline"
            >
              Logitech G520X Lightspeed
            </a>
          </li>
          <li>
            <span className="font-semibold">Microphone:&nbsp;</span>
            <span>Blue Snowball</span>
          </li>
          <li>
            <span className="font-semibold">Video:&nbsp;</span>
            <a
              href="https://www.logitech.com/en-us/products/webcams/c920s-pro-hd-webcam.960-001257.html"
              target="_blank"
              rel="noreferrer"
              className=" underline"
            >
              Logitech C920 Pro
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
};

export default UsesPage;
