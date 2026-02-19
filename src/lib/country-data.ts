export type Country = {
    name: string;
    code: string;
    dialCode: string;
    phoneDigits: number; // digits after country code
    cities: string[];
};

export const COUNTRIES: Country[] = [
    {
        name: "Saudi Arabia",
        code: "SA",
        dialCode: "+966",
        phoneDigits: 9,
        cities: [
            "Riyadh", "Jeddah", "Makkah", "Madinah", "Dammam", "Khobar",
            "Dhahran", "Tabuk", "Abha", "Taif", "Buraidah", "Khamis Mushait",
            "Najran", "Hail", "Jubail", "Yanbu", "Al Ahsa", "Jizan",
        ],
    },
    {
        name: "United Arab Emirates",
        code: "AE",
        dialCode: "+971",
        phoneDigits: 9,
        cities: [
            "Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah",
            "Fujairah", "Umm Al Quwain", "Al Ain",
        ],
    },
    {
        name: "Qatar",
        code: "QA",
        dialCode: "+974",
        phoneDigits: 8,
        cities: ["Doha", "Al Wakrah", "Al Khor", "Al Rayyan", "Lusail"],
    },
    {
        name: "Kuwait",
        code: "KW",
        dialCode: "+965",
        phoneDigits: 8,
        cities: [
            "Kuwait City", "Hawalli", "Salmiya", "Farwaniya", "Jahra", "Ahmadi",
        ],
    },
    {
        name: "Bahrain",
        code: "BH",
        dialCode: "+973",
        phoneDigits: 8,
        cities: ["Manama", "Muharraq", "Riffa", "Hamad Town", "Isa Town"],
    },
    {
        name: "Oman",
        code: "OM",
        dialCode: "+968",
        phoneDigits: 8,
        cities: ["Muscat", "Salalah", "Sohar", "Nizwa", "Sur", "Ibri"],
    },
    {
        name: "Pakistan",
        code: "PK",
        dialCode: "+92",
        phoneDigits: 10,
        cities: [
            "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad",
            "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala",
        ],
    },
    {
        name: "Egypt",
        code: "EG",
        dialCode: "+20",
        phoneDigits: 10,
        cities: [
            "Cairo", "Alexandria", "Giza", "Luxor", "Aswan", "Sharm El Sheikh",
            "Hurghada", "Mansoura", "Tanta",
        ],
    },
    {
        name: "Jordan",
        code: "JO",
        dialCode: "+962",
        phoneDigits: 9,
        cities: ["Amman", "Irbid", "Zarqa", "Aqaba", "Madaba", "Salt"],
    },
    {
        name: "India",
        code: "IN",
        dialCode: "+91",
        phoneDigits: 10,
        cities: [
            "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
            "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow",
        ],
    },
    {
        name: "United Kingdom",
        code: "GB",
        dialCode: "+44",
        phoneDigits: 10,
        cities: [
            "London", "Manchester", "Birmingham", "Leeds", "Glasgow",
            "Edinburgh", "Liverpool", "Bristol", "Sheffield",
        ],
    },
    {
        name: "United States",
        code: "US",
        dialCode: "+1",
        phoneDigits: 10,
        cities: [
            "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
            "Dallas", "San Francisco", "Miami", "Seattle", "Denver",
        ],
    },
];

export function getCountryByCode(code: string): Country | undefined {
    return COUNTRIES.find((c) => c.code === code);
}
