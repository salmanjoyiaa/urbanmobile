/**
 * Input sanitization utilities to prevent XSS and injection attacks
 */

/**
 * Sanitize HTML string to remove potentially dangerous tags and attributes
 */
export function sanitizeHTML(input: string): string {
  if (!input) return "";

  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, "");

  // Remove dangerous tags
  const dangerousTags = ["iframe", "object", "embed", "link", "meta", "style"];
  for (const tag of dangerousTags) {
    const regex = new RegExp(`<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`, "gi");
    sanitized = sanitized.replace(regex, "");
    // Also remove self-closing versions
    sanitized = sanitized.replace(new RegExp(`<${tag}\\b[^>]*/>`, "gi"), "");
  }

  return sanitized;
}

/**
 * Sanitize plain text input (removes all HTML)
 */
export function sanitizeText(input: string): string {
  if (!input) return "";

  // Remove all HTML tags
  let sanitized = input.replace(/<[^>]*>/g, "");

  // Remove dangerous characters (optional based on requirements)
  // This is a conservative approach - only allow alphanumeric, spaces, and basic punctuation
  sanitized = sanitized.replace(/[^\w\s\-'.,@!?&]/g, "");

  return sanitized.trim();
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(input: string): string {
  if (!input) return "";

  return input
    .trim()
    .toLowerCase()
    .replace(/[^\w.\-+@]/g, "");
}

/**
 * Sanitize phone number input
 */
export function sanitizePhone(input: string): string {
  if (!input) return "";

  // Keep only digits and + sign
  return input.replace(/[^\d+]/g, "");
}

/**
 * Sanitize URL input
 */
export function sanitizeURL(input: string): string {
  if (!input) return "";

  try {
    const url = new URL(input);
    // Only allow http and https protocols
    if (!["http:", "https:"].includes(url.protocol)) {
      return "";
    }
    return url.toString();
  } catch {
    return "";
  }
}

/**
 * Escape HTML special characters
 */
export function escapeHTML(input: string): string {
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Sanitize object by recursively sanitizing all string values
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: { sanitizeHTML?: boolean; sanitizeText?: boolean } = {}
): T {
  const sanitized = { ...obj } as Record<string, unknown>;

  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === "string") {
      if (options.sanitizeHTML) {
        sanitized[key] = sanitizeHTML(value);
      } else if (options.sanitizeText) {
        sanitized[key] = sanitizeText(value);
      }
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>, options);
    }
  }

  return sanitized as T;
}
