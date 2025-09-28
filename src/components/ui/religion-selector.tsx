"use client";

import { useState, useEffect, useMemo, memo, useCallback } from "react";
import { useAtom } from "jotai";
import { religionAPI } from "@/jotai/religion/religion";
import { Religion } from "@/common/types/religion";
import { SelectField } from "@/components/ui/form-field";
import { SelectItem } from "@/components/ui/select";
import { extractErrorMessage } from "@/utils/helpers";

interface ReligionSelectorProps {
  label?: string;
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  showCode?: boolean;
}

const ReligionSelector: React.FC<ReligionSelectorProps> = memo(({
  label = "Religion",
  value,
  onValueChange,
  placeholder = "Select Religion",
  required = false,
  className,
  showCode = false,
}) => {
  const [religions, setReligions] = useState<Religion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, getAllReligions] = useAtom(religionAPI.getAll);

  // Memoize the fetch function to prevent unnecessary re-creation
  const fetchReligions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const religionsData = await getAllReligions();
      setReligions(Array.isArray(religionsData) ? religionsData : []);
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
      console.error("Failed to fetch religions:", errorMessage);
      setReligions([]);
    } finally {
      setLoading(false);
    }
  }, [getAllReligions]);

  useEffect(() => {
    fetchReligions();
  }, [fetchReligions]);

  // Memoize the religion options to prevent re-rendering on every render
  const religionOptions = useMemo(() => {
    return religions.map((religion) => (
      <SelectItem key={religion.id} value={religion.name}>
        {showCode ? `${religion.name} (${religion.code})` : religion.name}
      </SelectItem>
    ));
  }, [religions, showCode]);

  // Memoize the onValueChange handler to prevent unnecessary re-renders
  const handleValueChange = useCallback((value: string) => {
    onValueChange(value);
  }, [onValueChange]);

  if (error) {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="text-sm font-medium text-destructive">{label}</label>
        <div className="text-sm text-destructive">
          Failed to load religions: {error}
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
        placeholder={loading ? "Loading religions..." : placeholder}
        required={required}
      >
        {religionOptions}
      </SelectField>
    </div>
  );
});

ReligionSelector.displayName = "ReligionSelector";

export default ReligionSelector;
