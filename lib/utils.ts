/**
 * Converts a string to a URL-friendly slug
 * - Transliterates umlauts and accented characters (ä→ae, ö→oe, ü→ue, ß→ss, etc.)
 * - Converts to lowercase
 * - Replaces spaces with dashes
 * - Removes or replaces problematic characters (/, \, ?, #, etc.)
 * - Removes multiple consecutive dashes
 * - Trims dashes from start and end
 */
export function slugify(text: string): string {
  // Transliteration map for German umlauts and common accented characters
  const transliterations: { [key: string]: string } = {
    'ä': 'ae',
    'ö': 'oe',
    'ü': 'ue',
    'Ä': 'Ae',
    'Ö': 'Oe',
    'Ü': 'Ue',
    'ß': 'ss',
    'à': 'a',
    'á': 'a',
    'â': 'a',
    'ã': 'a',
    'å': 'a',
    'è': 'e',
    'é': 'e',
    'ê': 'e',
    'ë': 'e',
    'ì': 'i',
    'í': 'i',
    'î': 'i',
    'ï': 'i',
    'ò': 'o',
    'ó': 'o',
    'ô': 'o',
    'õ': 'o',
    'ù': 'u',
    'ú': 'u',
    'û': 'u',
    'ñ': 'n',
    'ç': 'c',
    'ý': 'y',
    'ÿ': 'y'
  };

  return text
    // Transliterate special characters before lowercasing
    .split('')
    .map(char => transliterations[char] || char)
    .join('')
    .toLowerCase()
    .trim()
    // Replace forward slashes, backslashes, and other URL-problematic characters with dashes
    .replace(/[\/\\?#%&+]/g, '-')
    // Replace spaces with dashes
    .replace(/\s+/g, '-')
    // Remove any other special characters that might cause issues
    .replace(/[^\w\-]+/g, '')
    // Replace multiple consecutive dashes with a single dash
    .replace(/-+/g, '-')
    // Remove leading and trailing dashes
    .replace(/^-+|-+$/g, '');
}

/**
 * Converts a slug back to a string with spaces
 * Used when sending slug to API that expects spaces
 */
export function deslugify(slug: string): string {
  return slug.replace(/-/g, ' ');
}

/**
 * Builds a URL with proper locale prefix
 * Omits the locale prefix for English ('en') to avoid duplicate content
 * For other locales, includes the locale prefix (e.g., '/de/path')
 *
 * @param path - The path without locale prefix (e.g., '/brands/dimarzio')
 * @param locale - The current locale (e.g., 'en', 'de')
 * @returns The full path with locale prefix if needed
 *
 * @example
 * buildLocalePath('/brands/dimarzio', 'en') // returns '/brands/dimarzio'
 * buildLocalePath('/brands/dimarzio', 'de') // returns '/de/brands/dimarzio'
 */
export function buildLocalePath(path: string, locale: string): string {
  return locale === 'en' ? path : `/${locale}${path}`;
}
