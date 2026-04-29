"use client"

import { useState, useEffect } from "react"
import { TeacherSelector } from "./teacher-selector"
import { SubjectSelector } from "./subject-selector"
import { BingoGame } from "./bingo-game"
import { AddEntryForm } from "./add-entry-form"
import { MultiplayerLobby } from "./multiplayer-lobby"
import { MultiplayerGame } from "./multiplayer-game"
import { createClient } from "@/lib/supabase/client"
import type { Teacher } from "./teacher-selector"
import type { Subject } from "./subject-selector"
import type { Session } from "./multiplayer-lobby"

interface BingoItem {
  id: string
  text: string
  category: string
  subject: string
}

type Step = "home" | "teacher" | "subject" | "game" | "multiplayer-lobby" | "multiplayer-game"

export function BingoApp() {
  const [step, setStep] = useState<Step>("home")
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loadingTeachers, setLoadingTeachers] = useState(true)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [items, setItems] = useState<BingoItem[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  // Multiplayer state
  const [multiSession, setMultiSession] = useState<Session | null>(null)
  const [multiPlayerId, setMultiPlayerId] = useState("")
  const [multiPlayerName, setMultiPlayerName] = useState("")
  const [multiPlayerColor, setMultiPlayerColor] = useState("")

  // Load teachers + their subjects from DB on mount
  useEffect(() => {
    const fetchTeachers = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("teachers")
        .select("id, name, category, subjects(id, name, slug)")
        .order("name")

      if (error) {
        console.error("Error fetching teachers:", error)
      } else {
        setTeachers((data ?? []) as Teacher[])
      }
      setLoadingTeachers(false)
    }
    fetchTeachers()
  }, [])

  const handleTeacherSelect = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setStep("subject")
  }

  const handleSubjectSelect = async (subject: Subject) => {
    setSelectedSubject(subject)
    setLoadingItems(true)
    setStep("game")

    const supabase = createClient()
    const { data, error } = await supabase
      .from("bingo_items")
      .select("*")
      .eq("category", selectedTeacher!.category)
      .in("subject", ["allgemein", subject.slug])

    if (error) {
      console.error("Error fetching items:", error)
      setItems([])
    } else {
      setItems(data ?? [])
    }
    setLoadingItems(false)
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
    setMultiSession(null)
  }

  const handleMultiplayerJoin = async (session: Session, playerId: string, name: string, color: string) => {
    // Always load items fresh from session data
    const supabase = createClient()
    const { data } = await supabase
      .from("bingo_items")
      .select("*")
      .eq("category", session.teacher_category)
      .in("subject", ["allgemein", session.subject_slug])
    setItems(data ?? [])
    setMultiSession(session)
    setMultiPlayerId(playerId)
    setMultiPlayerName(name)
    setMultiPlayerColor(color)
    setStep("multiplayer-game")
  }

  const BackButton = ({ label = "Zurück" }: { label?: string }) => (
    <button
      onClick={handleBack}
      className="self-start text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 18-6-6 6-6" />
      </svg>
      {label}
    </button>
  )

  if (step === "multiplayer-lobby") {
    return (
      <MultiplayerLobby
        onJoin={handleMultiplayerJoin}
        onBack={handleBackToHome}
      />
    )
  }

  if (step === "multiplayer-game" && multiSession) {
    return (
      <MultiplayerGame
        session={multiSession}
        playerId={multiPlayerId}
        playerName={multiPlayerName}
        playerColor={multiPlayerColor}
        items={items}
        onBack={handleBackToHome}
      />
    )
  }

  if (step === "home") {
    return (
      <div className="flex flex-col gap-12">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setStep("teacher")}
            className="px-8 py-4 bg-primary text-primary-foreground rounded-xl text-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg"
          >
            Singleplayer
          </button>
          <button
            onClick={() => setStep("multiplayer-lobby")}
            className="px-8 py-4 border-2 border-primary text-primary rounded-xl text-xl font-semibold hover:bg-primary/10 transition-colors"
          >
            Multiplayer
          </button>
        </div>

        <div className="border-t border-border pt-8">
          {loadingTeachers ? (
            <div className="animate-pulse text-muted-foreground text-center py-6">Lade...</div>
          ) : (
            <AddEntryForm teachers={teachers} />
          )}
        </div>
      </div>
    )
  }

  if (step === "teacher") {
    return (
      <div className="flex flex-col gap-6">
        <BackButton />
        {loadingTeachers ? (
          <div className="animate-pulse text-muted-foreground text-center py-12">Lade Lehrer...</div>
        ) : (
          <TeacherSelector teachers={teachers} onSelect={handleTeacherSelect} />
        )}
      </div>
    )
  }

  if (step === "subject") {
    return (
      <div className="flex flex-col gap-6">
        <BackButton />
        <SubjectSelector
          teacherName={selectedTeacher!.name}
          subjects={selectedTeacher!.subjects}
          onSelect={handleSubjectSelect}
        />
      </div>
    )
  }

  if (loadingItems) {
    return (
      <div className="flex flex-col items-center gap-8 py-12">
        <div className="animate-pulse text-muted-foreground">Lade Bingo-Einträge...</div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <p className="text-muted-foreground text-center">
          Keine Bingo-Einträge für {selectedTeacher?.name} im Fach {selectedSubject?.name} gefunden.
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
      <div className="flex items-center justify-between flex-wrap gap-2">
        <BackButton />
        <span className="text-sm text-muted-foreground">
          {selectedTeacher?.name} &mdash; {selectedSubject?.name}
        </span>
        <button
          onClick={() => setStep("multiplayer-lobby")}
          className="text-xs px-3 py-1.5 rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors"
        >
          Multiplayer starten
        </button>
      </div>
      <BingoGame items={items} />
    </div>
  )
}
