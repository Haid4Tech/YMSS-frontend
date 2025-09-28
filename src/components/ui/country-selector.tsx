"use client";

import { useState, useEffect, useMemo, memo, useCallback } from "react";
import { useAtom } from "jotai";
import { countryAPI } from "@/jotai/country/country";
import { Country } from "@/common/types/country";
import { SelectField } from "@/components/ui/form-field";
import { SelectItem } from "@/components/ui/select";
import { extractErrorMessage } from "@/utils/helpers";
import { useDebounce } from "@/hooks/useDebounce";

interface CountrySelectorProps {
  label?: string;
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  showCode?: boolean;
  continent?: string;
  search?: string;
}

const CountrySelector: React.FC<CountrySelectorProps> = memo(({
  label = "Country",
  value,
  onValueChange,
  placeholder = "Select Country",
  required = false,
  className,
  showCode = false,
  continent,
  search,
}) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, getAllCountries] = useAtom(countryAPI.getAll);

  // Debounce search term to prevent excessive API calls
  const debouncedSearch = useDebounce(search, 300);

  // Memoize the fetch function to prevent unnecessary re-creation
  const fetchCountries = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const countriesData = await getAllCountries(continent, debouncedSearch);
      setCountries(Array.isArray(countriesData) ? countriesData : []);
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
      console.error("Failed to fetch countries:", errorMessage);
      setCountries([]);
    } finally {
      setLoading(false);
    }
  }, [getAllCountries, continent, debouncedSearch]);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  // Memoize the country options to prevent re-rendering on every render
  const countryOptions = useMemo(() => {
    return countries.map((country) => (
      <SelectItem key={country.id} value={country.name}>
        {showCode ? `${country.name} (${country.code})` : country.name}
      </SelectItem>
    ));
  }, [countries, showCode]);

  // Memoize the onValueChange handler to prevent unnecessary re-renders
  const handleValueChange = useCallback((value: string) => {
    onValueChange(value);
  }, [onValueChange]);

  if (error) {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="text-sm font-medium text-destructive">{label}</label>
        <div className="text-sm text-destructive">
          Failed to load countries: {error}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <SelectField
        label={label}
        value={value}
        onValueChange={handleValueChange}
        placeholder={loading ? "Loading countries..." : placeholder}
        required={required}
      >
        {countryOptions}
      </SelectField>
    </div>
  );
});

CountrySelector.displayName = "CountrySelector";

export default CountrySelector;
