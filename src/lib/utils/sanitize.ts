/**
 * HTML Sanitization Utility
 * Sanitizes HTML content to prevent XSS attacks
 */

// Use isomorphic-dompurify which works in both server and client environments
import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param dirty - The unsanitized HTML string
 * @param options - Optional DOMPurify configuration
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHTML(
  dirty: string | null | undefined,
  options?: {
    allowImages?: boolean;
    allowLinks?: boolean;
    allowTables?: boolean;
    allowLists?: boolean;
  }
): string {
  if (!dirty) {
    return '';
  }

  const defaultConfig = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre', 'hr', 'div', 'span', 'section', 'article'
    ],
    ALLOWED_ATTR: ['class', 'style', 'id'],
    ALLOW_DATA_ATTR: false,
  };

  // Add images if allowed
  if (options?.allowImages) {
    defaultConfig.ALLOWED_TAGS.push('img');
    defaultConfig.ALLOWED_ATTR.push('src', 'alt', 'width', 'height', 'title');
  }

  // Add links if allowed
  if (options?.allowLinks) {
    defaultConfig.ALLOWED_TAGS.push('a');
    defaultConfig.ALLOWED_ATTR.push('href', 'target', 'rel', 'title');
  }

  // Add tables if allowed
  if (options?.allowTables) {
    defaultConfig.ALLOWED_TAGS.push(
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col'
    );
    defaultConfig.ALLOWED_ATTR.push('colspan', 'rowspan', 'scope');
  }

  // Add lists if allowed
  if (options?.allowLists) {
    defaultConfig.ALLOWED_TAGS.push('ul', 'ol', 'li', 'dl', 'dt', 'dd');
  }

  // Sanitize styles to only allow safe CSS properties
  const sanitizeConfig = {
    ...defaultConfig,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  };

  return DOMPurify.sanitize(dirty, sanitizeConfig);
}

/**
 * Sanitizes HTML content for article content (allows images, links, lists, tables)
 */
export function sanitizeArticleContent(content: string | null | undefined): string {
  return sanitizeHTML(content, {
    allowImages: true,
    allowLinks: true,
    allowTables: true,
    allowLists: true,
  });
}

/**
 * Sanitizes HTML content for page content (allows images, links, lists, tables)
 */
export function sanitizePageContent(content: string | null | undefined): string {
  return sanitizeHTML(content, {
    allowImages: true,
    allowLinks: true,
    allowTables: true,
    allowLists: true,
  });
}

