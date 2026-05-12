/**
 * Customer → seller WhatsApp deep link for product inquiries (wa.me).
 */

export function formatProductLeadWhatsAppBody(params: {
  buyerName: string;
  buyerPhone: string;
  productTitle: string;
  productUrl: string;
  leadId: string;
}): string {
  const lines = [
    `Hello — I'm interested in your listing on UrbanSaudi.`,
    ``,
    `Product: ${params.productTitle}`,
    `Link: ${params.productUrl}`,
    ``,
    `My name: ${params.buyerName}`,
    `My WhatsApp: ${params.buyerPhone}`,
    ``,
    `Reference (for your dashboard): ${params.leadId}`,
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
