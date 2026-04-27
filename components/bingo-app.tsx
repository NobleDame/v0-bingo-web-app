"use client"

import { useState } from "react"
import { TeacherSelector } from "./teacher-selector"
import { SubjectSelector } from "./subject-selector"
import { BingoGame } from "./bingo-game"
import { createClient } from "@/lib/supabase/client"

interface BingoItem {
  id: string
  text: string
  category: string
  subject: string
}

interface Teacher {
  id: string
  name: string
  category: string
}

const teachers: Teacher[] = [
  { id: "1", name: "Herr Graw", category: "graw" },
  { id: "2", name: "Herr Hiss", category: "hiss" },
  { id: "3", name: "Herr Springer", category: "springer" },
]

export function BingoApp() {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [items, setItems] = useState<BingoItem[]>([])
  const [loading, setLoading] = useState(false)

  const handleTeacherSelect = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setSelectedSubject(null)
    setItems([])
  }

  const handleSubjectSelect = async (subject: string) => {
    setSelectedSubject(subject)
    setLoading(true)

    const supabase = createClient()
    
    let query = supabase
      .from("bingo_items")
      .select("*")
      .eq("category", selectedTeacher!.category)
    
    if (subject !== "alle") {
      query = query.eq("subject", subject)
    }
    
    const { data, error } = await query

    if (error) {
      console.error("Error fetching items:", error)
      setItems([])
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }

  const handleBack = () => {
    if (selectedSubject) {
      setSelectedSubject(null)
      setItems([])
    } else {
      setSelectedTeacher(null)
    }
  }

  if (!selectedTeacher) {
    return <TeacherSelector teachers={teachers} onSelect={handleTeacherSelect} />
  }

  if (!selectedSubject) {
    return (
      <SubjectSelector 
        teacherCategory={selectedTeacher.category}
        teacherName={selectedTeacher.name}
        onSelect={handleSubjectSelect}
        onBack={handleBack}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-8 py-12">
        <div className="animate-pulse text-muted-foreground">
          Lade Bingo-Einträge...
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <p className="text-muted-foreground text-center">
          Keine Bingo-Einträge für {selectedTeacher.name} im Fach {selectedSubject === "alle" ? "Alle Fächer" : selectedSubject} gefunden.
        </p>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Zurück zur Fachauswahl
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Zurück
        </button>
        <span className="text-sm text-muted-foreground">
          {selectedTeacher.name} - {selectedSubject === "alle" ? "Alle Fächer" : selectedSubject}
        </span>
      </div>
      <BingoGame items={items} />
    </div>
  )
}
