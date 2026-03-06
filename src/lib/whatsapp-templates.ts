export function visitConfirmedVisitor(params: {
  visitorName: string;
  propertyTitle: string;
  visitDate: string;
  visitTime: string;
  locationUrl?: string | null;
  visitingAgentName?: string | null;
  visitingAgentPhone?: string | null;
}) {
  const agentText = params.visitingAgentName && params.visitingAgentPhone
    ? `\nYour Visiting Agent: ${params.visitingAgentName} (${params.visitingAgentPhone})`
    : "";
  return `Hello ${params.visitorName}, your visit for "${params.propertyTitle}" is confirmed on ${params.visitDate} at ${params.visitTime}.${agentText}`;
}

export function visitConfirmedAgent(params: {
  agentName: string;
  propertyTitle: string;
  visitDate: string;
  visitTime: string;
  locationUrl?: string | null;
}) {
  const mapText = params.locationUrl ? ` Property Map: ${params.locationUrl}` : "";
  return `Hello ${params.agentName}, a visit for "${params.propertyTitle}" is confirmed on ${params.visitDate} at ${params.visitTime}.${mapText}`;
}

export function visitAssignedVisitingAgent(params: {
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
}) {
  const mapText = params.locationUrl ? `\nMap: ${params.locationUrl}` : "";
  const instText = params.instructions ? `\n\n[Confidential Instructions]\n${params.instructions}` : "";
  const imgText = params.image ? `\nImage/Layout: ${params.image}` : "";
  return `Hello ${params.visitingAgentName}, you have been ASSIGNED a new visit for "${params.propertyTitle}" on ${params.visitDate} at ${params.visitTime}.
Customer: ${params.visitorName} (${params.visitorPhone})
Property Agent: ${params.ownerName} (${params.ownerPhone})${mapText}${instText}${imgText}`;
}

export function visitAssignedPropertyAgent(params: {
  ownerName: string;
  visitorName: string;
  visitingAgentName: string;
  visitingAgentPhone: string;
}) {
  return `Hello ${params.ownerName}, you have a confirmed visit booking.
Customer Name: ${params.visitorName}
Assigned Visiting Agent: ${params.visitingAgentName} (${params.visitingAgentPhone})`;
}

export function visitCancelled(params: {
  visitorName: string;
  propertyTitle: string;
  visitDate: string;
  visitTime: string;
}) {
  return `Hello ${params.visitorName}, your visit for "${params.propertyTitle}" on ${params.visitDate} at ${params.visitTime} was cancelled.`;
}

export function leadConfirmedBuyer(params: {
  buyerName: string;
  productTitle: string;
}) {
  return `Hello ${params.buyerName}, your buy request for "${params.productTitle}" has been confirmed.`;
}

export function leadConfirmedAgent(params: {
  agentName: string;
  productTitle: string;
}) {
  return `Hello ${params.agentName}, a buy request for "${params.productTitle}" has been confirmed by admin.`;
}

export function agentApproved(params: { agentName: string }) {
  return `Hello ${params.agentName}, your UrbanSaudi agent account is approved. You can now access your dashboard.`;
}

export function agentRejected(params: { agentName: string; reason?: string }) {
  const reasonText = params.reason ? ` Reason: ${params.reason}.` : "";
  return `Hello ${params.agentName}, your UrbanSaudi agent application was rejected.${reasonText}`;
}

export function maintenanceApproved(params: { customerName: string; serviceType: string }) {
  return `Hello ${params.customerName}, your UrbanSaudi maintenance request for ${params.serviceType} has been APPROVED. Our team will contact you shortly with arrival details.`;
}

export function maintenanceRejected(params: { customerName: string; serviceType: string }) {
  return `Hello ${params.customerName}, we regret to inform you that your maintenance request for ${params.serviceType} could not be approved at this time.`;
}

// ----- WhatsApp Content Template (Twilio approved templates) -----
// Used to send via contentSid + contentVariables to avoid error 63016.

const DEFAULT_SID_VISIT_CONFIRMATION_CUSTOMER = "HX68910b1b2d0a8ef427916ab56a70606a";
const DEFAULT_SID_VISIT_ASSIGNED_PROPERTY_AGENT = "HX2a544304c912de7cd7aba8733a774e15";
const DEFAULT_SID_VISIT_ASSIGNED_VISITING_AGENT = "HX6ff55189a698c948cfda4301dcd16764";

