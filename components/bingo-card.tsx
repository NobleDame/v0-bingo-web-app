"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import confetti from "canvas-confetti"

interface BingoItem {
  id: string
  text: string
}

interface BingoCardProps {
  items: BingoItem[]
  gridSize: number
  winMode?: "line" | "full"
}

export function BingoCard({ items, gridSize, winMode = "line" }: BingoCardProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [hasBingo, setHasBingo] = useState(false)

  const toggleCell = (index: number) => {
    const newSelected = new Set(selected)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelected(newSelected)
  }

  const totalCells = gridSize * gridSize

  // Check for bingo
  useEffect(() => {
    const won = winMode === "full"
      ? selected.size === totalCells
      : checkBingo(selected, gridSize)
    if (won) {
      if (!hasBingo) {
        setHasBingo(true)
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        })
      }
    } else {
      setHasBingo(false)
    }
  }, [selected, gridSize, hasBingo, winMode, totalCells])

  const resetGame = () => {
    setSelected(new Set())
    setHasBingo(false)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {hasBingo && (
        <div className="text-4xl font-bold text-primary animate-bounce">
          BINGO!
        </div>
      )}
      
      <div 
        className="grid gap-2 w-full max-w-2xl"
        style={{ 
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` 
        }}
      >
        {items.slice(0, gridSize * gridSize).map((item, index) => (
          <button
            key={item.id}
            onClick={() => toggleCell(index)}
            className={cn(
              "aspect-square p-2 rounded-lg border-2 transition-all duration-200",
              "flex items-center justify-center text-center",
              "text-xs sm:text-sm font-medium leading-tight",
              "hover:scale-105 hover:shadow-md",
              selected.has(index)
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-card-foreground border-border hover:border-primary/50"
            )}
          >
            <span className="line-clamp-4">{item.text}</span>
          </button>
        ))}
      </div>

      <button
        onClick={resetGame}
        className="px-6 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
      >
        Neues Spiel
      </button>
    </div>
  )
}

function checkBingo(selected: Set<number>, gridSize: number): boolean {
  // Check rows
  for (let row = 0; row < gridSize; row++) {
    let rowComplete = true
    for (let col = 0; col < gridSize; col++) {
      if (!selected.has(row * gridSize + col)) {
        rowComplete = false
        break
      }
    }
    if (rowComplete) return true
  }

  // Check columns
  for (let col = 0; col < gridSize; col++) {
    let colComplete = true
    for (let row = 0; row < gridSize; row++) {
      if (!selected.has(row * gridSize + col)) {
        colComplete = false
        break
      }
    }
    if (colComplete) return true
  }

  // Check diagonal (top-left to bottom-right)
  let diag1Complete = true
  for (let i = 0; i < gridSize; i++) {
    if (!selected.has(i * gridSize + i)) {
      diag1Complete = false
      break
    }
  }
  if (diag1Complete) return true

  // Check diagonal (top-right to bottom-left)
  let diag2Complete = true
  for (let i = 0; i < gridSize; i++) {
    if (!selected.has(i * gridSize + (gridSize - 1 - i))) {
      diag2Complete = false
      break
    }
  }
  if (diag2Complete) return true

  return false
}
