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

export interface AsyncComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  fetcher: (search: string) => Promise<any[]>;
  labelKey?: string;
  valueKey?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  preloadItems?: any[];
  extraItems?: any[];
  renderItem?: (item: any) => React.ReactNode;
  renderValue?: (item: any) => React.ReactNode;
  filterItem?: (item: any) => boolean;
  className?: string;
}

export function AsyncCombobox({
  extraItems = [],
  className,
  value,
  onValueChange,
  fetcher,
  labelKey = "nombre",
  valueKey = "id",
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  emptyText = "No se encontraron resultados.",
  disabled = false,
  preloadItems = [],
  renderItem,
  renderValue,
  filterItem
}: AsyncComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [items, setItems] = React.useState<any[]>([])

  React.useEffect(() => {
    if (open) {
      const handler = setTimeout(() => {
        fetcher(search).then(res => {
          setItems(res)
        }).catch(err => console.error(err))
      }, 300)
      return () => clearTimeout(handler)
    }
  }, [open, search, fetcher])

  // merge preloadItems with fetched items to ensure the selected item is always in the list
  const allItems = React.useMemo(() => {
    const map = new Map()
    
    items.forEach(i => {
      if (i && i[valueKey] !== undefined) {
        map.set(String(i[valueKey]), i)
      }
    })

    const lowerSearch = search.trim().toLowerCase()

    preloadItems.forEach(i => {
      if (i && i[valueKey] !== undefined) {
        const idStr = String(i[valueKey])
        if (!map.has(idStr)) {
          let matches = true
          if (lowerSearch && idStr !== String(value)) {
             const itemValues = Object.values(i).map(v => typeof v === 'object' ? JSON.stringify(v) : String(v)).join(" ").toLowerCase()
             matches = itemValues.includes(lowerSearch)
          }
          if (matches) {
            map.set(idStr, i)
          }
        }
      }
    })
    
    let result = Array.from(map.values())
    if (filterItem) {
      result = result.filter(filterItem)
    }
    return result
  }, [items, preloadItems, valueKey, filterItem, search, value])

  const selectedItem = allItems.find((item) => String(item[valueKey]) === String(value)) || preloadItems.find((item) => String(item[valueKey]) === String(value))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between bg-secondary/50 border-0", className)}
        >
          <span className="truncate">
            {selectedItem 
              ? (renderValue ? renderValue(selectedItem) : selectedItem[labelKey]) 
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {allItems.map((item) => (
                <CommandItem
                  key={String(item[valueKey])}
                  value={String(item[valueKey])}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      String(value) === String(item[valueKey]) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">
                    {renderItem ? renderItem(item) : item[labelKey]}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
