"use client"

import { useState, useEffect, useRef } from "react"
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

function getCompletedLines(selected: Set<number>, gridSize: number): number[][] {
  const lines: number[][] = []

  // Rows
  for (let row = 0; row < gridSize; row++) {
    const cells = Array.from({ length: gridSize }, (_, col) => row * gridSize + col)
    if (cells.every(c => selected.has(c))) lines.push(cells)
  }
  // Columns
  for (let col = 0; col < gridSize; col++) {
    const cells = Array.from({ length: gridSize }, (_, row) => row * gridSize + col)
    if (cells.every(c => selected.has(c))) lines.push(cells)
  }
  // Diagonal top-left → bottom-right
  const diag1 = Array.from({ length: gridSize }, (_, i) => i * gridSize + i)
  if (diag1.every(c => selected.has(c))) lines.push(diag1)
  // Diagonal top-right → bottom-left
  const diag2 = Array.from({ length: gridSize }, (_, i) => i * gridSize + (gridSize - 1 - i))
  if (diag2.every(c => selected.has(c))) lines.push(diag2)

  return lines
}

export function BingoCard({ items, gridSize, winMode = "line" }: BingoCardProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [bingoCount, setBingoCount] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const prevCompletedRef = useRef<number>(0)

  const totalCells = gridSize * gridSize

  useEffect(() => {
    if (winMode === "full") {
      if (selected.size === totalCells) {
        if (!isGameOver) {
          setIsGameOver(true)
          setBingoCount(prev => prev + 1)
          confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } })
        }
      }
    } else {
      const completedLines = getCompletedLines(selected, gridSize)
      const newCount = completedLines.length

      if (newCount > prevCompletedRef.current) {
        // New bingo(s) achieved
        const gained = newCount - prevCompletedRef.current
        setBingoCount(prev => prev + gained)
        confetti({ particleCount: 100 + gained * 50, spread: 70, origin: { y: 0.6 } })
      }
      prevCompletedRef.current = newCount

      // Game over only when all cells are filled
      if (selected.size === totalCells && !isGameOver) {
        setIsGameOver(true)
        confetti({ particleCount: 300, spread: 120, origin: { y: 0.5 } })
      }
    }
  }, [selected, gridSize, totalCells, winMode, isGameOver])

  const toggleCell = (index: number) => {
    if (isGameOver) return
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const resetGame = () => {
    setSelected(new Set())
    setBingoCount(0)
    setIsGameOver(false)
    prevCompletedRef.current = 0
  }

  const completedCells = winMode === "line"
    ? new Set(getCompletedLines(selected, gridSize).flat())
    : new Set<number>()

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Status bar */}
      <div className="flex items-center gap-4">
        {bingoCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
            <span className="text-primary font-bold text-lg">{bingoCount}x BINGO</span>
          </div>
        )}
        {isGameOver && (
          <div className="text-lg font-bold text-foreground animate-bounce">
            Karte voll!
          </div>
        )}
      </div>

      <div
        className="grid gap-2 w-full max-w-2xl"
        style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
      >
        {items.slice(0, totalCells).map((item, index) => {
          const isSelected = selected.has(index)
          const isCompleted = completedCells.has(index)
          return (
            <button
              key={item.id}
              onClick={() => toggleCell(index)}
              disabled={isGameOver}
              className={cn(
                "aspect-square p-2 rounded-lg border-2 transition-all duration-200",
                "flex items-center justify-center text-center",
                "text-xs sm:text-sm font-medium leading-tight",
                "hover:scale-105 hover:shadow-md disabled:cursor-default disabled:hover:scale-100",
                isCompleted
                  ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/40 ring-offset-1"
                  : isSelected
                    ? "bg-primary/70 text-primary-foreground border-primary/70"
                    : "bg-card text-card-foreground border-border hover:border-primary/50"
              )}
            >
              <span className="line-clamp-4">{item.text}</span>
            </button>
          )
        })}
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
