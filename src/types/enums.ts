export type UserRole = "customer" | "agent" | "admin";

export type AgentStatus = "pending" | "approved" | "rejected" | "suspended";

export type PropertyType =
  | "apartment"
  | "villa"
  | "office"
  | "land"
  | "studio"
  | "duplex";

export type ListingStatus = "draft" | "active" | "sold" | "rented" | "archived";

export type ListingPurpose = "sale" | "rent";

export type ProductCondition = "new" | "like_new" | "good" | "fair";

export type ProductCategory =
  | "furniture"
  | "appliances"
  | "electronics"
  | "decor"
  | "kitchen"
  | "outdoor"
  | "other";

export type VisitStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type LeadStatus = "pending" | "confirmed" | "rejected" | "completed";
