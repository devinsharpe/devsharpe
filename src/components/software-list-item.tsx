import { ComponentProps } from "react";
import { DailySoftware } from "~/types/gear.types";
import { Link as TanstackLink } from "@tanstack/react-router";

export type SoftwareListItemProps = DailySoftware & ComponentProps<"li">;

export default function SoftwareListItem({
  tool,
  name,
  link,
  description,
  disclosure_link,
  ...props
}: SoftwareListItemProps) {
  return (
    <>
      <li>
        <span className="font-semibold">{tool} &mdash;</span>
        &nbsp;
        {link ? (
          <a href={link} target="_blank" rel="noreferrer" className="underline">
            {name}
          </a>
        ) : (
          name
        )}
      </li>
      <li className="ml-4">{description}</li>
      {disclosure_link && (
        <TanstackLink to={disclosure_link} className="underline ml-4">
          Read about my policy here
        </TanstackLink>
      )}
    </>
  );
}
