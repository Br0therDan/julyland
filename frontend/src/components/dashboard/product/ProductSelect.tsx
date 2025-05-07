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
import { useProduct } from '@/hooks/useProduct'
import ProductForm from './ProductForm'

export function ProductSelect() {
  const [open, setOpen] = React.useState(false)
  const { products, selectedProduct, setSelectedProduct } = useProduct()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedProduct
            ? products.find((b) => b.name === selectedProduct.name)?.name
            : "제품 선택"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="제품 검색" className="h-9" />
          <CommandList>
            <CommandEmpty>등록된 제품이 없습니다.</CommandEmpty>
            <CommandGroup>
              {products.map((b) => (
                <CommandItem
                  key={b._id}
                  value={b.name}
                  onSelect={(currentValue) => {
                    setSelectedProduct(currentValue === selectedProduct?.name ? undefined : products.find((b) => b.name === currentValue))
                    setOpen(false)
                  }}
                >
                  {b.name}
                  <Check
                    className={cn(
                      "ml-auto",
                      selectedProduct?.name === b.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
              <ProductForm mode="add" />
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
