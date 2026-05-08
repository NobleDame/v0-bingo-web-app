"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface BingoItem {
  id: string
  text: string
  category: string
  subject: string
  created_at: string
}

interface Subject {
  id: string
  name: string
  slug: string
}

interface Teacher {
  id: string
  name: string
  category: string
  created_at: string
  subjects: Subject[]
}

export default function DevPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState("")
  const [pwError, setPwError] = useState(false)

  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [items, setItems] = useState<BingoItem[]>([])
  const [loading, setLoading] = useState(false)

  // New teacher form
  const [newTeacherName, setNewTeacherName] = useState("")
  const [newTeacherCategory, setNewTeacherCategory] = useState("")
  const [newSubjectName, setNewSubjectName] = useState("")
  const [newSubjectSlug, setNewSubjectSlug] = useState("")
  const [selectedTeacherForSubject, setSelectedTeacherForSubject] = useState("")
  const [savingTeacher, setSavingTeacher] = useState(false)
  const [savingSubject, setSavingSubject] = useState(false)

  // Filter state
  const [filterTeacher, setFilterTeacher] = useState("all")
  const [activeTab, setActiveTab] = useState<"items" | "teachers">("items")

  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null)

  const showFeedback = (msg: string, ok: boolean) => {
    setFeedback({ msg, ok })
    setTimeout(() => setFeedback(null), 3000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const [{ data: tData }, { data: iData }] = await Promise.all([
      supabase
        .from("teachers")
        .select("*, subjects(*)")
        .order("name"),
      supabase
        .from("bingo_items")
        .select("*")
        .order("category")
        .order("subject")
        .order("text"),
    ])
    setTeachers((tData as Teacher[]) ?? [])
    setItems((iData as BingoItem[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (authed) load()
  }, [authed, load])

  const handleLogin = () => {
    if (pw === "dev") {
      setAuthed(true)
      setPwError(false)
    } else {
      setPwError(true)
    }
  }

  const deleteItem = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("bingo_items").delete().eq("id", id)
    if (error) { showFeedback("Fehler beim Loeschen: " + error.message, false); return }
    setItems(prev => prev.filter(i => i.id !== id))
    showFeedback("Eintrag geloescht.", true)
  }

  const deleteTeacher = async (id: string) => {
    if (!confirm("Lehrer und alle zugehoerigen Eintraege loeschen?")) return
    const supabase = createClient()
    const { error } = await supabase.from("teachers").delete().eq("id", id)
    if (error) { showFeedback("Fehler: " + error.message, false); return }
    await load()
    showFeedback("Lehrer geloescht.", true)
  }

  const deleteSubject = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("subjects").delete().eq("id", id)
    if (error) { showFeedback("Fehler: " + error.message, false); return }
    await load()
    showFeedback("Fach geloescht.", true)
  }

  const addTeacher = async () => {
    if (!newTeacherName.trim() || !newTeacherCategory.trim()) return
    setSavingTeacher(true)
    const supabase = createClient()
    const { error } = await supabase.from("teachers").insert({
      name: newTeacherName.trim(),
      category: newTeacherCategory.trim().toLowerCase().replace(/\s+/g, "_"),
    })
    if (error) { showFeedback("Fehler: " + error.message, false) }
    else {
      setNewTeacherName("")
      setNewTeacherCategory("")
      await load()
      showFeedback("Lehrer angelegt.", true)
    }
    setSavingTeacher(false)
  }

  const addSubject = async () => {
    if (!selectedTeacherForSubject || !newSubjectName.trim() || !newSubjectSlug.trim()) return
    setSavingSubject(true)
    const supabase = createClient()
    const { error } = await supabase.from("subjects").insert({
      teacher_id: selectedTeacherForSubject,
      name: newSubjectName.trim(),
      slug: newSubjectSlug.trim().toLowerCase().replace(/\s+/g, "_"),
    })
    if (error) { showFeedback("Fehler: " + error.message, false) }
    else {
      setNewSubjectName("")
      setNewSubjectSlug("")
      await load()
      showFeedback("Fach hinzugefuegt.", true)
    }
    setSavingSubject(false)
  }

  const filteredItems = filterTeacher === "all"
    ? items
    : items.filter(i => i.category === filterTeacher)

  // Login screen
  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card border border-border rounded-xl p-8 w-full max-w-sm flex flex-col gap-4 shadow-lg">
          <h1 className="text-xl font-bold text-foreground">Dev-Zugang</h1>
          <p className="text-sm text-muted-foreground">Bitte gib das Entwicklerpasswort ein.</p>
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="Passwort"
            className="px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {pwError && <p className="text-xs text-red-500">Falsches Passwort.</p>}
          <button
            onClick={handleLogin}
            className="py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Einloggen
          </button>
          <Link href="/" className="text-xs text-muted-foreground text-center hover:text-foreground transition-colors">
            Zurueck zur Startseite
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-mono font-semibold">DEV</span>
          <h1 className="text-xl font-bold text-foreground">Developer Panel</h1>
        </div>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Zurueck
        </Link>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col gap-8 max-w-5xl">

        {/* Feedback toast */}
        {feedback && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-medium ${
            feedback.ok ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}>
            {feedback.msg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex rounded-xl border border-border overflow-hidden w-fit">
          <button
            onClick={() => setActiveTab("items")}
            className={`px-5 py-2 text-sm font-medium transition-colors ${
              activeTab === "items" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            Bingo-Eintraege ({items.length})
          </button>
          <button
            onClick={() => setActiveTab("teachers")}
            className={`px-5 py-2 text-sm font-medium transition-colors border-l border-border ${
              activeTab === "teachers" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            Lehrer & Faecher ({teachers.length})
          </button>
        </div>

        {loading && <p className="text-sm text-muted-foreground">Lade Daten...</p>}

        {/* ---- BINGO ITEMS TAB ---- */}
        {activeTab === "items" && (
          <div className="flex flex-col gap-4">
            {/* Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Filtern nach Lehrer:</span>
              <button
                onClick={() => setFilterTeacher("all")}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${filterTeacher === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/70"}`}
              >
                Alle
              </button>
              {teachers.map(t => (
                <button
                  key={t.id}
                  onClick={() => setFilterTeacher(t.category)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${filterTeacher === t.category ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/70"}`}
                >
                  {t.name}
                </button>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">{filteredItems.length} Eintraege</p>

            {/* Items list */}
            <div className="flex flex-col gap-2">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 bg-card border border-border rounded-lg px-4 py-2.5"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm text-foreground truncate">{item.text}</span>
                    <div className="flex gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">{item.category}</span>
                      <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">{item.subject}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="flex-shrink-0 px-3 py-1 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-medium transition-colors"
                  >
                    Loeschen
                  </button>
                </div>
              ))}
              {filteredItems.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Keine Eintraege gefunden.</p>
              )}
            </div>
          </div>
        )}

        {/* ---- TEACHERS TAB ---- */}
        {activeTab === "teachers" && (
          <div className="flex flex-col gap-8">

            {/* Add teacher form */}
            <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
              <h2 className="font-semibold text-foreground">Neuen Lehrer anlegen</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">Name (z.B. "Herr Graw")</label>
                  <input
                    value={newTeacherName}
                    onChange={e => setNewTeacherName(e.target.value)}
                    placeholder="Herr Mustermann"
                    className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">Kategorie-Slug (z.B. "graw")</label>
                  <input
                    value={newTeacherCategory}
                    onChange={e => setNewTeacherCategory(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                    placeholder="mustermann"
                    className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <button
                onClick={addTeacher}
                disabled={savingTeacher || !newTeacherName.trim() || !newTeacherCategory.trim()}
                className="self-start px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {savingTeacher ? "Speichere..." : "Lehrer anlegen"}
              </button>
            </div>

            {/* Add subject form */}
            <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
              <h2 className="font-semibold text-foreground">Fach hinzufuegen</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">Lehrer</label>
                  <select
                    value={selectedTeacherForSubject}
                    onChange={e => setSelectedTeacherForSubject(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Lehrer waehlen...</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">Fachname (z.B. "GK")</label>
                  <input
                    value={newSubjectName}
                    onChange={e => setNewSubjectName(e.target.value)}
                    placeholder="GK"
                    className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">Slug (z.B. "gk")</label>
                  <input
                    value={newSubjectSlug}
                    onChange={e => setNewSubjectSlug(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                    placeholder="gk"
                    className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <button
                onClick={addSubject}
                disabled={savingSubject || !selectedTeacherForSubject || !newSubjectName.trim() || !newSubjectSlug.trim()}
                className="self-start px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {savingSubject ? "Speichere..." : "Fach hinzufuegen"}
              </button>
            </div>

            {/* Teachers list */}
            <div className="flex flex-col gap-3">
              <h2 className="font-semibold text-foreground">Alle Lehrer</h2>
              {teachers.map(teacher => (
                <div key={teacher.id} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-foreground">{teacher.name}</span>
                      <span className="ml-2 text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{teacher.category}</span>
                    </div>
                    <button
                      onClick={() => deleteTeacher(teacher.id)}
                      className="px-3 py-1 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-medium transition-colors"
                    >
                      Lehrer loeschen
                    </button>
                  </div>

                  {/* Subjects */}
                  <div className="flex flex-wrap gap-2">
                    {teacher.subjects?.length > 0 ? teacher.subjects.map(s => (
                      <div key={s.id} className="flex items-center gap-1 bg-muted rounded-lg pl-3 pr-1 py-1">
                        <span className="text-xs text-foreground">{s.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">({s.slug})</span>
                        <button
                          onClick={() => deleteSubject(s.id)}
                          className="ml-1 w-5 h-5 flex items-center justify-center rounded text-red-500 hover:bg-red-500/20 text-xs transition-colors"
                          title="Fach loeschen"
                        >
                          x
                        </button>
                      </div>
                    )) : (
                      <span className="text-xs text-muted-foreground italic">Noch keine Faecher</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        <Link href="/" className="underline underline-offset-2 hover:text-foreground transition-colors">Startseite</Link>
        {" "}&mdash;{" "}
        <Link href="/regeln" className="underline underline-offset-2 hover:text-foreground transition-colors">Spielregeln</Link>
      </footer>
    </div>
  )
}
