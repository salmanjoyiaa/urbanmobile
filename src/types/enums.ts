export type UserRole = "customer" | "agent" | "admin";

export type AgentStatus = "pending" | "approved" | "rejected" | "suspended";

export type AgentType = "property" | "visiting";

export type PropertyType =
  | "apartment"
  | "villa"
  | "office"
  | "land"
  | "studio"
  | "duplex"
  | "commercial_space"
  | "storage_space"
  | "other";

export type ListingStatus = "pending" | "available" | "sold" | "rented" | "reserved";

export type ListingPurpose = "short_term" | "long_term" | "contract";

export type ProductCondition = "new" | "like_new" | "good" | "fair";

export type ProductCategory =
  | "furniture"
  | "appliances"
  | "electronics"
  | "decor"
  | "kitchen"
  | "outdoor"
  | "other";

export type VisitStatus = "pending" | "confirmed" | "cancelled" | "completed" | "assigned";

export type VisitingStatus = "view" | "contact_done" | "customer_confirmed" | "customer_arrived" | "visit_done" | "customer_remarks" | "deal_pending" | "deal_fail" | "commission_got" | "deal_close" | "reschedule";

export type LeadStatus = "pending" | "confirmed" | "rejected" | "completed";

export type MaintenanceStatus = "pending" | "approved" | "completed" | "rejected";
