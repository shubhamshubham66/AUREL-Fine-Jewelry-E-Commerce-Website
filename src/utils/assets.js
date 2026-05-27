/**
 * Asset URL helper for AUREL.
 *
 * Why this exists:
 *   Vite's `base` config (set to "/AUREL-Fine-Jewelry-E-Commerce-Website/" in
 *   production) automatically prefixes static imports and bundled assets, but
 *   it does NOT touch raw strings that live in JS data (e.g. product.image,
 *   product.model3D). Those strings still start with "/" and resolve to the
 *   server root — which on GitHub Pages is *not* the site root.
 *
 *   Wrap any runtime path that points into /public with `asset()` and it will
 *   resolve correctly in both dev and production.
 *
 * Examples:
 *   asset("/models/ring.glb")      -> "/AUREL-Fine-Jewelry-E-Commerce-Website/models/ring.glb"
 *   asset("models/ring.glb")       -> "/AUREL-Fine-Jewelry-E-Commerce-Website/models/ring.glb"
 *   asset("https://cdn.com/x.png") -> "https://cdn.com/x.png"  (untouched)
 *   asset(undefined)               -> undefined
 */

export const BASE_URL = import.meta.env.BASE_URL;

export function asset(path) {
  if (!path) return path;
  if (typeof path !== 'string') return path;
  // Pass external / data / blob URLs through untouched.
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  // Strip any leading slashes so we don't end up with "//".
  const clean = path.replace(/^\/+/, '');
  return `${BASE_URL}${clean}`;
}
