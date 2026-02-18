export function visitConfirmedVisitor(params: {
  visitorName: string;
  propertyTitle: string;
  visitDate: string;
  visitTime: string;
}) {
  return `Hello ${params.visitorName}, your visit for "${params.propertyTitle}" is confirmed on ${params.visitDate} at ${params.visitTime}.`;
}

export function visitConfirmedAgent(params: {
  agentName: string;
  propertyTitle: string;
  visitDate: string;
  visitTime: string;
}) {
  return `Hello ${params.agentName}, a visit for "${params.propertyTitle}" is confirmed on ${params.visitDate} at ${params.visitTime}.`;
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
