import {
  CameraIcon,
  ComputerIcon,
  HammerIcon,
  MailIcon,
  MenuIcon,
  RssIcon,
  UserSquareIcon,
} from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "~/lib/utils";
import Dropdown from "~/components/_ui/dropdown";
import { Link as TanstackLink } from "@tanstack/react-router";

interface HeaderProps extends ComponentProps<"header"> {
  title: string;
  subtitle?: string;
}

export default function Header({
  title,
  subtitle,
  className,
  ...props
}: HeaderProps) {
  return (
    <header
      className={cn(
        "w-full group sticky top-0 backdrop-blur-xl z-10",
        className,
      )}
      {...props}
    >
      <div className="p-2 px-4 flex items-center gap-4 container max-w-4xl mx-auto">
        <Dropdown.Root>
          <Dropdown.Trigger size="icon">
            <MenuIcon strokeWidth={1.5} />
          </Dropdown.Trigger>
          <Dropdown.Content className="p-3 gap-2! mt-2">
            <Dropdown.Item as="link" to="/">
              <UserSquareIcon strokeWidth={1.5} size={16} />
              <span>About</span>
            </Dropdown.Item>
            <Dropdown.Item as="link" to="/projects">
              <HammerIcon strokeWidth={1.5} size={16} />
              <span>Projects</span>
            </Dropdown.Item>
            <Dropdown.Item as="link" to="/photography">
              <CameraIcon strokeWidth={1.5} size={16} />
              <span>Photography</span>
            </Dropdown.Item>
            <Dropdown.Item as="link" to="/posts">
              <RssIcon strokeWidth={1.5} size={16} />
              <span>Posts</span>
            </Dropdown.Item>
            <Dropdown.Item as="link" to="/uses">
              <ComputerIcon strokeWidth={1.5} size={16} />
              <span>Gear</span>
            </Dropdown.Item>
            <Dropdown.Item as="link" to="/contact">
              <MailIcon strokeWidth={1.5} size={16} />
              <span>Contact</span>
            </Dropdown.Item>
          </Dropdown.Content>
        </Dropdown.Root>

        <div>
          <h1 className="font-bold lg:text-lg">
            <TanstackLink
              to="/"
              className="focus-visible:outline-1 focus-visible:outline-white focus-visible:outline-offset-2"
            >
              {title}
            </TanstackLink>
          </h1>
          <p className="opacity-80 text-sm">{subtitle}</p>
        </div>
      </div>
    </header>
  );
}
