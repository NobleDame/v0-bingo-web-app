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
  const [showShuffleWarning, setShowShuffleWarning] = useState(false)
  const [winMode, setWinMode] = useState<"line" | "full">("line")

  // Shuffle only on client to avoid hydration mismatch
  useEffect(() => {
    setShuffledItems(shuffleArray(items))
    setIsClient(true)
  }, [items, shuffleKey])

  const handleShuffleClick = () => {
    setShowShuffleWarning(true)
  }

  const confirmShuffle = () => {
    setShuffleKey(prev => prev + 1)
    setShowShuffleWarning(false)
  }

  const cancelShuffle = () => {
    setShowShuffleWarning(false)
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
      {/* Shuffle warning dialog */}
      {showShuffleWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-foreground">Karte wirklich mischen?</h2>
            <p className="text-sm text-muted-foreground">
              Dein aktueller Spielfortschritt geht verloren. Alle markierten Felder werden zurückgesetzt.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelShuffle}
                className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-sm"
              >
                Abbrechen
              </button>
              <button
                onClick={confirmShuffle}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm"
              >
                Ja, mischen
              </button>
            </div>
          </div>
        </div>
      )}

      <GridSizeSelector
        value={gridSize}
        onChange={setGridSize}
        maxSize={items.length}
      />

      {/* Win mode toggle */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm font-medium text-foreground">Gewinnbedingung</span>
        <div className="flex rounded-lg border border-border overflow-hidden text-sm">
          <button
            onClick={() => setWinMode("line")}
            className={`px-4 py-2 transition-colors ${
              winMode === "line"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            Reihe / Spalte / Diagonale
          </button>
          <button
            onClick={() => setWinMode("full")}
            className={`px-4 py-2 transition-colors border-l border-border ${
              winMode === "full"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            Alle Felder
          </button>
        </div>
      </div>

      <button
        onClick={handleShuffleClick}
        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Karten mischen
      </button>

      <BingoCard
        key={shuffleKey}
        items={shuffledItems}
        gridSize={gridSize}
        winMode={winMode}
      />

      <p className="text-xs text-muted-foreground text-center max-w-md">
        Klicke auf ein Feld, um es zu markieren.{" "}
        {winMode === "line"
          ? "Eine vollständige Reihe, Spalte oder Diagonale ergibt BINGO!"
          : "Alle Felder markieren ergibt BINGO!"}
      </p>
    </div>
  )
}
