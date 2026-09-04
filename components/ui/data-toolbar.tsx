"use client";

import * as React from "react";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { SearchInput, Select, type SelectOption } from "./input";
import { Button } from "./button";

export interface ToolbarFilter {
  key: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
}

interface DataToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ToolbarFilter[];
  onMoreFilters?: () => void;
  onClearFilters?: () => void;
  className?: string;
}

/**
 * Shared search + filter row used at the top of every module's table/list.
 * Reused across Members, Families, Sacraments, Finance, Property, Inventory,
 * Employees, Certificates, Audit Logs — do not recreate this per module.
 */
export function DataToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  onMoreFilters,
  onClearFilters,
  className,
}: DataToolbarProps) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className ?? ""}`}>
      <div className="min-w-[220px] flex-1">
        <SearchInput
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label="Search"
        />
      </div>

      {filters.map((f) => (
        <div key={f.key} className="w-[160px] shrink-0">
          <Select
            value={f.value}
            onChange={(e) => f.onChange(e.target.value)}
            options={f.options}
            aria-label={f.key}
          />
        </div>
      ))}

      {onMoreFilters && (
        <Button variant="secondary" size="md" icon={<SlidersHorizontal size={16} />} onClick={onMoreFilters}>
          More Filters
        </Button>
      )}

      {onClearFilters && (
        <Button variant="ghost" size="md" icon={<RotateCcw size={16} />} onClick={onClearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  );
}
