import { hasRichTextContent } from "~/lib/rich-text";
import type { getBiography } from "~/server/functions/about.functions";
import type { getSubtitleSetting } from "~/server/functions/site.functions";
import { LocalTime } from "./_ui/local-time";
import { RICH_TEXT_PROSE } from "./rich-text/rich-text-classes";
import { RichTextRenderer } from "./rich-text/rich-text-renderer";

interface BiographyPreviewProps {
  header: Awaited<ReturnType<typeof getSubtitleSetting>>;
  biography: Awaited<ReturnType<typeof getBiography>>;
}

/** Read-only view of the header subtitle and homepage biography, as visitors see them. */
export function BiographyPreview({ header, biography }: BiographyPreviewProps) {
  const has_biography = !!biography && hasRichTextContent(biography.content);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">Header</h3>
        {/* Mirrors the title block in the site header. */}
        <div className="border border-neutral-300 dark:border-neutral-700 p-3 flex flex-col">
          <p className="font-bold uppercase lg:text-lg">{header.title}</p>
          {header.subtitle ? (
            <p className="opacity-80 text-sm">{header.subtitle}</p>
          ) : (
            <p className="italic opacity-80 text-sm">No subtitle</p>
          )}
        </div>
        {header.is_default && (
          <p className="text-sm opacity-80">
            The subtitle is still the SITE_SUBTITLE default.
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">Current Biography</h3>
        {has_biography ? (
          <>
            <p className="text-sm opacity-80">
              Live on the homepage · saved <LocalTime date={biography.updatedAt} />
            </p>
            <div className="border border-neutral-300 dark:border-neutral-700 p-4">
              <RichTextRenderer
                document={biography.content}
                media={biography.media}
                className={RICH_TEXT_PROSE}
              />
            </div>
          </>
        ) : (
          <p className="italic opacity-80">
            No biography yet. The homepage shows "hey..." until you write one.
          </p>
        )}
      </div>
    </div>
  );
}
