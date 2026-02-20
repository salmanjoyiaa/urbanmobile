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
  company_name: z
    .string()
    .min(2, "Company name is required")
    .max(100, "Company name must not exceed 100 characters"),
  license_number: z
    .string()
    .max(50, "License number must not exceed 50 characters")
    .optional(),
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
  type: z.enum(["apartment", "villa", "office", "land", "studio", "duplex"]),
  purpose: z.enum(["short_term", "long_term", "contract"]),
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
  latitude: z
    .coerce
    .number()
    .min(-90)
    .max(90)
    .optional(),
  longitude: z
    .coerce
    .number()
    .min(-180)
    .max(180)
    .optional(),
  bedrooms: z.coerce.number().int().min(0).max(1000).optional(),
  bathrooms: z.coerce.number().int().min(0).max(1000).optional(),
  area_sqm: z.coerce.number().positive().max(1000000).optional(),
  year_built: z.coerce.number().int().min(1900).max(2100).optional(),
  amenities: z.array(z.string().max(100)).max(50).default([]),
  images: z.array(z.string().url()).max(20).default([]),
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
    .regex(/^(05|\+9665)[0-9]{8}$/, "Must be a valid 10-digit Saudi WhatsApp number starting with 05 or +9665"),
  visit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  visit_time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
});

export const buyRequestSchema = z.object({
  product_id: z.string().regex(safeUUIDRegex, "Invalid product ID"),
  buyer_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  buyer_email: z
    .string()
    .min(1, "Email is required")
    .max(255, "Email must not exceed 255 characters")
    .regex(emailRegex, "Valid email is required"),
  buyer_phone: z
    .string()
    .regex(/^(05|\+9665)[0-9]{8}$/, "Must be a valid 10-digit Saudi WhatsApp number starting with 05 or +9665"),
  message: z
    .string()
    .max(5000, "Message must not exceed 5000 characters")
    .optional(),
});

export const maintenanceRequestSchema = z.object({
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
    .regex(/^(05|\+9665)[0-9]{8}$/, "Must be a valid 10-digit Saudi WhatsApp number starting with 05 or +9665"),
  details: z
    .string()
    .max(5000, "Details must not exceed 5000 characters")
    .optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type AgentSignupInput = z.infer<typeof agentSignupSchema>;
export type PropertyInput = z.infer<typeof propertySchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type VisitRequestInput = z.infer<typeof visitRequestSchema>;
export type BuyRequestInput = z.infer<typeof buyRequestSchema>;
export type MaintenanceRequestInput = z.infer<typeof maintenanceRequestSchema>;
