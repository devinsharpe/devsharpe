import { cn } from "~/lib/utils";
import { type ComponentProps } from "react";
import Link from "~/components/_ui/link";
import { SiGithub, SiInstagram } from "@icons-pack/react-simple-icons";
import Button, { buttonVariants } from "./button";
import { FileDownIcon, GaugeIcon, LogOutIcon } from "lucide-react";
import { Link as TanstackLink } from "@tanstack/react-router";
import { auth_client } from "~/lib/auth-client";

interface FooterProps extends ComponentProps<"footer"> {}

export default function Footer({ className, ...props }: FooterProps) {
  const session = auth_client.useSession();

  return (
    <footer
      className={cn("group container mx-auto mb-4 max-w-4xl py-2", className)}
      {...props}
    >
      <div className="flex w-full">
        <div className="flex grow items-center gap-2 p-2 px-4">
          <a
            href="https://github.com/devinsharpe"
            target="_blank"
            rel="noreferrer"
            className={cn(
              "flex items-center justify-between gap-2 text-sm",
              buttonVariants(),
            )}
          >
            <SiGithub strokeWidth={1.5} size={16} />
            <span className="sr-only">Github</span>
          </a>
          <Link to="/employment" download>
            <FileDownIcon strokeWidth={1.5} size={16} />
            <span className="sr-only">Download Resume</span>
          </Link>
          <a
            href="https://www.linkedin.com/in/devin-sharpe-8912b0191"
            target="_blank"
            rel="noreferrer"
            className={cn(
              "flex items-center justify-between gap-2 text-sm",
              buttonVariants(),
            )}
          >
            LinkedIn
          </a>
          <a
            href="https://www.instagram.com/devin_sharpe"
            target="_blank"
            rel="noreferrer"
            className={cn(
              "flex items-center justify-between gap-2 text-sm",
              buttonVariants(),
            )}
          >
            <SiInstagram strokeWidth={1.5} size={16} />
            <span className="sr-only">Instagram</span>
          </a>
        </div>
        <div className="flex gap-2 shrink-0 items-center px-4 py-2" aria-hidden>
          {session.data ? (
            <>
              <Link to="/dashboard">
                <GaugeIcon strokeWidth={1.5} size={16} />
                <span className="sr-only">Dashboard</span>
              </Link>
              <Button onClick={() => auth_client.signOut({ callbackURL: "/" })}>
                <LogOutIcon strokeWidth={1.5} size={16} />
              </Button>
            </>
          ) : (
            <TanstackLink to="/login">•⩊•</TanstackLink>
          )}
        </div>
      </div>
    </footer>
  );
}
