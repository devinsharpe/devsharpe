import type { ComponentProps } from "react";

// Fixed locale and zone so the server and browser render the same text.
const PUBLISHED_FORMAT = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
  timeZone: "UTC",
});

interface PublishedDateProps extends Omit<ComponentProps<"time">, "dateTime"> {
  date: Date;
}

/** A public-facing date such as "November 19, 2026", identical on server and client. */
export function PublishedDate({ date, ...props }: PublishedDateProps) {
  return (
    <time dateTime={date.toISOString()} {...props}>
      {PUBLISHED_FORMAT.format(date)}
    </time>
  );
}
