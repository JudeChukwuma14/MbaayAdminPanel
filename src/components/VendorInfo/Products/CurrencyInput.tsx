import type React from "react";
interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  country?: string;
  className?: string;
}

// Define a comprehensive mapping of country names to currency data
const COUNTRY_CURRENCY_MAP: Record<
  string,
  { code: string; symbol: string; name: string }
> = {
  // North America
  "United States": { code: "USD", symbol: "$", name: "US Dollar" },
  Canada: { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  Mexico: { code: "MXN", symbol: "$", name: "Mexican Peso" },

  // South America
  Brazil: { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  Argentina: { code: "ARS", symbol: "$", name: "Argentine Peso" },
  Chile: { code: "CLP", symbol: "$", name: "Chilean Peso" },
  Colombia: { code: "COP", symbol: "$", name: "Colombian Peso" },
  Peru: { code: "PEN", symbol: "S/", name: "Peruvian Sol" },

  // Europe
  "United Kingdom": { code: "GBP", symbol: "£", name: "British Pound" },
  Germany: { code: "EUR", symbol: "€", name: "Euro" },
  France: { code: "EUR", symbol: "€", name: "Euro" },
  Italy: { code: "EUR", symbol: "€", name: "Euro" },
  Spain: { code: "EUR", symbol: "€", name: "Euro" },
  Netherlands: { code: "EUR", symbol: "€", name: "Euro" },
  Switzerland: { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  Sweden: { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  Norway: { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
  Denmark: { code: "DKK", symbol: "kr", name: "Danish Krone" },
  Poland: { code: "PLN", symbol: "zł", name: "Polish Złoty" },
  Russia: { code: "RUB", symbol: "₽", name: "Russian Ruble" },

  // Asia
  Japan: { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  China: { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  "Hong Kong": { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  Singapore: { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  "South Korea": { code: "KRW", symbol: "₩", name: "South Korean Won" },
  India: { code: "INR", symbol: "₹", name: "Indian Rupee" },
  Indonesia: { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
  Malaysia: { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  Thailand: { code: "THB", symbol: "฿", name: "Thai Baht" },
  Vietnam: { code: "VND", symbol: "₫", name: "Vietnamese Đồng" },
  Philippines: { code: "PHP", symbol: "₱", name: "Philippine Peso" },
  Pakistan: { code: "PKR", symbol: "₨", name: "Pakistani Rupee" },
  Bangladesh: { code: "BDT", symbol: "৳", name: "Bangladeshi Taka" },

  // Middle East
  "United Arab Emirates": { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  "Saudi Arabia": { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  Israel: { code: "ILS", symbol: "₪", name: "Israeli New Shekel" },
  Turkey: { code: "TRY", symbol: "₺", name: "Turkish Lira" },

  // Africa
  "South Africa": { code: "ZAR", symbol: "R", name: "South African Rand" },
  Egypt: { code: "EGP", symbol: "E£", name: "Egyptian Pound" },
  Nigeria: { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  Kenya: { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  Morocco: { code: "MAD", symbol: "د.م.", name: "Moroccan Dirham" },

  // Oceania
  Australia: { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  "New Zealand": { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },

  // Default
  DEFAULT: { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
};

export default function CurrencyInput({
  value,
  onChange,
  country = "Nigeria",
  className = "",
}: CurrencyInputProps) {
  // Get currency data based on country name
  const getCurrencyData = (name: string) => {
    return COUNTRY_CURRENCY_MAP[name] || COUNTRY_CURRENCY_MAP["DEFAULT"];
  };

  const currencyData = getCurrencyData(country);

  // Handle input change and format as needed
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and decimal point
    const value = e.target.value.replace(/[^0-9.]/g, "");
    onChange(value);
  };

  return (
    <div className="relative">
      <div className="relative w-full">
        <div className="absolute font-medium text-gray-500 transform -translate-y-1/2 left-3 top-1/2">
          {currencyData.symbol}
        </div>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={`0.00 ${currencyData.code}`}
          className={`pl-10 w-full p-2 border rounded outline-orange-500 border-orange-500 ${className}`}
          aria-label={`Price in ${currencyData.name}`}
        />
      </div>
    </div>
  );
}
