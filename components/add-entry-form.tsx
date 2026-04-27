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

const subjects: Subject[] = [
  { id: "allgemein", name: "Allgemein (in jedem Fach)" },
  { id: "gk", name: "GK (Gemeinschaftskunde)" },
  { id: "geschichte", name: "Geschichte" },
  { id: "wirtschaft", name: "Wirtschaft" },
  { id: "politik", name: "Politik" },
  { id: "deutsch", name: "Deutsch" },
  { id: "mathe", name: "Mathematik" },
  { id: "englisch", name: "Englisch" },
]

interface AddEntryFormProps {
  teachers: Teacher[]
}

export function AddEntryForm({ teachers }: AddEntryFormProps) {
  const [text, setText] = useState("")
  const [selectedTeacher, setSelectedTeacher] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

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

    // Reset form
    setText("")
    setSelectedTeacher("")
    setSelectedSubject("")
    setLoading(false)
    setSuccess(true)

    // Hide success message after 3 seconds
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Neuen Bingo-Eintrag hinzufügen
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Hilf mit, das Bingo zu erweitern! Füge typische Sprüche oder Verhaltensweisen der Lehrer hinzu.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="text" className="text-sm font-medium text-foreground">
            Bingo-Text
          </label>
          <input
            id="text"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="z.B. 'sagt Vorsicht!' oder 'unterbricht Julia'"
            className="px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Tipp: Wähle &quot;Allgemein&quot; für Dinge, die der Lehrer in jedem Fach macht. Diese erscheinen dann immer im Bingo.
        </p>

        {error && (
          <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 text-sm">
            Eintrag erfolgreich hinzugefügt!
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto self-end px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Speichern..." : "Hinzufügen"}
        </button>
      </form>
    </div>
  )
}
