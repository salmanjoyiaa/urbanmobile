export type HouseholdItemCategory =
  | "furniture"
  | "electronics"
  | "appliances"
  | "kitchen"
  | "bedroom"
  | "bathroom"
  | "decor"
  | "lighting"
  | "storage"
  | "outdoor"
  | "kids"
  | "other";

export type ItemCondition = "like_new" | "good" | "fair" | "used";

export interface HouseholdItemPhoto {
  id: string;
  url: string;
  position: number;
  is_cover: boolean;
}

export interface HouseholdItem {
  id: string;
  seller_id: string;
  title: string;
  category: HouseholdItemCategory;
  price: number;
  currency: string;
  condition: ItemCondition;
  city: string;
  area: string;
  delivery_available: boolean;
  is_negotiable: boolean;
  status: "available" | "reserved" | "sold" | "removed";
  created_at: string;
  household_item_photos?: HouseholdItemPhoto[];
}
