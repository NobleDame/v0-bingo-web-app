"use client"

import { cn } from "@/lib/utils"

interface GridSizeSelectorProps {
  value: number
  onChange: (size: number) => void
  maxSize: number
}

const GRID_OPTIONS = [3, 4, 5, 6]

export function GridSizeSelector({ value, onChange, maxSize }: GridSizeSelectorProps) {
  const availableOptions = GRID_OPTIONS.filter(size => size * size <= maxSize)

  return (
    <div className="flex flex-col items-center gap-3">
      <label className="text-sm font-medium text-muted-foreground">
        Feldgröße wählen
      </label>
      <div className="flex gap-2">
        {availableOptions.map((size) => (
          <button
            key={size}
            onClick={() => onChange(size)}
            className={cn(
              "w-12 h-12 rounded-lg font-bold transition-all",
              "flex items-center justify-center",
              value === size
                ? "bg-primary text-primary-foreground shadow-lg scale-110"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {size}x{size}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {value * value} Felder
      </p>
    </div>
  )
}
