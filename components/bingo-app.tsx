"use client"

import { useState } from "react"
import { TeacherSelector } from "./teacher-selector"
import { SubjectSelector } from "./subject-selector"
import { BingoGame } from "./bingo-game"
import { AddEntryForm } from "./add-entry-form"
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
  { id: "4", name: "Frau Dr Wolff", category: "wolff" },
]

type Step = "home" | "teacher" | "subject" | "game"

export function BingoApp() {
  const [step, setStep] = useState<Step>("home")
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [items, setItems] = useState<BingoItem[]>([])
  const [loading, setLoading] = useState(false)

  const handleStartGame = () => {
    setStep("teacher")
  }

  const handleTeacherSelect = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setStep("subject")
  }

  const handleSubjectSelect = async (subject: string) => {
    setSelectedSubject(subject)
    setLoading(true)
    setStep("game")

    const supabase = createClient()

    // Load both "allgemein" entries AND subject-specific entries for the selected teacher
    const { data, error } = await supabase
      .from("bingo_items")
      .select("*")
      .eq("category", selectedTeacher!.category)
      .in("subject", ["allgemein", subject])

    if (error) {
      console.error("Error fetching items:", error)
      setItems([])
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }

  const handleBack = () => {
    if (step === "game") {
      setStep("subject")
      setSelectedSubject(null)
      setItems([])
    } else if (step === "subject") {
      setStep("teacher")
      setSelectedTeacher(null)
    } else if (step === "teacher") {
      setStep("home")
    }
  }

  const handleBackToHome = () => {
    setStep("home")
    setSelectedTeacher(null)
    setSelectedSubject(null)
    setItems([])
  }

  if (step === "home") {
    return (
      <div className="flex flex-col gap-12">
        <div className="text-center">
          <button
            onClick={handleStartGame}
            className="px-8 py-4 bg-primary text-primary-foreground rounded-xl text-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg"
          >
            Bingo starten
          </button>
        </div>

        <div className="border-t border-border pt-8">
          <AddEntryForm teachers={teachers} />
        </div>
      </div>
    )
  }

  if (step === "teacher") {
    return (
      <div className="flex flex-col gap-6">
        <button
          onClick={handleBack}
          className="self-start text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Zurück
        </button>
        <TeacherSelector teachers={teachers} onSelect={handleTeacherSelect} />
      </div>
    )
  }

  if (step === "subject") {
    return (
      <div className="flex flex-col gap-6">
        <button
          onClick={handleBack}
          className="self-start text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Zurück
        </button>
        <SubjectSelector
          teacherCategory={selectedTeacher!.category}
          teacherName={selectedTeacher!.name}
          onSelect={handleSubjectSelect}
          onBack={handleBack}
        />
      </div>
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
          Keine Bingo-Einträge für {selectedTeacher?.name} im Fach {selectedSubject} gefunden.
        </p>
        <p className="text-sm text-muted-foreground text-center">
          Füge zuerst Einträge über das Formular auf der Startseite hinzu.
        </p>
        <div className="flex gap-4">
          <button
            onClick={handleBack}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Zurück zur Fachauswahl
          </button>
          <button
            onClick={handleBackToHome}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Einträge hinzufügen
          </button>
        </div>
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
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Zurück
        </button>
        <span className="text-sm text-muted-foreground">
          {selectedTeacher?.name} - {selectedSubject}
        </span>
      </div>
      <BingoGame items={items} />
    </div>
  )
}
