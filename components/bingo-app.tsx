"use client"

import { useState } from "react"
import { TeacherSelector } from "./teacher-selector"
import { BingoGame } from "./bingo-game"

interface BingoItem {
  id: string
  text: string
  category: string
}

interface BingoAppProps {
  items: BingoItem[]
}

export function BingoApp({ items }: BingoAppProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredItems = selectedCategory
    ? items.filter((item) => item.category === selectedCategory)
    : []

  const handleBack = () => {
    setSelectedCategory(null)
  }

  if (!selectedCategory) {
    return <TeacherSelector onSelect={setSelectedCategory} />
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <button
        onClick={handleBack}
        className="self-start flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Zurück zur Lehrerauswahl
      </button>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Keine Bingo-Einträge für diesen Lehrer gefunden.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Füge zuerst Einträge mit der passenden Kategorie hinzu.
          </p>
        </div>
      ) : (
        <BingoGame items={filteredItems} />
      )}
    </div>
  )
}
