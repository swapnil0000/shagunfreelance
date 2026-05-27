/**
 * Cloudinary delivery helpers.
 *
 * Product images are stored as raw `secure_url`s (full-resolution originals).
 * These helpers inject on-the-fly delivery transforms (resize + auto format +
 * auto quality) so we never ship a multi-megabyte original into a small box.
 *
 * Any non-Cloudinary URL (local placeholder, favicon, etc.) is returned
 * unchanged so callers can use these unconditionally.
 */

const CLOUDINARY_HOST = 'res.cloudinary.com';
const UPLOAD_MARKER = '/upload/';

/**
 * @param {string} url    A Cloudinary secure_url.
 * @param {object} opts   { w, h, q='auto', f='auto', crop='fill' }
 * @returns {string} Transformed URL, or the input unchanged if not Cloudinary.
 */
export function cld(url, { w, h, q = 'auto', f = 'auto', crop = 'fill' } = {}) {
  if (!url || typeof url !== 'string' || !url.includes(CLOUDINARY_HOST)) return url;
  const i = url.indexOf(UPLOAD_MARKER);
  if (i === -1) return url;

  const t = [];
  if (w) t.push(`w_${w}`);
  if (h) t.push(`h_${h}`);
  if (w || h) t.push(`c_${crop}`);
  t.push(`f_${f}`, `q_${q}`);

  const head = url.slice(0, i + UPLOAD_MARKER.length);
  const tail = url.slice(i + UPLOAD_MARKER.length);
  return `${head}${t.join(',')}/${tail}`;
}

/**
 * Build a responsive `srcset` string across the given widths.
 * Returns undefined for non-Cloudinary URLs (so the attribute is omitted).
 *
 * @param {string} url
 * @param {number[]} widths
 * @param {object} opts  Passed through to cld (e.g. { q, f }).
 */
export function cldSrcSet(url, widths, opts = {}) {
  if (!url || typeof url !== 'string' || !url.includes(CLOUDINARY_HOST)) return undefined;
  return widths.map((w) => `${cld(url, { ...opts, w })} ${w}w`).join(', ');
}
