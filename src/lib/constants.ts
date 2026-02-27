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
  { value: "short_term", label: "Short-term" },
  { value: "long_term", label: "Long-term" },
  { value: "contract", label: "Contract" },
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
  startHour: 10,
  endHour: 24,
  breakStartHour: 0,
  breakEndHour: 0,
  slotDurationMinutes: 20,
  workDays: [0, 1, 2, 3, 4, 5, 6] as number[],
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

export const BUILDING_FEATURES = [
  "Family Building",
  "New Family Building",
  "Elevator",
  "Street Parking",
  "Private Parking",
  "Parking (First come first serve)",
  "Cameras External",
  "Swimming Pool",
] as const;

export const APARTMENT_FEATURES = [
  "Two enterences",
  "Internal",
  "External",
  "Corner External",
  "Hot Water",
  "AC installed",
  "Ground floor",
  "1st Floor",
  "2nd Floor",
  "3rd Floor",
  "4th Floor",
  "Roof top",
  "Terrace",
  "Balcony",
] as const;

export const RENTAL_PERIODS = [
  "Monthly",
  "3 Months",
  "6 Months",
  "12 Months",
] as const;

export const FEE_OPTIONS = [
  "500",
  "1000",
  "2000",
] as const;

export const WATER_OPTIONS = [
  "Yes",
  "No",
  "Maybe",
] as const;

export const SECURITY_DEPOSITS = [
  "500",
  "1000",
  "1500",
] as const;

export const NEARBY_PLACES = [
  "School",
  "Hospital",
  "Mosque",
  "Supermarket",
  "Park",
  "Gym",
] as const;
