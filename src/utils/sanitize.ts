import DOMPurify from 'dompurify';
import type { Config as DOMPurifyConfig } from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * This is critical when rendering user-generated content or rich text from the editor
 */

interface SanitizeOptions {
  // Allow specific tags and attributes beyond the default safe list
  ALLOWED_TAGS?: string[];
  ALLOWED_ATTR?: string[];
  // Whether to return HTML as a string (default) or DOM Node
  RETURN_DOM?: boolean;
}

/**
 * Default configuration for DOMPurify
 * Allows common HTML formatting tags used in blog articles
 */
const DEFAULT_CONFIG: DOMPurifyConfig = {
  ALLOWED_TAGS: [
    // Text formatting
    'p', 'br', 'strong', 'em', 'u', 's', 'strike', 'del', 'ins',
    // Headings
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    // Lists
    'ul', 'ol', 'li',
    // Quotes and code
    'blockquote', 'pre', 'code',
    // Links
    'a',
    // Media (controlled by react-quill)
    'img', 'video',
    // Semantic
    'div', 'span',
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel', // links
    'src', 'alt', 'width', 'height', // images
    'controls', 'autoplay', 'loop', 'muted', // video
    'class', // styling
  ],
  // Ensure links open safely
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ['target', 'rel'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
};

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param dirty - The potentially unsafe HTML content
 * @param options - Optional configuration to override defaults
 * @returns Sanitized HTML string safe to render
 */
export function sanitizeHtml(dirty: string, options?: SanitizeOptions): string {
  if (!dirty) return '';
  
  const config = {
    ...DEFAULT_CONFIG,
    ...options,
  };

  // Sanitize the content
  const clean = DOMPurify.sanitize(dirty, config);
  
  return clean as string;
}

/**
 * Sanitize HTML content specifically for article content
 * Includes additional checks for link safety
 * @param content - Article HTML content from rich text editor
 * @returns Sanitized article content
 */
export function sanitizeArticleContent(content: string): string {
  const sanitized = sanitizeHtml(content, {
    // Add hook to make external links safe
    RETURN_DOM: false,
  });

  // Additional processing: ensure external links have rel="noopener noreferrer"
  const parser = new DOMParser();
  const doc = parser.parseFromString(sanitized, 'text/html');
  const links = doc.querySelectorAll('a[href]');
  
  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });

  return doc.body.innerHTML;
}

/**
 * Sanitize text content by stripping all HTML tags
 * Useful for excerpts, meta descriptions, etc.
 * @param html - HTML content
 * @returns Plain text without HTML tags
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  
  // First sanitize, then strip all tags
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true,
  });
  
  // Remove extra whitespace
  return sanitized.replace(/\s+/g, ' ').trim();
}

/**
 * Truncate text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Generate safe excerpt from HTML content
 * @param html - HTML content
 * @param maxLength - Maximum length of excerpt
 * @returns Plain text excerpt
 */
export function generateSafeExcerpt(html: string, maxLength = 200): string {
  const plainText = stripHtml(html);
  return truncateText(plainText, maxLength);
}
