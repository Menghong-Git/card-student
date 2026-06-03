"use client";

/**
 * Brain Bridge School logo loader.
 *
 * The card is exported by serializing its SVG and rasterizing it through a
 * canvas. A plain `<image href="/logo.png">` will NOT load in that pipeline —
 * an SVG loaded as an <img> runs in a restricted mode that blocks external
 * resources. So the logo must be embedded as a base64 data URI.
 *
 * We fetch the public PNG once, convert it to a data URI, and cache the
 * promise so every card (preview + bulk export) reuses the same string.
 */
const LOGO_URL = "/brain-bridge-logo.png";

const cache = new Map<string, Promise<string>>();

/**
 * Fetch a public image once and return it as a base64 data URI, caching the
 * promise so every card (preview + bulk export) reuses the same string.
 * The data URI is required because the export pipeline rasterizes the card SVG
 * through an <img>, which runs in a restricted mode that blocks external
 * `href="/foo.png"` resources.
 */
export function loadImageDataUrl(url: string): Promise<string> {
  const existing = cache.get(url);
  if (existing) return existing;
  const promise = fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error(
          `Image not found at ${url} (HTTP ${res.status}). ` +
            `Save the file to public${url}.`,
        );
      }
      return res.blob();
    })
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error(`Failed to read image ${url}`));
          reader.readAsDataURL(blob);
        }),
    )
    .catch((err) => {
      cache.delete(url); // allow a later retry instead of caching the failure
      throw err;
    });
  cache.set(url, promise);
  return promise;
}

/** Brain Bridge School logo as a base64 data URI. */
export function loadLogoDataUrl(): Promise<string> {
  return loadImageDataUrl(LOGO_URL);
}
