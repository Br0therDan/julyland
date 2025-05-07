// src/components/common/forms/DynamicFieldArray.tsx
import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Trash2Icon, PlusCircle } from "lucide-react";

export interface FieldConfig {
  name: string;
  type: "input" | "select";
  placeholder?: string;
  options?: { label: string; value: string }[];
  className?: string;
}

interface DynamicFieldArrayProps<T extends Record<string, any>> {
  name: string;
  label?: string;
  defaultItem: T;
  fields: FieldConfig[];
  addButtonLabel?: string;
}

export default function MyDynamicFieldArray<T extends Record<string, any>>({
  name,
  label,
  defaultItem,
  fields,
  addButtonLabel = "항목 추가",
}: DynamicFieldArrayProps<T>) {
  const { watch, setValue, control, register } = useFormContext();
  const values: T[] = watch(name) || [];

  const handleAdd = () => setValue(name, [...values, defaultItem], { shouldDirty: true });
  const handleRemove = (idx: number) =>
    setValue(
      name,
      values.filter((_, i) => i !== idx),
      { shouldDirty: true }
    );

  return (
    <div className="grid gap-2 w-full">
      {label && <Label>{label}</Label>}
      {values.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {fields.map((fc) => {
            const path = `${name}.${index}.${fc.name}`;
            if (fc.type === "select" && fc.options) {
              return (
                <Controller
                  key={fc.name}
                  name={path}
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className={fc.className}>
                        <SelectValue placeholder={fc.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {(fc.options ?? []).map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              );
            }
            // input 타입 필드
            return (
              <Input
                key={fc.name}
                {...register(path)}
                placeholder={fc.placeholder}
                className={fc.className}
              />
            );
          })}
          <Button variant="ghost" onClick={() => handleRemove(index)}>
            <Trash2Icon />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" className="w-full" onClick={handleAdd}>
        <PlusCircle className="mr-2 h-4 w-4" />
        {addButtonLabel}
      </Button>
    </div>
  );
}
