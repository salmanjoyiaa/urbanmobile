import { z } from "zod";

// Custom error messages and validation rules
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const safeUUIDRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .max(255, "Email must not exceed 255 characters")
    .regex(emailRegex, "Please enter a valid email"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password must not exceed 128 characters"),
});

export const signupSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .max(255, "Email must not exceed 255 characters")
    .regex(emailRegex, "Please enter a valid email"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password must not exceed 128 characters"),
  phone: z
    .string()
    .regex(/^\+[0-9]{10,15}$/, "Phone must be in format +966XXXXXXXXX")
    .optional()
    .or(z.literal("")),
});

export const agentSignupSchema = signupSchema.extend({
  company_name: z.string().max(100, "Company name must not exceed 100 characters").optional(),
  license_number: z
    .string()
    .max(50, "License number must not exceed 50 characters")
    .optional(),
  agent_type: z.enum(["property", "visiting", "seller", "maintenance"]),
}).superRefine((data, ctx) => {
  if (data.agent_type === "property" || data.agent_type === "visiting") {
    const c = typeof data.company_name === "string" ? data.company_name.trim() : "";
    if (c.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Company name is required",
        path: ["company_name"],
      });
    }
  }
  if (data.agent_type === "seller" || data.agent_type === "maintenance") {
    const p = (data.phone ?? "").trim();
    if (!p || !/^\+\d{10,15}$/.test(p)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "WhatsApp number is required (format +966XXXXXXXXX)",
        path: ["phone"],
      });
    }
  }
});

export const propertySchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title must not exceed 255 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must not exceed 5000 characters"),
  type: z.enum(["apartment", "villa", "office", "land", "studio", "duplex", "commercial_space", "storage_space", "other"]),
  purpose: z.enum(["short_term", "mid_term", "long_term"]),
  price: z
    .coerce
    .number()
    .min(0, "Price must be zero or positive")
    .max(1000000000, "Price exceeds maximum limit"),
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City name must not exceed 100 characters"),
  district: z
    .string()
    .max(100, "District name must not exceed 100 characters")
    .optional(),
  address: z
    .string()
    .max(255, "Address must not exceed 255 characters")
    .optional(),
  latitude: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const n = Number(val);
      return isNaN(n) ? undefined : n;
    },
    z.number()
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90")
      .optional(),
  ),
  longitude: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const n = Number(val);
      return isNaN(n) ? undefined : n;
    },
    z.number()
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180")
      .optional(),
  ),
  bedrooms: z.coerce.number().int().min(0).max(1000).optional(),
  bathrooms: z.coerce.number().int().min(0).max(1000).optional(),
  kitchens: z.coerce.number().int().min(0).max(100).optional(),
  living_rooms: z.coerce.number().int().min(0).max(100).optional(),
  drawing_rooms: z.coerce.number().int().min(0).max(100).optional(),
  dining_areas: z.coerce.number().int().min(0).max(100).optional(),
  two_entrance: z.coerce.number().int().min(0).max(100).optional(),
  area_sqm: z.coerce.number().positive().max(1000000).optional(),
  year_built: z.coerce.number().int().min(1900).max(2100).optional(),
  amenities: z.array(z.string().max(100)).max(50).default([]),
  images: z.array(z.string().url()).max(20).default([]),
  property_ref: z.string().max(100).optional().or(z.literal("")),
  layout: z.string().max(100).optional().or(z.literal("")),
  building_features: z.array(z.string()).default([]),
  apartment_features: z.array(z.string()).default([]),
  location_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  rental_period: z.string().max(50).optional().or(z.literal("")),
  office_fee: z.string().max(50).optional().or(z.literal("")),
  water_bill_included: z.string().max(50).optional().or(z.literal("")),
  security_deposit: z.string().max(50).optional().or(z.literal("")),
  nearby_places: z.array(z.string()).default([]),
  drive_link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  building_condition: z.string().max(100).optional().or(z.literal("")),
  broker_fee: z.string().max(50).optional().or(z.literal("")),
  payment_methods_accepted: z.string().max(255).optional().or(z.literal("")),
  cover_image_index: z.coerce.number().int().min(0).max(19).default(0),
  installments: z.string().max(200).optional().or(z.literal("")),
  blocked_dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")).default([]),
  video_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  is_video_featured: z.boolean().default(false),
  visiting_agent_instructions: z.string().max(5000, "Instructions must not exceed 5000 characters").optional(),
  visiting_agent_image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export const productSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title must not exceed 255 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must not exceed 5000 characters"),
  category: z.enum([
    "furniture",
    "appliances",
    "electronics",
    "decor",
    "kitchen",
    "outdoor",
    "other",
  ]),
  condition: z.enum(["new", "like_new", "good", "fair"]),
  price: z
    .coerce
    .number()
    .min(0, "Price must be zero or positive")
    .max(100000000, "Price exceeds maximum limit"),
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City name must not exceed 100 characters"),
  images: z.array(z.string().url()).max(20).default([]),
});

