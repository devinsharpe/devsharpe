// Server-only: the images a rich-text document shows. Documents store only
// media ids, so pages resolve them here when they load (see RichTextRenderer's
// `media`), with imgproxy URLs signed on the server.
import {
  collectMediaIds,
  type RichTextDocument,
  type RichTextMediaMap,
} from "../../lib/rich-text";
import type { MediaRepository } from "../repositories/media.repository.server";
import { getImgproxy } from "./imgproxy.server";
import { toResponsiveImage } from "./media-views.server";

/**
 * The images in these documents, by media id. Deleted images are left out,
 * and so is everything while imgproxy isn't configured, so pages skip them.
 */
export async function resolveRichTextMedia(
  repo: MediaRepository,
  documents: ReadonlyArray<RichTextDocument | null | undefined>,
): Promise<RichTextMediaMap> {
  const ids = collectMediaIds(documents);
  if (ids.length === 0) return {};
  const { imgproxy } = getImgproxy();
  if (!imgproxy) return {};
  const rows = await repo.listReadyMediaByIds(ids);
  return Object.fromEntries(
    rows.map((row) => [
      row.id,
      {
        alt: row.altText,
        caption: row.caption,
        image: toResponsiveImage(imgproxy, row),
      },
    ]),
  );
}
