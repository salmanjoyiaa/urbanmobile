export function visitConfirmedVisitor(params: {
  visitorName: string;
  propertyTitle: string;
  visitDate: string;
  visitTime: string;
  locationUrl?: string | null;
}) {
  const mapText = params.locationUrl ? ` Property Map: ${params.locationUrl}` : "";
  return `Hello ${params.visitorName}, your visit for "${params.propertyTitle}" is confirmed on ${params.visitDate} at ${params.visitTime}.${mapText}`;
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
}) {
  const mapText = params.locationUrl ? `\nMap: ${params.locationUrl}` : "";
  return `Hello ${params.visitingAgentName}, you have been ASSIGNED a new visit for "${params.propertyTitle}" on ${params.visitDate} at ${params.visitTime}.
Customer: ${params.visitorName} (${params.visitorPhone})
Property Agent: ${params.ownerName} (${params.ownerPhone})${mapText}`;
}

export function visitAssignedPropertyAgent(params: {
  ownerName: string;
  propertyTitle: string;
  visitDate: string;
  visitTime: string;
  visitorName: string;
  visitingAgentName: string;
}) {
  return `Hello ${params.ownerName}, your property "${params.propertyTitle}" has a confirmed visit on ${params.visitDate} at ${params.visitTime}.
Customer: ${params.visitorName}
Assigned Visiting Agent: ${params.visitingAgentName}`;
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
