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
  visitingAgentName?: string | null;
  visitingAgentPhone?: string | null;
  propertyId?: string | null;
}) {
  const mapHtml = params.locationUrl
    ? detail("Google Maps", `<a href="${params.locationUrl}" style="color:${BRAND_COLOR}">${params.locationUrl}</a>`)
    : "";
  const agentHtml = params.visitingAgentName
    ? detail("Visiting Agent", `${params.visitingAgentName}${params.visitingAgentPhone ? `&nbsp;&nbsp;<strong>Contact:</strong> ${params.visitingAgentPhone}` : ""}`)
    : "";
  const propIdHtml = params.propertyId ? detail("Property ID", params.propertyId) : "";
  return {
    subject: `Visit Confirmed — ${params.propertyTitle}`,
    html: layout(`
      ${heading("Your visit has been confirmed")}
      ${paragraph(`Hello ${params.visitorName},`)}
      ${paragraph("Thank you for choosing TheUrbanRealEstateSaudi!")}
      ${paragraph(`We are pleased to inform you that your upcoming property visit for <strong>"${params.propertyTitle}"</strong> has been officially confirmed.`)}
      ${divider()}
      ${paragraph("Your visit is scheduled on")}
      ${propIdHtml}
      ${detail("Date", params.visitDate)}
      ${detail("Visiting Time", params.visitTime)}
      ${agentHtml}
      ${mapHtml ? `${paragraph("The location of the property on Google Maps is:")}${mapHtml}` : ""}
      ${divider()}
      ${paragraph("We look forward to showing you the property!")}
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

export function visitAssignedVisitingAgentEmail(params: {
  visitingAgentName: string;
  propertyTitle: string;
  visitDate: string;
  visitTime: string;
  visitorName: string;
  visitorPhone: string;
  ownerName: string;
  ownerPhone: string;
  locationUrl?: string | null;
  instructions?: string | null;
  image?: string | null;
  propertyId?: string | null;
}) {
  const mapHtml = params.locationUrl
    ? detail("Google Map Link", `<a href="${params.locationUrl}" style="color:${BRAND_COLOR}">${params.locationUrl}</a>`)
    : "";
  const instHtml = params.instructions
    ? detail("Confidential Property Instructions", `<div style="white-space: pre-wrap; margin-top: 4px; border-left: 2px solid ${BRAND_COLOR}; padding-left: 8px;">${params.instructions}</div>`)
    : "";
  const imgHtml = params.image
    ? detail("Property Front Door Photo", `<a href="${params.image}" style="color:${BRAND_COLOR}">${params.image}</a>`)
    : "";
  const propIdHtml = params.propertyId ? detail("Property ID", params.propertyId) : "";

  return {
    subject: `New Visit Assigned — ${params.propertyTitle}`,
    html: layout(`
      ${heading("New property visit assigned to you")}
      ${paragraph(`Hello ${params.visitingAgentName},`)}
      ${paragraph("This is a notification from TheUrbanRealEstateSaudi to let you know that you have been assigned to a new property visit. Please review the details below.")}
      ${divider()}
      ${detail("Property Name", `"${params.propertyTitle}"`)}
      ${propIdHtml}
      ${detail("Date of Visit", params.visitDate)}
      ${detail("Time of Visit", params.visitTime)}
      ${divider()}
      ${paragraph("<strong>Client Details:</strong>")}
      ${detail("Customer Name", params.visitorName)}
      ${detail("Customer Phone", params.visitorPhone)}
      ${divider()}
      ${paragraph("<strong>Listing Agent Details:</strong>")}
      ${detail("Property Agent", params.ownerName)}
      ${detail("Agent Phone", params.ownerPhone)}
      ${mapHtml}
      ${instHtml}
      ${imgHtml}
      ${divider()}
      ${paragraph("Please ensure you arrive early and contact the customer if necessary.")}
    `),
  };
}

export function visitAssignedPropertyAgentEmail(params: {
  ownerName: string;
  propertyTitle: string;
  visitDate: string;
  visitTime: string;
  visitorName: string;
  visitingAgentName: string;
  visitingAgentPhone?: string | null;
  locationUrl?: string | null;
  propertyId?: string | null;
}) {
  const mapHtml = params.locationUrl
    ? detail("Property Map", `<a href="${params.locationUrl}" style="color:${BRAND_COLOR}">${params.locationUrl}</a>`)
    : "";
  const propIdHtml = params.propertyId ? detail("Property ID", params.propertyId) : "";
  const vaPhoneHtml = params.visitingAgentPhone ? detail("Visiting Agent Contact", params.visitingAgentPhone) : "";
  return {
    subject: `Visit Confirmed & Assigned — ${params.propertyTitle}`,
    html: layout(`
      ${heading("Visit confirmed for your property")}
      ${paragraph(`Hello ${params.ownerName},`)}
      ${paragraph("Great news! We have successfully scheduled a confirmed visit booking for your listed property.")}
      ${paragraph("Here are the details for the upcoming viewing:")}
      ${divider()}
      ${propIdHtml}
      ${detail("Customer Name", params.visitorName)}
      ${detail("Assigned Visiting Agent", params.visitingAgentName)}
      ${vaPhoneHtml}
      ${mapHtml}
      ${divider()}
      ${paragraph("The designated visiting agent will handle the tour on your behalf.")}
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

// ── Day Visit Summary Email ──

export function dayVisitsSummaryEmail(params: {
  agentName: string;
  date: string;
  /** When true, show visiting agent name/phone per visit and do not show visitor/customer details. */
  forPropertyAgent?: boolean;
  visits: Array<{
    propertyTitle: string;
    visitTime: string;
    visitorName: string;
    visitorPhone?: string | null;
    visitingAgentName?: string | null;
    visitingAgentPhone?: string | null;
  }>;
}) {
  const { forPropertyAgent = false } = params;
  if (params.visits.length === 0) {
    return {
      subject: `Your visits for ${params.date} — UrbanSaudi`,
      html: layout(`
        ${heading(`Your visits for ${params.date}`)}
        ${paragraph(`Hello ${params.agentName},`)}
        ${paragraph("You have no visits scheduled on this date.")}
      `),
    };
  }

  const rows = params.visits
    .map((v, i) => {
      if (forPropertyAgent) {
        const visitingAgent = v.visitingAgentPhone
          ? `${v.visitingAgentName ?? "Visiting Agent"} (${v.visitingAgentPhone})`
          : v.visitingAgentName ?? "—";
        return `
        <div style="padding:12px 0;${i > 0 ? "border-top:1px solid #eff3f4;" : ""}">
          <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#0f1419">${i + 1}. ${v.propertyTitle}</p>
          ${detail("Time", v.visitTime)}
          ${detail("Visiting Agent", visitingAgent)}
        </div>`;
      }
      const visitor = v.visitorPhone
        ? `${v.visitorName} (${v.visitorPhone})`
        : v.visitorName;
      return `
        <div style="padding:12px 0;${i > 0 ? "border-top:1px solid #eff3f4;" : ""}">
          <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#0f1419">${i + 1}. ${v.propertyTitle}</p>
          ${detail("Time", v.visitTime)}
          ${detail("Visitor", visitor)}
        </div>`;
    })
    .join("");

  return {
    subject: `Your visits for ${params.date} — UrbanSaudi`,
    html: layout(`
      ${heading(`Your visits for ${params.date}`)}
      ${paragraph(`Hello ${params.agentName},`)}
      ${paragraph(`You have <strong>${params.visits.length}</strong> visit(s) scheduled for this day.`)}
      ${divider()}
      ${rows}
      ${divider()}
      ${paragraph("Please ensure you are prepared for all visits. Contact admin if you need to reschedule.")}
    `),
  };
}
