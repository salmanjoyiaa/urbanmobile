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
  { value: "mid_term", label: "Mid-term" },
  { value: "long_term", label: "Long-term" },
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
  slotDurationMinutes: 30,
  workDays: [0, 1, 2, 3, 4, 5, 6] as number[],
} as const;

export const SAUDI_TIME_ZONE = "Asia/Riyadh";
export const SAUDI_UTC_OFFSET = "+03:00";

const rawVisitWindowDays = Number(process.env.NEXT_PUBLIC_VISIT_BOOKING_WINDOW_DAYS || "10");
export const VISIT_BOOKING_WINDOW_DAYS = Number.isFinite(rawVisitWindowDays)
  ? Math.min(Math.max(Math.trunc(rawVisitWindowDays), 1), 60)
  : 10;

const rawVisitLeadHours = Number(process.env.NEXT_PUBLIC_VISIT_BOOKING_LEAD_HOURS || "3");
export const VISIT_BOOKING_LEAD_HOURS = Number.isFinite(rawVisitLeadHours)
  ? Math.min(Math.max(Math.trunc(rawVisitLeadHours), 1), 72)
  : 3;

export const ROOM_COUNT_OPTIONS = ["0", "1", "2", "3", "4", "5+"] as const;

export const INSTALLMENT_OPTIONS = [
  "Daily",
  "Weekly",
  "Monthly",
  "3 Months",
  "6 Months",
] as const;

export const KITCHEN_FEATURES = [
  "Separate Kitchen",
  "American Kitchen (Open Kitchen)",
  "Modern Kitchen Design",
  "Window Available",
  "Good Ventilation",
] as const;

export const APARTMENT_FEATURES = [
  "Internal Apartment",
  "External Apartment",
  "External Corner Unit",
  "Good Ventilation",
  "Natural Light",
  "Water Heater Installed",
  "Window AC Installed",
  "Split AC Installed",
  "Central AC Installed",
  "Ground Floor",
  "First Floor",
  "Second Floor",
  "Third Floor",
  "Fourth Floor",
  "Terrace",
  "Balcony",
  "Rooftop",
  "Semi-Furnished",
  "Fully-Furnished",
] as const;

export const BUILDING_FEATURES = [
  "Family Building",
  "Bachelor Building",
  "Family & Bachelor Building",
  "Ground Floor Private Parking",
  "Ground Floor Parking (First Come First Serve)",
  "Street Parking",
  "Basement Parking",
  "Elevator",
  "Elevator Not Available",
  "CCTV Security System",
  "24/7 Security",
  "Fire Safety System",
  "Easy Access to Main Road",
  "Intercom System",
] as const;

export const UTILITIES_AND_SERVICES = [
  "Independent Electricity Meter",
  "Shared Electricity Meter",
  "Independent Water Meter",
  "Water Included in Rent",
] as const;

export const BUILDING_CONDITION_OPTIONS = [
  { value: "Brand New Building", label: "Brand New Building" },
  { value: "New Building", label: "New Building" },
  { value: "Newly Renovated", label: "Newly Renovated" },
  { value: "Well Maintained", label: "Well Maintained" },
] as const;

export const AMENITIES = [
  ...KITCHEN_FEATURES,
  ...UTILITIES_AND_SERVICES,
] as const;

export const RENTAL_PERIODS: Record<string, string[]> = {
  short_term: ["Daily/Night", "Weekly"],
  mid_term: ["Monthly", "3 Months", "6 Months"],
  long_term: ["Yearly"],
};

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
  "Near Hypermarket",
  "Near Park",
  "Near Grocery Shop",
  "Near School",
  "Near Hospital",
  "Near Gym",
  "Near Mosque",
  "Family-Friendly Area",
  "Quiet Neighborhood",
  "Wide Roads",
  "Near Main Road",
  "Close to Highway",
  "Near Pakistani Restaurant",
  "Near Indian Restaurant",
  "Near Kerala Restaurant",
  "Near Hyderabad Restaurant",
  "Near Filipino Restaurant",
] as const;
