const DATE_TIME_FORMAT = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

/** Formats a date and time for display, e.g. "Nov 19, 2026, 4:12 PM". */
export function formatLocalTime(date: Date) {
  return DATE_TIME_FORMAT.format(date);
}

/**
 * A date and time in the viewer's locale and time zone. The server may render
 * it differently, so the text mismatch on hydration is expected.
 */
export function LocalTime({ date }: { date: Date }) {
  return (
    <time dateTime={date.toISOString()} suppressHydrationWarning>
      {formatLocalTime(date)}
    </time>
  );
}
