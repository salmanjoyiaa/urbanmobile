import { siteConfig } from "@/config/site";

/**
 * Anonymous customer → seller WhatsApp prefilled text (no PII; customer introduces themselves in chat).
 */
export function formatProductContactWhatsAppBody(params: { productTitle: string; productUrl: string }): string {
  const brand = siteConfig.name;
  const lines = [
    `Hello,`,
    ``,
    `I found your listing on ${brand} and would like more information.`,
    ``,
    params.productTitle,
    params.productUrl,
    ``,
    `Thank you.`,
  ];
  return lines.join("\n");
}

/** E.164 or digits; returns digits only for wa.me */
export function phoneToWhatsAppDigits(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return null;
  return digits;
}

export function buildProductLeadWhatsAppUrl(sellerPhone: string, messageBody: string): string | null {
  const digits = phoneToWhatsAppDigits(sellerPhone);
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(messageBody)}`;
}

/** tel: URI for device dialer (E.164 preferred) */
export function buildTelUrl(phoneE164: string): string | null {
  const trimmed = phoneE164.trim();
  if (!trimmed) return null;
  const digits = phoneToWhatsAppDigits(trimmed);
  if (!digits) return null;
  return `tel:+${digits}`;
}
