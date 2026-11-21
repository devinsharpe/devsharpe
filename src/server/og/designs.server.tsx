// Server-only: the share card and the site icon, drawn by render.server.ts.
// These are satori element trees, not page components: styles are inline,
// layout is flexbox, and every element with more than one child needs
// `display: flex` (or block).

/** The site's dark theme: Tailwind's neutral-900 and neutral-100. */
const BACKGROUND = "#171717";
const FOREGROUND = "#f5f5f5";
const MUTED = "rgba(245, 245, 245, 0.7)";
const RULE = "#404040";

/** Open Graph's recommended size, shown at 1.91:1 by most sites. */
export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;

export interface ShareCardContent {
  /** The site's name, top left. */
  brand: string;
  /** The site's host, top right (e.g. devsharpe.io). */
  host: string;
  /** The crumbs above the page, e.g. ["Photography", "Test Roll"]. */
  section: string[];
  /** The page's own crumb, or the subtitle on the home page. */
  title: string;
}

/** Big for a short title, smaller as it grows; it's cut at three lines. */
function titleSize(title: string) {
  if (title.length <= 24) return 104;
  if (title.length <= 48) return 84;
  return 68;
}

/** lucide's chevron-right, the breadcrumbs' separator. */
function Chevron() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke={MUTED}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function ShareCard({ brand, host, section, title }: ShareCardContent) {
  return (
    <div
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        // satori's default is content-box: the padding would widen the card.
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        backgroundColor: BACKGROUND,
        color: FOREGROUND,
        fontFamily: "Nudica",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 32,
          paddingBottom: 28,
          borderBottom: `1px solid ${RULE}`,
          fontSize: 30,
        }}
      >
        <div style={{ display: "block", textTransform: "uppercase" }}>
          {brand}
        </div>
        <div style={{ display: "block", color: MUTED }}>{host}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {section.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              color: MUTED,
              fontSize: 30,
              textTransform: "uppercase",
            }}
          >
            {section.map((crumb, index) => (
              <div
                key={index}
                style={{ display: "flex", alignItems: "center", gap: 14 }}
              >
                {index > 0 && <Chevron />}
                <div style={{ display: "block" }}>{crumb}</div>
              </div>
            ))}
          </div>
        )}
        <div
          style={{
            display: "block",
            fontSize: titleSize(title),
            lineHeight: 1.05,
            textTransform: "uppercase",
            lineClamp: 3,
          }}
        >
          {title}
        </div>
      </div>
    </div>
  );
}

/**
 * The site's initials, from its name: the first letters of its first and
 * last words (one letter for a one-word name).
 */
export function siteInitials(site_title: string) {
  const words = site_title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = Array.from(words[0])[0];
  const last = words.length > 1 ? Array.from(words.at(-1)!)[0] : "";
  return (first + last).toUpperCase();
}

/** The favicon: the site's initials on a square, `size` pixels across. */
export function SiteIcon({
  initials,
  size,
}: {
  initials: string;
  size: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: BACKGROUND,
        color: FOREGROUND,
        fontFamily: "Nudica",
        fontSize: Math.round(size * (initials.length > 1 ? 0.5 : 0.66)),
        lineHeight: 1,
        letterSpacing: Math.round(size * -0.02),
      }}
    >
      {initials}
    </div>
  );
}