const EXPECTED_TEMPLATE_KEYS = {
  customer: ["1", "2", "3", "4", "5", "6", "7", "8"],
  property_agent: ["1", "2", "3", "4", "5", "6"],
  visiting_agent: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
} as const;

export function validateTwilioTemplateVariables(
  kind: keyof typeof EXPECTED_TEMPLATE_KEYS,
  variables: Record<string, string>
): { valid: true } | { valid: false; error: string } {
  const expected = [...EXPECTED_TEMPLATE_KEYS[kind]].sort();
  const actual = Object.keys(variables).sort();
  if (expected.length !== actual.length || expected.some((key, idx) => key !== actual[idx])) {
    return {
      valid: false,
      error: `Template variable mismatch for ${kind}. Expected keys [${expected.join(", ")}], got [${actual.join(", ")}].`,
    };
  }
  return { valid: true };
}

/** visit_confirmation_customer: 1=visitorName, 2=propertyTitle, 3=visitDate, 4=visitTime, 5=propertyId, 6=visitingAgentName, 7=visitingAgentPhone, 8=mapLink */
export function visitConfirmationCustomerContent(params: {
  visitorName: string;
  propertyTitle: string;
  visitDate: string;
  visitTime: string;
  propertyId: string;
  visitingAgentName?: string | null;
  visitingAgentPhone?: string | null;
  locationUrl?: string | null;
}): { contentSid: string; contentVariables: Record<string, string> } {
  const contentSid =
    process.env.TWILIO_TEMPLATE_VISIT_CONFIRMATION_CUSTOMER_SID || DEFAULT_SID_VISIT_CONFIRMATION_CUSTOMER;
  return {
    contentSid,
    contentVariables: {
      "1": params.visitorName,
      "2": params.propertyTitle,
      "3": params.visitDate,
      "4": params.visitTime,
      "5": params.propertyId,
      "6": params.visitingAgentName || "N/A",
      "7": params.visitingAgentPhone || "N/A",
      "8": params.locationUrl || "N/A",
    },
  };
}

/** visit_assigned_property_agent: 1=ownerName, 2=visitorName, 3=visitingAgentName, 4=visitingAgentPhone, 5=propertyId, 6=mapLink */
export function visitAssignedPropertyAgentContent(params: {
  ownerName: string;
  visitorName: string;
  visitingAgentName: string;
  visitingAgentPhone: string;
  propertyId: string;
  locationUrl?: string | null;
}): { contentSid: string; contentVariables: Record<string, string> } {
  const contentSid =
    process.env.TWILIO_TEMPLATE_VISIT_ASSIGNED_PROPERTY_AGENT_SID || DEFAULT_SID_VISIT_ASSIGNED_PROPERTY_AGENT;
  return {
    contentSid,
    contentVariables: {
      "1": params.ownerName,
      "2": params.visitorName,
      "3": params.visitingAgentName,
      "4": params.visitingAgentPhone,
      "5": params.propertyId,
      "6": params.locationUrl || "N/A",
    },
  };
}

/** visit_assigned_visiting_agent: 1=visitingAgentName, 2=propertyTitle, 3=visitDate, 4=visitTime, 5=visitorName, 6=visitorPhone, 7=ownerName, 8=ownerPhone, 9=instructions, 10=propertyId, 11=mapLink, 12=frontDoorPhoto */
export function visitAssignedVisitingAgentContent(params: {
  visitingAgentName: string;
  propertyTitle: string;
  visitDate: string;
  visitTime: string;
  visitorName: string;
  visitorPhone: string;
  ownerName: string;
  ownerPhone: string;
  propertyId: string;
  locationUrl?: string | null;
  instructions?: string | null;
  image?: string | null;
}): { contentSid: string; contentVariables: Record<string, string> } {
  const contentSid =
    process.env.TWILIO_TEMPLATE_VISIT_ASSIGNED_VISITING_AGENT_SID || DEFAULT_SID_VISIT_ASSIGNED_VISITING_AGENT;
  return {
    contentSid,
    contentVariables: {
      "1": params.visitingAgentName,
      "2": params.propertyTitle,
      "3": params.visitDate,
      "4": params.visitTime,
      "5": params.visitorName,
      "6": params.visitorPhone,
      "7": params.ownerName,
      "8": params.ownerPhone,
      "9": params.instructions || "No special instructions",
      "10": params.propertyId,
      "11": params.locationUrl || "N/A",
      "12": params.image || "N/A",
    },
  };
}
