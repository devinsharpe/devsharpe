import type { LinkSeed, SiteSeed } from "../types";

// The header, and /links. The biography is content/biography.md.

export const site: SiteSeed = {
  subtitle: "Senior Software Engineer & (Amateur) Photographer",
  // linksBio: "A short line under the name on /links.",
};

/** /links, in display order. The page's photo comes from the media library, so it isn't seeded. */
export const links: LinkSeed[] = [
  { title: "Digital Queer Collective", url: "https://dqc.dev" },
  { title: "DQC3", url: "https://dqc3.org" },
  { title: "HHH Radio", url: "https://hhhradio.com" },
  { title: "My Photography Work", url: "/photography" },
];
