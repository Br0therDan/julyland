// src/components/ui/MySelect.tsx
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Controller, useFormContext } from "react-hook-form";

interface MySelectProps {
  name: string;
  label?: string;
  placeholder?: string;
  items: any[]; // { label: string; value: string }[];
  className?: string;
  onValueChange?: (val: string) => void;
}

export default function MySelect({
  name,
  label,
  placeholder = "선택",
  items,
  className = "",
  onValueChange,
}: MySelectProps) {
  const { control } = useFormContext();

  return (
    <div className="grid gap-2 w-full">
      {label && <Label>{label}</Label>}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            value={field.value || undefined}
            onValueChange={(val) => {
              field.onChange(val);
              onValueChange?.(val);
            }}
          >
            <SelectTrigger className={`w-full capitalize ${className}`}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="capitalize">
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.name || item.label || item.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </div>
  );
}