"use client"

import { useState, useEffect } from "react"
import { BingoCard } from "./bingo-card"
import { GridSizeSelector } from "./grid-size-selector"

interface BingoItem {
  id: string
  text: string
  category: string
}

interface BingoGameProps {
  items: BingoItem[]
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function BingoGame({ items }: BingoGameProps) {
  const [gridSize, setGridSize] = useState(4)
  const [shuffleKey, setShuffleKey] = useState(0)
  const [shuffledItems, setShuffledItems] = useState<BingoItem[]>([])
  const [isClient, setIsClient] = useState(false)

  // Shuffle only on client to avoid hydration mismatch
  useEffect(() => {
    setShuffledItems(shuffleArray(items))
    setIsClient(true)
  }, [items, shuffleKey])

  const handleNewGame = () => {
    setShuffleKey(prev => prev + 1)
  }

  if (!isClient) {
    return (
      <div className="flex flex-col items-center gap-8 py-12">
        <div className="animate-pulse text-muted-foreground">
          Lade Bingo-Karte...
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <GridSizeSelector
        value={gridSize}
        onChange={setGridSize}
        maxSize={items.length}
      />
      
      <button
        onClick={handleNewGame}
        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Karten mischen
      </button>

      <BingoCard 
        key={shuffleKey}
        items={shuffledItems} 
        gridSize={gridSize} 
      />

      <p className="text-xs text-muted-foreground text-center max-w-md">
        Klicke auf ein Feld, um es zu markieren. 
        Eine vollständige Reihe, Spalte oder Diagonale ergibt BINGO!
      </p>
    </div>
  )
}
