export const VISIT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  assigned: "Assigned",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
};

export const VISIT_STATUS_BADGE_CLASSES: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  assigned: "border-blue-200 bg-blue-50 text-blue-800",
  confirmed: "border-green-200 bg-green-50 text-green-800",
  cancelled: "border-red-200 bg-red-50 text-red-800",
  completed: "border-violet-200 bg-violet-50 text-violet-800",
};

export function getVisitStatusLabel(status: string): string {
  return VISIT_STATUS_LABELS[status] || status;
}

export function getVisitStatusBadgeClass(status: string): string {
  return VISIT_STATUS_BADGE_CLASSES[status] || "";
}
