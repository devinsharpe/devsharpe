import { createFileRoute, Link as TanstackLink } from "@tanstack/react-router";
import { buttonVariants } from "~/components/_ui/button";
import { LinkBrandIcon } from "~/components/links/link-icon";
import { recordLinkClick } from "~/components/links/record-link-click";
import { MediaImage } from "~/components/media/media-image";
import { pageMeta } from "~/lib/share";
import { cn } from "~/lib/utils";
import { getLinksPage } from "~/server/functions/links.functions";

export const Route = createFileRoute("/links")({
  // Shown on its own, without the site's header and footer (see __root).
  staticData: { is_standalone: true },
  loader: () => getLinksPage(),
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { title, bio, share_image } = loaderData;
    return {
      meta: pageMeta({ title, description: bio, image: share_image }),
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { title, bio, photo, links } = Route.useLoaderData();

  return (
    <>
      <main className="mx-auto flex w-full max-w-md grow flex-col items-center gap-6 px-6 pt-16 pb-8">
        <div className="flex flex-col items-center gap-3 text-center">
          {photo && (
            <MediaImage
              image={photo.image}
              alt={photo.alt}
              sizes="96px"
              className="size-24 border border-neutral-300 object-cover dark:border-neutral-700"
            />
          )}
          <h1 className="text-2xl font-bold">{title}</h1>
          {bio && <p className="opacity-80">{bio}</p>}
        </div>
        {links.length > 0 ? (
          <ul className="flex w-full flex-col gap-3">
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  // Counted on any way of following it: click, ⌘/Ctrl-click,
                  // or middle click (auxclick also fires for right clicks).
                  onClick={() => recordLinkClick(link.id)}
                  onAuxClick={(e) => e.button === 1 && recordLinkClick(link.id)}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    // Grows past h-12 when a long title wraps.
                    "h-auto min-h-12 w-full justify-center whitespace-normal py-2 text-center",
                  )}
                >
                  <LinkBrandIcon url={link.url} className="shrink-0" />
                  <span className="min-w-0 break-words">{link.title}</span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="italic opacity-80">No links yet.</p>
        )}
      </main>
      <footer className="px-6 pb-8 text-center text-sm">
        <TanstackLink to="/" className="opacity-80 hover:underline hover:opacity-100">
          {title}
        </TanstackLink>
      </footer>
    </>
  );
}
