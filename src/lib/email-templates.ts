const BRAND = "UrbanSaudi";
const BRAND_COLOR = "#1d9bf0";

function layout(content: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f9f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border:1px solid #eff3f4;border-radius:16px;overflow:hidden">
    <div style="padding:24px 32px;border-bottom:1px solid #eff3f4">
      <span style="font-size:20px;font-weight:700;color:#0f1419">${BRAND}</span>
    </div>
    <div style="padding:32px">
      ${content}
    </div>
    <div style="padding:16px 32px;background:#f7f9f9;border-top:1px solid #eff3f4;text-align:center">
      <p style="margin:0;font-size:12px;color:#536471">&copy; ${new Date().getFullYear()} ${BRAND}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

function heading(text: string) {
  return `<h2 style="margin:0 0 16px;font-size:18px;font-weight:700;color:#0f1419">${text}</h2>`;
}

function paragraph(text: string) {
  return `<p style="margin:0 0 12px;font-size:15px;line-height:1.5;color:#0f1419">${text}</p>`;
}

function detail(label: string, value: string) {
  return `<p style="margin:0 0 8px;font-size:14px;color:#536471"><strong style="color:#0f1419">${label}:</strong> ${value}</p>`;
}

function divider() {
  return `<hr style="border:none;border-top:1px solid #eff3f4;margin:20px 0">`;
}

// ── Visit Request Emails ──

export function visitConfirmedCustomerEmail(params: {
  visitorName: string;
  propertyTitle: string;
  visitDate: string;
  visitTime: string;
  locationUrl?: string | null;
}) {
  const mapHtml = params.locationUrl
    ? detail("Property Map", `<a href="${params.locationUrl}" style="color:${BRAND_COLOR}">${params.locationUrl}</a>`)
    : "";

  return {
    subject: `Visit Confirmed — ${params.propertyTitle}`,
    html: layout(`
      ${heading("Your visit has been confirmed")}
      ${paragraph(`Hello ${params.visitorName},`)}
      ${paragraph("Your property visit request has been approved by our team.")}
      ${divider()}
      ${detail("Property", params.propertyTitle)}
      ${detail("Date", params.visitDate)}
      ${detail("Time", params.visitTime)}
      ${mapHtml}
      ${divider()}
      ${paragraph("Please arrive on time. If you need to reschedule, contact us.")}
    `),
  };
}

export function visitConfirmedAgentEmail(params: {
  agentName: string;
  propertyTitle: string;
  visitorName: string;
  visitDate: string;
  visitTime: string;
  locationUrl?: string | null;
}) {
  const mapHtml = params.locationUrl
    ? detail("Property Map", `<a href="${params.locationUrl}" style="color:${BRAND_COLOR}">${params.locationUrl}</a>`)
    : "";

  return {
    subject: `Visit Confirmed — ${params.propertyTitle}`,
    html: layout(`
      ${heading("A visit has been confirmed")}
      ${paragraph(`Hello ${params.agentName},`)}
      ${paragraph("A property visit has been confirmed by admin.")}
      ${divider()}
      ${detail("Property", params.propertyTitle)}
      ${detail("Visitor", params.visitorName)}
      ${detail("Date", params.visitDate)}
      ${detail("Time", params.visitTime)}
      ${mapHtml}
      ${divider()}
      ${paragraph("Please ensure the property is ready for the scheduled visit.")}
    `),
  };
}

export function visitCancelledCustomerEmail(params: {
  visitorName: string;
  propertyTitle: string;
  visitDate: string;
  visitTime: string;
}) {
  return {
    subject: `Visit Cancelled — ${params.propertyTitle}`,
    html: layout(`
      ${heading("Your visit has been cancelled")}
      ${paragraph(`Hello ${params.visitorName},`)}
      ${paragraph("Unfortunately, your property visit request has been cancelled.")}
      ${divider()}
      ${detail("Property", params.propertyTitle)}
      ${detail("Date", params.visitDate)}
      ${detail("Time", params.visitTime)}
      ${divider()}
      ${paragraph("You can schedule a new visit at any time on our website.")}
    `),
  };
}

// ── Buy Request Emails ──

export function leadConfirmedCustomerEmail(params: {
  buyerName: string;
  productTitle: string;
}) {
  return {
    subject: `Buy Request Confirmed — ${params.productTitle}`,
    html: layout(`
      ${heading("Your buy request has been confirmed")}
      ${paragraph(`Hello ${params.buyerName},`)}
      ${paragraph("Your purchase request has been approved. The seller will contact you shortly.")}
      ${divider()}
      ${detail("Product", params.productTitle)}
      ${divider()}
      ${paragraph("Thank you for using UrbanSaudi.")}
    `),
  };
}

export function leadConfirmedAgentEmail(params: {
  agentName: string;
  productTitle: string;
  buyerName: string;
}) {
  return {
    subject: `Buy Request Confirmed — ${params.productTitle}`,
    html: layout(`
      ${heading("A buy request has been confirmed")}
      ${paragraph(`Hello ${params.agentName},`)}
      ${paragraph("A buy request for your product has been confirmed by admin.")}
      ${divider()}
      ${detail("Product", params.productTitle)}
      ${detail("Buyer", params.buyerName)}
      ${divider()}
      ${paragraph("Please contact the buyer to arrange the transaction.")}
    `),
  };
}

export function leadRejectedCustomerEmail(params: {
  buyerName: string;
  productTitle: string;
}) {
  return {
    subject: `Buy Request Update — ${params.productTitle}`,
    html: layout(`
      ${heading("Your buy request was not approved")}
      ${paragraph(`Hello ${params.buyerName},`)}
      ${paragraph("Unfortunately, your purchase request could not be approved at this time.")}
      ${divider()}
      ${detail("Product", params.productTitle)}
      ${divider()}
      ${paragraph("Browse more products on our website.")}
    `),
  };
}

// ── Agent Status Emails ──

export function agentApprovedEmail(params: { agentName: string }) {
  return {
    subject: "Your UrbanSaudi Agent Account is Approved",
    html: layout(`
      ${heading("Welcome aboard!")}
      ${paragraph(`Hello ${params.agentName},`)}
      ${paragraph("Your agent account has been approved. You can now access your dashboard to list properties and products.")}
      ${divider()}
      ${paragraph('Log in at <a href="https://urbansaudi.com/login" style="color:' + BRAND_COLOR + '">urbansaudi.com/login</a> to get started.')}
    `),
  };
}

export function agentRejectedEmail(params: {
  agentName: string;
  reason?: string;
}) {
  const reasonText = params.reason
    ? detail("Reason", params.reason)
    : "";
  return {
    subject: "UrbanSaudi Agent Application Update",
    html: layout(`
      ${heading("Application update")}
      ${paragraph(`Hello ${params.agentName},`)}
      ${paragraph("Your agent application was not approved at this time.")}
      ${reasonText ? divider() + reasonText : ""}
      ${divider()}
      ${paragraph("You may reapply with updated documentation.")}
    `),
  };
}

// ── Maintenance Request Emails ──

export function maintenanceApprovedEmail(params: {
  customerName: string;
  serviceType: string;
}) {
  return {
    subject: `Maintenance Request Approved — ${params.serviceType}`,
    html: layout(`
      ${heading("Your maintenance request has been approved")}
      ${paragraph(`Hello ${params.customerName},`)}
      ${paragraph("Your maintenance request has been approved and scheduled by our team.")}
      ${divider()}
      ${detail("Service Type", params.serviceType)}
      ${divider()}
      ${paragraph("Our team will contact you shortly to confirm the timing.")}
    `),
  };
}

export function maintenanceRejectedEmail(params: {
  customerName: string;
  serviceType: string;
}) {
  return {
    subject: `Maintenance Request Update — ${params.serviceType}`,
    html: layout(`
      ${heading("Your maintenance request could not be approved")}
      ${paragraph(`Hello ${params.customerName},`)}
      ${paragraph("Unfortunately, your maintenance request could not be approved at this time.")}
      ${divider()}
      ${detail("Service Type", params.serviceType)}
      ${divider()}
      ${paragraph("Please contact support if you have any questions.")}
    `),
  };
}
