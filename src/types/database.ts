import type {
  UserRole,
  AgentStatus,
  AgentType,
  PropertyType,
  ListingStatus,
  ListingPurpose,
  ProductCondition,
  ProductCategory,
  VisitStatus,
  VisitingStatus,
  LeadStatus,
  MaintenanceStatus,
} from "./enums";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  profile_id: string;
  agent_type: AgentType;
  license_number: string | null;
  company_name: string | null;
  document_url: string | null;
  bio: string | null;
  status: AgentStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  agent_id: string;
  title: string;
  description: string;
  type: PropertyType;
  purpose: ListingPurpose;
  status: ListingStatus;
  price: number;
  city: string;
  district: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  kitchens: number | null;
  living_rooms: number | null;
  drawing_rooms: number | null;
  dining_areas: number | null;
  area_sqm: number | null;
  year_built: number | null;
  amenities: string[];
  images: string[];
  featured: boolean;
  views_count: number;
  property_ref: string | null;
  layout: string | null;
  building_features: string[];
  apartment_features: string[];
  location_url: string | null;
  rental_period: string | null;
  office_fee: string | null;
  water_bill_included: string | null;
  security_deposit: string | null;
  nearby_places: string[];
  drive_link: string | null;
  broker_fee: string | null;
  payment_methods_accepted: string | null;
  cover_image_index: number;
  blocked_dates: string[];
  visiting_agent_instructions: string | null;
  visiting_agent_image: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  agent_id: string;
  title: string;
  description: string;
  category: ProductCategory;
  condition: ProductCondition;
  price: number;
  city: string;
  images: string[];
  is_available: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface VisitRequest {
  id: string;
  property_id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string;
  visit_date: string;
  visit_time: string;
  status: VisitStatus;
  visiting_agent_id: string | null;
  customer_remarks: string | null;
  visiting_status: VisitingStatus | null;
  admin_notes: string | null;
  confirmed_by: string | null;
  confirmed_at: string | null;
  reschedule_reason: string | null;
  reschedule_date: string | null;
  reschedule_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface BuyRequest {
  id: string;
  product_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  message: string | null;
  status: LeadStatus;
  admin_notes: string | null;
  confirmed_by: string | null;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceRequest {
  id: string;
  service_type: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  details: string | null;
  status: MaintenanceStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface NotificationLog {
  id: string;
  channel: string;
  recipient: string;
  subject: string | null;
  content: string | null;
  status: string;
  error_message: string | null;
  metadata: Json | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  metadata: Json;
  read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Json;
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface VisitAssignmentHistory {
  id: string;
  visit_id: string;
  old_agent_id: string | null;
  new_agent_id: string;
  changed_by: string;
  reason: string | null;
  created_at: string;
}

export interface VisitComment {
  id: string;
  visit_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

export interface AgentPropertyAssignment {
  id: string;
  agent_id: string;
  property_id: string;
  assigned_by: string;
  created_at: string;
}

// Supabase Database type for client typing
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      agents: {
        Row: Agent;
        Insert: Omit<Agent, "id" | "created_at" | "updated_at" | "reviewed_by" | "reviewed_at" | "rejection_reason" | "agent_type"> & { id?: string; agent_type?: AgentType };
        Update: Partial<Omit<Agent, "id" | "created_at">>;
      };
      properties: {
        Row: Property;
        Insert: Omit<Property, "id" | "created_at" | "updated_at" | "views_count" | "featured" | "building_features" | "apartment_features" | "nearby_places" | "cover_image_index" | "blocked_dates" | "dining_areas"> & { id?: string; featured?: boolean; building_features?: string[]; apartment_features?: string[]; nearby_places?: string[]; cover_image_index?: number; blocked_dates?: string[]; dining_areas?: number };
        Update: Partial<Omit<Property, "id" | "created_at">>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, "id" | "created_at" | "updated_at" | "views_count" | "is_available"> & { id?: string; is_available?: boolean };
        Update: Partial<Omit<Product, "id" | "created_at">>;
      };
      visit_requests: {
        Row: VisitRequest;
        Insert: Omit<VisitRequest, "id" | "created_at" | "updated_at" | "status" | "admin_notes" | "confirmed_by" | "confirmed_at" | "visiting_status"> & { id?: string; status?: VisitStatus; visiting_status?: VisitingStatus };
        Update: Partial<Omit<VisitRequest, "id" | "created_at">>;
      };
      buy_requests: {
        Row: BuyRequest;
        Insert: Omit<BuyRequest, "id" | "created_at" | "updated_at" | "status" | "admin_notes" | "confirmed_by" | "confirmed_at"> & { id?: string; status?: LeadStatus };
        Update: Partial<Omit<BuyRequest, "id" | "created_at">>;
      };
      maintenance_requests: {
        Row: MaintenanceRequest;
        Insert: Omit<MaintenanceRequest, "id" | "created_at" | "updated_at" | "status" | "admin_notes"> & { id?: string; status?: MaintenanceStatus };
        Update: Partial<Omit<MaintenanceRequest, "id" | "created_at">>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, "id" | "created_at" | "read"> & { id?: string; read?: boolean };
        Update: Partial<Omit<Notification, "id" | "created_at">>;
      };
      notification_logs: {
        Row: NotificationLog;
        Insert: {
          id?: string;
          channel: string;
          recipient: string;
          subject?: string | null;
          content?: string | null;
          status: string;
          error_message?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: never;
      };
      audit_log: {
        Row: AuditLog;
        Insert: Omit<AuditLog, "id" | "created_at"> & { id?: string };
        Update: never;
      };
      testimonials: {
        Row: Testimonial;
        Insert: Omit<Testimonial, "id" | "created_at" | "role" | "rating" | "is_active" | "avatar_url"> & {
          id?: string;
          role?: string;
          rating?: number;
          is_active?: boolean;
          avatar_url?: string | null;
        };
        Update: {
          name?: string;
          role?: string;
          content?: string;
          rating?: number;
          avatar_url?: string | null;
          is_active?: boolean;
        };
      };
    };
  };
}
