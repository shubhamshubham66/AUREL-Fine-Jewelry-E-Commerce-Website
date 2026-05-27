/**
 * Asset path utilities for AUREL.
 *
 * Vite's `import.meta.env.BASE_URL` resolves to whatever was set in vite.config.js
 *   - Local dev:  "/"
 *   - GitHub Pages build: "/AUREL-Fine-Jewelry-E-Commerce-Website/"
 *
 * Use these helpers any time you reference a file inside /public so the URL
 * is correct in BOTH environments.
 */

export const BASE_URL = import.meta.env.BASE_URL;

/**
 * Resolve a path relative to /public so it works in dev and on GitHub Pages.
 *
 * Examples:
 *   asset("images/ring.jpg")    -> "/AUREL-Fine-Jewelry-E-Commerce-Website/images/ring.jpg"
 *   asset("/images/ring.jpg")   -> "/AUREL-Fine-Jewelry-E-Commerce-Website/images/ring.jpg"
 *   asset("https://...")        -> "https://..."  (untouched)
 *   asset("data:image/...")     -> "data:image/..." (untouched)
 *   asset("")                   -> ""
 */
export function asset(path) {
  if (!path) return path;
  if (typeof path !== 'string') return path;
  // Pass-through absolute / external / data URLs untouched
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  // Strip any leading slashes so we don't end up with "//"
  const clean = path.replace(/^\/+/, '');
  return `${BASE_URL}${clean}`;
}

/**
 * Resolve a 3D model path under /public/models.
 *   model("ring.glb") -> "/AUREL-Fine-Jewelry-E-Commerce-Website/models/ring.glb"
 */
export function model(filename) {
  if (!filename) return null;
  return asset(`models/${filename.replace(/^\/+/, '')}`);
}

/**
 * Resolve an image path under /public/images.
 *   image("hero.jpg") -> "/AUREL-Fine-Jewelry-E-Commerce-Website/images/hero.jpg"
 */
export function image(filename) {
  if (!filename) return filename;
  if (/^(https?:|data:|blob:)/i.test(filename)) return filename;
  return asset(`images/${filename.replace(/^\/+/, '')}`);
}
