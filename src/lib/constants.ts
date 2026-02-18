export const SAUDI_CITIES = [
  "Riyadh",
  "Jeddah",
  "Makkah",
  "Madinah",
  "Dammam",
  "Khobar",
  "Dhahran",
  "Tabuk",
  "Abha",
  "Taif",
  "Buraidah",
  "Khamis Mushait",
  "Najran",
  "Hail",
  "Jubail",
  "Yanbu",
  "Al Ahsa",
  "Jizan",
] as const;

export const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "office", label: "Office" },
  { value: "land", label: "Land" },
  { value: "studio", label: "Studio" },
  { value: "duplex", label: "Duplex" },
] as const;

export const LISTING_PURPOSES = [
  { value: "sale", label: "For Sale" },
  { value: "rent", label: "For Rent" },
] as const;

export const PRODUCT_CATEGORIES = [
  { value: "furniture", label: "Furniture" },
  { value: "appliances", label: "Appliances" },
  { value: "electronics", label: "Electronics" },
  { value: "decor", label: "Decor" },
  { value: "kitchen", label: "Kitchen" },
  { value: "outdoor", label: "Outdoor" },
  { value: "other", label: "Other" },
] as const;

export const PRODUCT_CONDITIONS = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
] as const;

export const SLOT_CONFIG = {
  startHour: 9,
  endHour: 17,
  breakStartHour: 13,
  breakEndHour: 14,
  slotDurationMinutes: 20,
  workDays: [1, 2, 3, 4, 5] as number[], // Mon-Fri
} as const;

export const AMENITIES = [
  "Parking",
  "Swimming Pool",
  "Gym",
  "Security",
  "Elevator",
  "Balcony",
  "Garden",
  "Central AC",
  "Maid's Room",
  "Driver's Room",
  "Storage",
  "Kitchen Appliances",
  "Furnished",
  "Pet Friendly",
] as const;
