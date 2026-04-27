"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface Teacher {
  id: string
  name: string
  category: string
}

interface Subject {
  id: string
  name: string
}

const teachers: Teacher[] = [
  { id: "1", name: "Herr Graw", category: "graw" },
  { id: "2", name: "Herr Hiss", category: "hiss" },
  { id: "3", name: "Herr Springer", category: "springer" },
]

const subjects: Subject[] = [
  { id: "allgemein", name: "Allgemein" },
  { id: "gk", name: "GK (Gemeinschaftskunde)" },
  { id: "geschichte", name: "Geschichte" },
  { id: "wirtschaft", name: "Wirtschaft" },
  { id: "politik", name: "Politik" },
]

interface AddEntryFormProps {
  onClose: () => void
  onSuccess: () => void
}

export function AddEntryForm({ onClose, onSuccess }: AddEntryFormProps) {
  const [text, setText] = useState("")
  const [selectedTeacher, setSelectedTeacher] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!text.trim()) {
      setError("Bitte gib einen Text ein")
      return
    }
    if (!selectedTeacher) {
      setError("Bitte wähle einen Lehrer")
      return
    }
    if (!selectedSubject) {
      setError("Bitte wähle ein Fach")
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error: insertError } = await supabase
      .from("bingo_items")
      .insert({
        text: text.trim(),
        category: selectedTeacher,
        subject: selectedSubject,
      })

    if (insertError) {
      console.error("Error inserting item:", insertError)
      setError("Fehler beim Speichern. Bitte versuche es erneut.")
      setLoading(false)
      return
    }

    setLoading(false)
    onSuccess()
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Neuen Eintrag hinzufügen</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
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
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="text" className="text-sm font-medium text-foreground">
              Bingo-Text
            </label>
            <input
              id="text"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="z.B. 'sagt Vorsicht!'"
              className="px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="teacher" className="text-sm font-medium text-foreground">
              Lehrer
            </label>
            <select
              id="teacher"
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Lehrer auswählen...</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.category}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="subject" className="text-sm font-medium text-foreground">
              Fach
            </label>
            <select
              id="subject"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Fach auswählen...</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Tipp: Wähle &quot;Allgemein&quot; für Dinge, die der Lehrer in jedem Fach macht.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Speichern..." : "Hinzufügen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
