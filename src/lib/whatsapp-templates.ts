export function visitConfirmedVisitor(params: {
  visitorName: string;
  propertyTitle: string;
  visitDate: string;
  visitTime: string;
  locationUrl?: string | null;
  visitingAgentName?: string | null;
  visitingAgentPhone?: string | null;
}) {
  const mapText = params.locationUrl ? ` Property Map: ${params.locationUrl}` : "";
  const agentText = params.visitingAgentName && params.visitingAgentPhone
    ? `\nYour Visiting Agent: ${params.visitingAgentName} (${params.visitingAgentPhone})`
    : "";
  return `Hello ${params.visitorName}, your visit for "${params.propertyTitle}" is confirmed on ${params.visitDate} at ${params.visitTime}.${mapText}${agentText}`;
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
