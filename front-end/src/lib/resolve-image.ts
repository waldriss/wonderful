const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const BROKEN_LOCAL_PRODUCT_PREFIX = "/images/products/";
const DEFAULT_IMAGE = "/images/card.png";

/**
 * Normalise les chemins d'images produits entre assets frontend,
 * images backend stockées sous /storage et anciens chemins seedés manquants.
 */
export function resolveAppImage(src: string | null | undefined, fallback: string = DEFAULT_IMAGE): string {
  if (!src) return fallback;
  if (src.startsWith("data:")) {
    return src;
  }
  if (src.startsWith("http://") || src.startsWith("https://")) {
    try {
      const url = new URL(src);
      return url.pathname.startsWith("/storage/") ? src : fallback;
    } catch {
      return fallback;
    }
  }
  if (src.startsWith(BROKEN_LOCAL_PRODUCT_PREFIX)) {
    return fallback;
  }
  if (src.startsWith("/images/")) {
    return src;
  }
  if (src.startsWith("/storage/")) {
    return `${API_BASE}${src}`;
  }
  if (src.startsWith("/")) {
    return fallback;
  }
  return fallback;
}
