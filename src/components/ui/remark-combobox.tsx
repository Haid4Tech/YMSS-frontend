"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface RemarkGroup {
  label: string;
  range?: string;
  options: string[];
}

interface RemarkComboboxProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  groups: RemarkGroup[];
  placeholder?: string;
  id?: string;
}

/*
  A text field that doubles as a searchable dropdown. The user can freely type a
  remark or pick from the suggestions, which are grouped by performance band and
  filter as they type. Built without a command-palette dependency: an input plus
  a click-outside-aware list.
*/
export function RemarkCombobox({
  label,
  value,
  onChange,
  groups,
  placeholder,
  id,
}: RemarkComboboxProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside the field/list.
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const query = value.trim().toLowerCase();
  const filteredGroups = groups
    .map((group) => ({
      ...group,
      options: query
        ? group.options.filter((option) =>
            option.toLowerCase().includes(query)
          )
        : group.options,
    }))
    .filter((group) => group.options.length > 0);

  return (
    <div className="flex flex-col gap-2" ref={containerRef}>
      <Label htmlFor={id} className="px-1">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          value={value}
          placeholder={placeholder}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="pr-9"
          autoComplete="off"
        />
        <ChevronsUpDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />

        {open && filteredGroups.length > 0 && (
          <ul className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-md border bg-popover p-1 text-sm shadow-md">
            {filteredGroups.map((group) => (
              <li key={group.label}>
                <p className="sticky top-0 bg-popover px-2 py-1 text-xs font-bold uppercase tracking-wide text-main-blue">
                  {group.label}
                  {group.range && (
                    <span className="ml-1 font-semibold normal-case">
                      ({group.range})
                    </span>
                  )}
                </p>
                <ul>
                  {group.options.map((option) => (
                    <li key={option}>
                      <button
                        type="button"
                        // Select before the input's blur fires.
                        onMouseDown={(e) => {
                          e.preventDefault();
                          onChange(option);
                          setOpen(false);
                        }}
                        className={cn(
                          "w-full cursor-pointer rounded-sm px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground",
                          option === value && "bg-accent/60"
                        )}
                      >
                        {option}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
