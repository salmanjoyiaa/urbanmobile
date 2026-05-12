import { siteConfig } from "@/config/site";

/**
 * Customer → seller WhatsApp deep link for product inquiries (wa.me).
 * Written as the buyer addressing the seller (message is sent from the buyer's WhatsApp).
 */

export function formatProductLeadWhatsAppBody(params: {
  buyerName: string;
  buyerPhone: string;
  productTitle: string;
  productUrl: string;
  leadId: string;
}): string {
  const brand = siteConfig.name;
  const lines = [
    `Hello,`,
    ``,
    `I am contacting you through ${brand} regarding this listing:`,
    ``,
    params.productTitle,
    params.productUrl,
    ``,
    `My details:`,
    `Name: ${params.buyerName}`,
    `Phone: ${params.buyerPhone}`,
    ``,
    `Lead reference ID:`,
    params.leadId,
    `(You can find this inquiry under Buy requests in your seller dashboard.)`,
    ``,
    `Thank you,`,
    params.buyerName,
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
