"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { PLAYER_COLORS } from "./multiplayer-lobby"
import type { Session } from "./multiplayer-lobby"
import confetti from "canvas-confetti"
import { cn } from "@/lib/utils"

interface BingoItem {
  id: string
  text: string
  category: string
  subject: string
}

interface Player {
  id: string
  name: string
  color: string
  marked_cells: number[]
  bingo_count: number
  total_cells_marked: number
}

interface MultiplayerGameProps {
  session: Session
  playerId: string
  playerName: string
  playerColor: string
  items: BingoItem[]
  onBack: () => void
}

function shuffleWithSeed(array: BingoItem[], seed: string): BingoItem[] {
  // Deterministic shuffle based on session code so all players see same layout
  const shuffled = [...array]
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i)
    hash |= 0
  }
  for (let i = shuffled.length - 1; i > 0; i--) {
    hash = ((hash << 5) - hash) + i
    hash |= 0
    const j = Math.abs(hash) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function checkBingo(selected: Set<number>, gridSize: number): boolean {
  for (let row = 0; row < gridSize; row++) {
    if ([...Array(gridSize)].every((_, col) => selected.has(row * gridSize + col))) return true
  }
  for (let col = 0; col < gridSize; col++) {
    if ([...Array(gridSize)].every((_, row) => selected.has(row * gridSize + col))) return true
  }
  if ([...Array(gridSize)].every((_, i) => selected.has(i * gridSize + i))) return true
  if ([...Array(gridSize)].every((_, i) => selected.has(i * gridSize + (gridSize - 1 - i)))) return true
  return false
}

export function MultiplayerGame({ session, playerId, playerName, playerColor, items, onBack }: MultiplayerGameProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [myMarked, setMyMarked] = useState<Set<number>>(new Set())
  const [hasBingo, setHasBingo] = useState(false)
  const [showCode, setShowCode] = useState(true)
  const gridSize = session.grid_size
  const winMode = session.win_mode as "line" | "full"
  const totalCells = gridSize * gridSize
  const shuffledItems = shuffleWithSeed(items, session.code).slice(0, totalCells)
  const colorHex = PLAYER_COLORS.find(c => c.id === playerColor)?.hex ?? "#3b82f6"

  // Load initial players
  useEffect(() => {
    const supabase = createClient()
    supabase.from("players").select("*").eq("session_id", session.id).then(({ data }) => {
      if (data) {
        setPlayers(data.map(p => ({ ...p, marked_cells: Array.isArray(p.marked_cells) ? p.marked_cells : [] })))
        const me = data.find(p => p.id === playerId)
        if (me) setMyMarked(new Set(Array.isArray(me.marked_cells) ? me.marked_cells : []))
      }
    })

    // Realtime subscription
    const channel = supabase
      .channel(`session-${session.id}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "players",
        filter: `session_id=eq.${session.id}`,
      }, payload => {
        setPlayers(prev => {
          const updated = payload.new as Player
          const cells = Array.isArray(updated.marked_cells) ? updated.marked_cells : []
          const exists = prev.find(p => p.id === updated.id)
          if (exists) {
            return prev.map(p => p.id === updated.id ? { ...updated, marked_cells: cells } : p)
          }
          return [...prev, { ...updated, marked_cells: cells }]
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [session.id, playerId])

  const toggleCell = useCallback(async (index: number) => {
    const newMarked = new Set(myMarked)
    if (newMarked.has(index)) {
      newMarked.delete(index)
    } else {
      newMarked.add(index)
    }
    setMyMarked(newMarked)

    const markedArray = Array.from(newMarked)
    const won = winMode === "full" ? newMarked.size === totalCells : checkBingo(newMarked, gridSize)
    const prevBingo = hasBingo

    if (won && !prevBingo) {
      setHasBingo(true)
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
    } else if (!won) {
      setHasBingo(false)
    }

    const supabase = createClient()
    await supabase.from("players").update({
      marked_cells: markedArray,
      total_cells_marked: markedArray.length,
      bingo_count: won && !prevBingo ? (players.find(p => p.id === playerId)?.bingo_count ?? 0) + 1 : (players.find(p => p.id === playerId)?.bingo_count ?? 0),
      last_active: new Date().toISOString(),
    }).eq("id", playerId)
  }, [myMarked, gridSize, winMode, totalCells, hasBingo, players, playerId])

  // Cell ownership: which player has marked this cell (for coloring)
  const getCellOwners = (index: number): Player[] => {
    return players.filter(p => (Array.isArray(p.marked_cells) ? p.marked_cells : []).includes(index))
  }

  const myPlayer = players.find(p => p.id === playerId)
  const otherPlayers = players.filter(p => p.id !== playerId)

  return (
    <div className="flex flex-col gap-4">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Verlassen
        </button>
        <span className="text-sm text-muted-foreground">{session.teacher_name} &mdash; {session.subject_name}</span>
        <button
          onClick={() => setShowCode(v => !v)}
          className="text-xs px-3 py-1 rounded-lg border border-border hover:bg-muted transition-colors font-mono"
        >
          {showCode ? `Code: ${session.code}` : "Code anzeigen"}
        </button>
      </div>

      {/* Share code banner */}
      {showCode && (
        <div className="rounded-xl border border-border bg-card px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Spielcode zum Teilen</p>
            <p className="font-mono text-2xl font-bold tracking-widest text-primary">{session.code}</p>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(session.code)}
            className="text-xs px-3 py-2 rounded-lg bg-muted hover:bg-muted/70 transition-colors"
          >
            Kopieren
          </button>
        </div>
      )}

      {/* Players bar */}
      {players.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {players.map(p => {
            const hex = PLAYER_COLORS.find(c => c.id === p.color)?.hex ?? "#888"
            const isMe = p.id === playerId
            return (
              <div key={p.id} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border", isMe && "border-2")} style={{ borderColor: hex, backgroundColor: `${hex}18` }}>
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: hex }} />
                <span className="font-medium text-foreground">{p.name}{isMe ? " (du)" : ""}</span>
                {p.bingo_count > 0 && (
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: hex }}>
                    {p.bingo_count}x BINGO
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Bingo announcement */}
      {hasBingo && (
        <div className="text-center py-2">
          <span className="text-3xl font-bold text-primary animate-bounce inline-block">BINGO!</span>
        </div>
      )}

      {/* Bingo grid */}
      <div
        className="grid gap-1.5 w-full max-w-2xl mx-auto"
        style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
      >
        {shuffledItems.map((item, index) => {
          const isMyMark = myMarked.has(index)
          const owners = getCellOwners(index)
          const otherOwners = owners.filter(p => p.id !== playerId)
          const ownerHexes = owners.map(p => PLAYER_COLORS.find(c => c.id === p.color)?.hex ?? "#888")

          return (
            <button
              key={item.id}
              onClick={() => toggleCell(index)}
              className={cn(
                "aspect-square p-1.5 rounded-lg border-2 transition-all duration-200",
                "flex flex-col items-center justify-center text-center relative overflow-hidden",
                "text-xs font-medium leading-tight hover:scale-105 hover:shadow-md",
                isMyMark
                  ? "border-transparent text-white"
                  : otherOwners.length > 0
                    ? "border-transparent text-foreground"
                    : "border-border bg-card text-card-foreground hover:border-primary/50"
              )}
              style={isMyMark ? { backgroundColor: colorHex } : otherOwners.length > 0 ? { backgroundColor: `${PLAYER_COLORS.find(c => c.id === otherOwners[0].color)?.hex}30`, borderColor: PLAYER_COLORS.find(c => c.id === otherOwners[0].color)?.hex } : {}}
            >
              {/* Multi-owner dots */}
              {owners.length > 1 && (
                <div className="absolute top-1 right-1 flex gap-0.5">
                  {ownerHexes.slice(0, 3).map((hex, i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: hex }} />
                  ))}
                </div>
              )}
              <span className="line-clamp-4">{item.text}</span>
            </button>
          )
        })}
      </div>

      {/* Scoreboard */}
      {players.length > 1 && (
        <div className="rounded-xl border border-border bg-card p-4 mt-2">
          <h3 className="text-sm font-semibold text-foreground mb-3">Punktestand</h3>
          <div className="flex flex-col gap-2">
            {[...players].sort((a, b) => b.bingo_count - a.bingo_count || b.total_cells_marked - a.total_cells_marked).map(p => {
              const hex = PLAYER_COLORS.find(c => c.id === p.color)?.hex ?? "#888"
              const isMe = p.id === playerId
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: hex }} />
                  <span className={cn("text-sm flex-1", isMe && "font-semibold")}>{p.name}{isMe ? " (du)" : ""}</span>
                  <span className="text-xs text-muted-foreground">{(Array.isArray(p.marked_cells) ? p.marked_cells : []).length} Felder</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white min-w-[60px] text-center" style={{ backgroundColor: hex }}>
                    {p.bingo_count}x Bingo
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
