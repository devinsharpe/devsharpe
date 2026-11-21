import type { ComponentProps } from "react";

/** A rendered size set from the server (see toResponsiveImage). */
export interface ResponsiveImageSource {
  src: string;
  srcSet: string;
  width: number | null;
  height: number | null;
}

interface MediaImageProps extends Omit<
  ComponentProps<"img">,
  "src" | "srcSet" | "sizes" | "width" | "height" | "alt"
> {
  image: ResponsiveImageSource;
  /** Describe the image; pass "" only when it's purely decorative. */
  alt: string;
  /** How wide it's shown, so the browser picks the right size, e.g. "(min-width: 48rem) 46rem, 100vw". */
  sizes: string;
}

/**
 * An uploaded image served through imgproxy. The browser picks a size from
 * `srcSet`; width and height reserve its space so the page doesn't jump.
 */
export function MediaImage({ image, alt, sizes, ...props }: MediaImageProps) {
  return (
    <img
      src={image.src}
      srcSet={image.srcSet}
      sizes={sizes}
      width={image.width ?? undefined}
      height={image.height ?? undefined}
      alt={alt}
      decoding="async"
      {...props}
    />
  );
}
