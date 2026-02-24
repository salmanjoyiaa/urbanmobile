"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES, getCountryByCode } from "@/lib/country-data";
import { FieldError } from "react-hook-form";

interface PhoneInputProps {
  value: string;
  onChange: (formattedPhone: string) => void;
  onCountryChange?: (countryCode: string) => void;
  selectedCountry?: string;
  placeholder?: string;
  label?: string;
  error?: FieldError;
  disabled?: boolean;
  showHelper?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  onCountryChange,
  selectedCountry = "SA",
  placeholder,
  label = "Phone Number",
  error,
  disabled = false,
  showHelper = true,
}: PhoneInputProps) {
  const [country, setCountry] = useState(selectedCountry);
  const countryData = useMemo(() => getCountryByCode(country), [country]);

  // Extract phone digits from formatted value
  const phoneDigits = value.replace(/\D/g, "").replace(countryData?.dialCode.replace(/\D/g, "") || "", "");

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    onCountryChange?.(newCountry);
  };

  const handlePhoneChange = (inputValue: string) => {
    // Only allow digits
    let digits = inputValue.replace(/\D/g, "");

    // Limit to country's phone digit requirement
    const maxDigits = countryData?.phoneDigits || 15;
    digits = digits.slice(0, maxDigits);

    // Format the complete phone with dial code
    const formattedPhone = `${countryData?.dialCode || ""}${digits}`;
    onChange(formattedPhone);
  };

  const isValidLength = phoneDigits.length === (countryData?.phoneDigits || 0);
  const maxDigits = countryData?.phoneDigits || 15;

  return (
    <div className="space-y-2">
      {label && <Label htmlFor="phone-input">{label}</Label>}
      <div className="flex gap-2">
        <Select value={country} onValueChange={handleCountryChange} disabled={disabled}>
          <SelectTrigger className="w-[140px] shrink-0 bg-background dark:bg-card border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background dark:bg-card border-border">
            {COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.code} className="cursor-pointer">
                <span className="flex items-center gap-2">
                  {c.dialCode} <span className="text-xs text-muted-foreground">{c.code}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex-1">
          <Input
            id="phone-input"
            type="tel"
            placeholder={placeholder || `${"0".repeat(maxDigits)}`}
            value={phoneDigits}
            onChange={(e) => handlePhoneChange(e.target.value)}
            maxLength={maxDigits}
            disabled={disabled}
            className={`bg-background dark:bg-card border-border ${
              error ? "border-destructive" : isValidLength ? "border-green-500 dark:border-green-600" : ""
            }`}
          />
        </div>
      </div>
      {showHelper && (
        <p className={`text-xs ${error ? "text-destructive" : isValidLength ? "text-green-600 dark:text-green-500" : "text-muted-foreground"}`}>
          {error ? (
            error.message
          ) : isValidLength ? (
            `✓ Valid ${countryData?.name} number`
          ) : (
            <>
              {countryData?.dialCode} + {phoneDigits.length}/{maxDigits} digits
            </>
          )}
        </p>
      )}
    </div>
  );
}