export const visitRequestSchema = z.object({
  property_id: z.string().regex(safeUUIDRegex, "Invalid property ID"),
  visitor_name: z
    .string()
    .min(2, "Name is required")
    .max(100, "Name must not exceed 100 characters"),
  visitor_email: z
    .string()
    .min(1, "Email is required")
    .max(255, "Email must not exceed 255 characters")
    .regex(emailRegex, "Valid email is required"),
  visitor_phone: z
    .string()
    .regex(/^\+\d{10,15}$/, "Invalid phone number format"),
  visitor_message: z
    .string()
    .max(5000, "Message must not exceed 5000 characters")
    .optional(),
  visit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  visit_time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
});

/** Public product lead: name + phone only; stored without email for dashboard + WhatsApp handoff */
export const buyRequestSchema = z.object({
  product_id: z.string().regex(safeUUIDRegex, "Invalid product ID"),
  buyer_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  buyer_phone: z
    .string()
    .regex(/^\+\d{10,15}$/, "Invalid phone number format"),
});

export const buyRequestPublicFormSchema = buyRequestSchema.omit({ product_id: true });

const maintenanceMediaStoragePath = z
  .string()
  .min(3)
  .max(512)
  .regex(/^requests\//, "Invalid media path");

export const maintenanceRequestSchema = z.object({
  service_id: z.string().uuid().nullish(),
  agent_id: z.string().uuid().nullish(),
  service_type: z
    .string()
    .min(2, "Service type is required")
    .max(100, "Service type must not exceed 100 characters"),
  customer_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  customer_email: z
    .string()
    .min(1, "Email is required")
    .max(255, "Email must not exceed 255 characters")
    .regex(emailRegex, "Valid email is required"),
  customer_phone: z
    .string()
    .regex(/^\+\d{10,15}$/, "Invalid phone number format"),
  details: z
    .string()
    .max(5000, "Details must not exceed 5000 characters")
    .optional()
    .nullable(),
  visit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional().nullable(),
  visit_time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format").optional().nullable(),
  audio_url: maintenanceMediaStoragePath.nullish(),
  media_urls: z.array(maintenanceMediaStoragePath).max(15).optional(),
});

/** Admin-only PATCH fields for `maintenance_requests` (partial updates). */
export const maintenanceRequestAdminUpdateSchema = z
  .object({
    status: z.enum(["pending", "approved", "completed", "rejected"]).optional(),
    admin_notes: z.string().max(5000).nullable().optional(),
    customer_name: z.string().min(2).max(100).optional(),
    customer_email: z.string().min(1).max(255).regex(emailRegex, "Valid email is required").optional(),
    customer_phone: z.string().regex(/^\+\d{10,15}$/, "Invalid phone number format").optional(),
    details: z.string().max(5000).nullable().optional(),
    visit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").nullable().optional(),
    visit_time: z.preprocess((v) => {
      if (v === null || v === undefined || v === "") return null;
      if (typeof v === "string" && v.length >= 5) return v.slice(0, 5);
      return v;
    }, z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format").nullable().optional()),
    service_type: z.string().min(2).max(100).optional(),
    service_id: z.string().uuid().nullable().optional(),
    agent_id: z.string().uuid().nullable().optional(),
  })
  .strict();

export const maintenanceServiceSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title must not exceed 255 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must not exceed 5000 characters"),
  category: z
    .string()
    .min(2, "Category is required")
    .max(100, "Category must not exceed 100 characters"),
  provider_type: z.enum(["single_person", "company"]),
  price: z
    .coerce
    .number()
    .min(0, "Price must be zero or positive")
    .max(1000000, "Price exceeds maximum limit")
    .optional(),
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City name must not exceed 100 characters"),
  images: z.array(z.string().url()).max(20).default([]),
  videos: z.array(z.string().url()).max(3).default([]),
});

export const adminMaintenanceServicePatchSchema = maintenanceServiceSchema
  .partial()
  .extend({
    status: z.enum(["active", "inactive", "suspended"]).optional(),
  });

/** Agent PATCH: same as partial listing fields plus only active/inactive (not suspended). */
export const agentMaintenanceServicePatchSchema = maintenanceServiceSchema
  .partial()
  .extend({
    status: z.enum(["active", "inactive"]).optional(),
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type AgentSignupInput = z.infer<typeof agentSignupSchema>;
export type PropertyInput = z.infer<typeof propertySchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type VisitRequestInput = z.infer<typeof visitRequestSchema>;
export type BuyRequestInput = z.infer<typeof buyRequestSchema>;
export type BuyRequestPublicFormInput = z.infer<typeof buyRequestPublicFormSchema>;
export type MaintenanceRequestInput = z.infer<typeof maintenanceRequestSchema>;
export type MaintenanceServiceInput = z.infer<typeof maintenanceServiceSchema>;
