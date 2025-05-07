"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useCategory } from '@/hooks/useCategory'
import BrandForm from './BrandForm'

export function BrandSwitch() {
  const [open, setOpen] = React.useState(false)
  const { brands, selectedBrand, setSelectedBrand } = useCategory()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedBrand
            ? brands.find((b) => b.name === selectedBrand.name)?.name
            : "브랜드 선택"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="브랜드 검색" className="h-9" />
          <CommandList>
            <CommandEmpty>등록된 브랜드가 없습니다.</CommandEmpty>
            <CommandGroup>
              {brands.map((b) => (
                <CommandItem
                  key={b._id}
                  value={b.name}
                  onSelect={(currentValue) => {
                    setSelectedBrand(currentValue === selectedBrand?.name ? undefined : brands.find((b) => b.name === currentValue))
                    setOpen(false)
                    event?.preventDefault()
                  }}
                >
                  {b.name}
                  <Check
                    className={cn(
                      "ml-auto",
                      selectedBrand?.name === b.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>

              ))}
              <BrandForm mode="add" />
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
