import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z
    .string()
    .regex(/^\+\d{10,15}$/, "Phone must be in format +966XXXXXXXXX")
    .optional()
    .or(z.literal("")),
});

export const agentSignupSchema = signupSchema.extend({
  company_name: z.string().min(2, "Company name is required"),
  license_number: z.string().optional(),
});

export const propertySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum(["apartment", "villa", "office", "land", "studio", "duplex"]),
  purpose: z.enum(["sale", "rent"]),
  price: z.coerce.number().positive("Price must be positive"),
  city: z.string().min(1, "City is required"),
  district: z.string().optional(),
  address: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().int().min(0).optional(),
  area_sqm: z.coerce.number().positive().optional(),
  year_built: z.coerce.number().int().min(1900).max(2030).optional(),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
});

export const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
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
  price: z.coerce.number().positive("Price must be positive"),
  city: z.string().min(1, "City is required"),
  images: z.array(z.string()).default([]),
});

export const visitRequestSchema = z.object({
  property_id: z.string().uuid(),
  visitor_name: z.string().min(2, "Name is required"),
  visitor_email: z.string().email("Valid email is required"),
  visitor_phone: z
    .string()
    .regex(/^\+\d{10,15}$/, "Phone must be in format +966XXXXXXXXX"),
  visit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  visit_time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
});

export const buyRequestSchema = z.object({
  product_id: z.string().uuid(),
  buyer_name: z.string().min(2, "Name is required"),
  buyer_email: z.string().email("Valid email is required"),
  buyer_phone: z
    .string()
    .regex(/^\+\d{10,15}$/, "Phone must be in format +966XXXXXXXXX"),
  message: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type AgentSignupInput = z.infer<typeof agentSignupSchema>;
export type PropertyInput = z.infer<typeof propertySchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type VisitRequestInput = z.infer<typeof visitRequestSchema>;
export type BuyRequestInput = z.infer<typeof buyRequestSchema>;
