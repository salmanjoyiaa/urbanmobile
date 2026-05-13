import { NextResponse } from "next/server";

/**
 * Legacy buy-request endpoint. Product contact is now anonymous via POST /api/products/[id]/contact.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "This endpoint is no longer used. Contact actions are recorded via POST /api/products/{productId}/contact with body { \"channel\": \"whatsapp\" | \"phone\" }.",
    },
    { status: 410 }
  );
}
