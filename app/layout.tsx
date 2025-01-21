import "../styles/globals.css";

import React from "react";
import Link from "next/link";
import { Computer, Moon, Sun, SunDim } from "lucide-react";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body className="flex min-h-dvh flex-col items-center">
        <header className="sticky inset-x-0 top-0 flex w-dvw justify-center border-b-8 border-double border-foreground bg-muted">
          <nav className="w-100 container flex items-center justify-between p-4">
            <Link href="/">
              <h1 className="font-bold uppercase tracking-wide">
                Devin Sharpe
              </h1>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/uses">Uses</Link>
              <Link href="/thoughts">Thoughts</Link>
              <Link href="#">Contact</Link>
            </div>
          </nav>
        </header>
        <main className="h-100 container flex-1 px-4 py-8">{children}</main>
        <footer className="w-100 flex justify-center gap-2 self-stretch p-4">
          <div className="rounded bg-accent-foreground px-4 py-2 text-sm font-semibold text-accent shadow-inner shadow-white/30 drop-shadow duration-1000 animate-in fade-in">
            <p>Made with ❤️ by Devin</p>
          </div>
          <div className="rounded bg-accent-foreground px-4 py-2 text-sm font-semibold text-accent shadow-inner shadow-white/30 drop-shadow duration-1000 animate-in fade-in">
            <Sun className="h-5 w-5" />
          </div>
        </footer>
      </body>
    </html>
  );
}
