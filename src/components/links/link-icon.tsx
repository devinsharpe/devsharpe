import {
  SiApplemusic,
  SiBandcamp,
  SiBehance,
  SiBluesky,
  SiBuymeacoffee,
  SiDiscord,
  SiDribbble,
  SiFacebook,
  SiFlickr,
  SiGithub,
  SiGitlab,
  SiGlass,
  SiGoodreads,
  SiInstagram,
  SiKofi,
  SiLetterboxd,
  SiMastodon,
  SiMedium,
  SiNpm,
  SiPatreon,
  SiPixelfed,
  SiReddit,
  SiSoundcloud,
  SiSpotify,
  SiStrava,
  SiSubstack,
  SiThreads,
  SiTiktok,
  SiTwitch,
  SiUnsplash,
  SiVimeo,
  SiVsco,
  SiX,
  SiYoutube,
} from "@icons-pack/react-simple-icons";
import { LinkIcon, MailIcon, PhoneIcon } from "lucide-react";
import type { ComponentType } from "react";

type BrandIcon = ComponentType<{
  size?: number;
  title?: string;
  className?: string;
  "aria-hidden"?: boolean;
}>;

/** Sites with their own icon, by domain (subdomains match too). */
const BRAND_ICONS: Array<[domains: string[], icon: BrandIcon]> = [
  [["github.com"], SiGithub],
  [["gitlab.com"], SiGitlab],
  [["instagram.com"], SiInstagram],
  [["x.com", "twitter.com"], SiX],
  [["bsky.app"], SiBluesky],
  [["mastodon.social", "mastodon.online", "mstdn.social"], SiMastodon],
  [["threads.net", "threads.com"], SiThreads],
  [["youtube.com", "youtu.be"], SiYoutube],
  [["tiktok.com"], SiTiktok],
  [["twitch.tv"], SiTwitch],
  [["vimeo.com"], SiVimeo],
  [["spotify.com"], SiSpotify],
  [["music.apple.com"], SiApplemusic],
  [["soundcloud.com"], SiSoundcloud],
  [["bandcamp.com"], SiBandcamp],
  [["discord.com", "discord.gg"], SiDiscord],
  [["facebook.com", "fb.com"], SiFacebook],
  [["reddit.com"], SiReddit],
  [["letterboxd.com", "boxd.it"], SiLetterboxd],
  [["goodreads.com"], SiGoodreads],
  [["strava.com"], SiStrava],
  [["flickr.com"], SiFlickr],
  [["vsco.co"], SiVsco],
  [["glass.photo"], SiGlass],
  [["unsplash.com"], SiUnsplash],
  [["pixelfed.social"], SiPixelfed],
  [["behance.net"], SiBehance],
  [["dribbble.com"], SiDribbble],
  [["substack.com"], SiSubstack],
  [["medium.com"], SiMedium],
  [["ko-fi.com"], SiKofi],
  [["patreon.com"], SiPatreon],
  [["buymeacoffee.com"], SiBuymeacoffee],
  [["npmjs.com"], SiNpm],
];

function iconFor(url: string): BrandIcon | null {
  if (url.startsWith("/")) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol === "mailto:") return MailIcon;
  if (parsed.protocol === "tel:") return PhoneIcon;
  const host = parsed.hostname.toLowerCase();
  const match = BRAND_ICONS.find(([domains]) =>
    domains.some((domain) => host === domain || host.endsWith(`.${domain}`)),
  );
  return match?.[1] ?? null;
}

interface LinkBrandIconProps {
  url: string;
  size?: number;
  className?: string;
}

/**
 * The icon for where a link goes: the site's logo for well-known sites, an
 * envelope or phone for mailto: and tel:, otherwise a plain link. Decorative:
 * the link's title says where it goes.
 */
export function LinkBrandIcon({ url, size = 16, className }: LinkBrandIconProps) {
  const Icon = iconFor(url);
  if (!Icon) {
    return (
      <LinkIcon strokeWidth={1.5} size={size} className={className} aria-hidden />
    );
  }
  // Brand icons carry a <title> with the site's name; blank it so it isn't
  // read out (or shown as a tooltip) next to the link's own title.
  return <Icon size={size} title="" className={className} aria-hidden />;
}
