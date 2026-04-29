"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

const PLAYER_COLORS = [
  { id: "red",    label: "Rot",     hex: "#ef4444" },
  { id: "blue",   label: "Blau",    hex: "#3b82f6" },
  { id: "green",  label: "Grün",    hex: "#22c55e" },
  { id: "orange", label: "Orange",  hex: "#f97316" },
  { id: "purple", label: "Lila",    hex: "#a855f7" },
  { id: "pink",   label: "Pink",    hex: "#ec4899" },
  { id: "teal",   label: "Türkis",  hex: "#14b8a6" },
  { id: "yellow", label: "Gelb",    hex: "#eab308" },
]

interface Session {
  id: string
  code: string
  teacher_category: string
  teacher_name: string
  subject_slug: string
  subject_name: string
  win_mode: string
  grid_size: number
}

interface MultiplayerLobbyProps {
  onJoin: (session: Session, playerId: string, playerName: string, playerColor: string) => void
  onBack: () => void
  // Pre-filled when coming from a game setup
  prefilledSession?: Omit<Session, "id" | "code"> | null
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export function MultiplayerLobby({ onJoin, onBack, prefilledSession }: MultiplayerLobbyProps) {
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose")
  const [playerName, setPlayerName] = useState("")
  const [selectedColor, setSelectedColor] = useState(PLAYER_COLORS[0].id)
  const [joinCode, setJoinCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleCreate = async () => {
    if (!playerName.trim()) { setError("Bitte gib einen Spielernamen ein."); return }
    if (!prefilledSession) { setError("Kein Spiel konfiguriert."); return }
    setLoading(true)
    setError("")
    const supabase = createClient()

    let code = generateCode()
    // Ensure uniqueness
    let attempts = 0
    while (attempts < 5) {
      const { data } = await supabase.from("game_sessions").select("id").eq("code", code).single()
      if (!data) break
      code = generateCode()
      attempts++
    }

    const { data: session, error: sessionErr } = await supabase
      .from("game_sessions")
      .insert({ code, ...prefilledSession })
      .select()
      .single()

    if (sessionErr || !session) {
      setError("Fehler beim Erstellen des Spiels.")
      setLoading(false)
      return
    }

    const { data: player, error: playerErr } = await supabase
      .from("players")
      .insert({ session_id: session.id, name: playerName.trim(), color: selectedColor })
      .select()
      .single()

    if (playerErr || !player) {
      setError("Fehler beim Erstellen des Spielers.")
      setLoading(false)
      return
    }

    onJoin(session, player.id, playerName.trim(), selectedColor)
    setLoading(false)
  }

  const handleJoin = async () => {
    if (!playerName.trim()) { setError("Bitte gib einen Spielernamen ein."); return }
    if (!joinCode.trim()) { setError("Bitte gib einen Spielcode ein."); return }
    setLoading(true)
    setError("")
    const supabase = createClient()

    const { data: session, error: sessionErr } = await supabase
      .from("game_sessions")
      .select("*")
      .eq("code", joinCode.trim().toUpperCase())
      .single()

    if (sessionErr || !session) {
      setError("Spielcode nicht gefunden. Bitte prüfe den Code.")
      setLoading(false)
      return
    }

    const { data: player, error: playerErr } = await supabase
      .from("players")
      .insert({ session_id: session.id, name: playerName.trim(), color: selectedColor })
      .select()
      .single()

    if (playerErr || !player) {
      setError("Fehler beim Beitreten.")
      setLoading(false)
      return
    }

    onJoin(session, player.id, playerName.trim(), selectedColor)
    setLoading(false)
  }

  const colorHex = PLAYER_COLORS.find(c => c.id === selectedColor)?.hex ?? "#3b82f6"

  if (mode === "choose") {
    return (
      <div className="flex flex-col items-center gap-8 py-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Multiplayer</h2>
          <p className="text-muted-foreground text-sm">Spiele gemeinsam mit anderen</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <button
            onClick={() => setMode("create")}
            className="flex-1 py-4 px-6 rounded-xl border-2 border-primary bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors"
          >
            Spiel erstellen
          </button>
          <button
            onClick={() => setMode("join")}
            className="flex-1 py-4 px-6 rounded-xl border-2 border-border text-foreground font-semibold hover:bg-muted transition-colors"
          >
            Spiel beitreten
          </button>
        </div>
        <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Abbrechen
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-sm mx-auto w-full">
      <button
        onClick={() => { setMode("choose"); setError("") }}
        className="self-start text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 text-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Zurück
      </button>

      <h2 className="text-xl font-bold text-foreground">
        {mode === "create" ? "Spiel erstellen" : "Spiel beitreten"}
      </h2>

      {/* Player name */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">Dein Name</label>
        <input
          type="text"
          value={playerName}
          onChange={e => setPlayerName(e.target.value)}
          placeholder="Spielername eingeben..."
          maxLength={24}
          className="px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Color picker */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">Deine Spielerfarbe</label>
        <div className="flex flex-wrap gap-2">
          {PLAYER_COLORS.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedColor(c.id)}
              title={c.label}
              className="w-9 h-9 rounded-full border-4 transition-all"
              style={{
                backgroundColor: c.hex,
                borderColor: selectedColor === c.id ? c.hex : "transparent",
                outline: selectedColor === c.id ? `3px solid ${c.hex}` : "none",
                outlineOffset: "2px",
              }}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Gewählt: <span className="font-medium" style={{ color: colorHex }}>{PLAYER_COLORS.find(c => c.id === selectedColor)?.label}</span>
        </p>
      </div>

      {/* Join code input */}
      {mode === "join" && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Spielcode</label>
          <input
            type="text"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            placeholder="z.B. A3XK7P"
            maxLength={6}
            className="px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono tracking-widest uppercase text-center text-lg"
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
      )}

      <button
        onClick={mode === "create" ? handleCreate : handleJoin}
        disabled={loading}
        className="py-3 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? "Laden..." : mode === "create" ? "Spiel erstellen" : "Beitreten"}
      </button>
    </div>
  )
}

export { PLAYER_COLORS }
export type { Session }
