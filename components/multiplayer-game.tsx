"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { PLAYER_COLORS } from "./multiplayer-lobby"
import type { Session } from "./multiplayer-lobby"
import confetti from "canvas-confetti"
import { cn } from "@/lib/utils"
import { BingoCard, getCompletedLines } from "./bingo-card"

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

// Deterministic shuffle: seed = session code + player id → each player gets own unique card
function shuffleWithSeed(array: BingoItem[], seed: string): BingoItem[] {
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


export function MultiplayerGame({ session, playerId, playerName, playerColor, items, onBack }: MultiplayerGameProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [myMarked, setMyMarked] = useState<Set<number>>(new Set())
  const [myBingoCount, setMyBingoCount] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [winnerName, setWinnerName] = useState<string | null>(null)
  const [showCode, setShowCode] = useState(true)
  // Which player's card to display (null = own card)
  const [viewingPlayerId, setViewingPlayerId] = useState<string | null>(null)
  const prevCompletedLinesRef = useRef<number>(0)

  const gridSize = session.grid_size
  const winMode = session.win_mode as "line" | "full"
  const totalCells = gridSize * gridSize

  // Each player gets their own shuffled card (session code + player id as seed)
  const myItems = shuffleWithSeed(items, session.code + playerId).slice(0, totalCells)
  // playerColor is either a known color id (e.g. "blue") or a raw hex value (custom color)
  const colorHex = playerColor.startsWith("#")
    ? playerColor
    : PLAYER_COLORS.find(c => c.id === playerColor)?.hex ?? "#3b82f6"

  // Resolve hex for any player color (id or raw hex)
  const resolveHex = (color: string) =>
    color.startsWith("#") ? color : PLAYER_COLORS.find(c => c.id === color)?.hex ?? "#888"

  // Load initial players + subscribe to realtime
  useEffect(() => {
    const supabase = createClient()
    supabase.from("players").select("*").eq("session_id", session.id).then(({ data }) => {
      if (data) {
        setPlayers(data.map(p => ({ ...p, marked_cells: Array.isArray(p.marked_cells) ? p.marked_cells : [] })))
        const me = data.find(p => p.id === playerId)
        if (me) {
          const cells = new Set<number>(Array.isArray(me.marked_cells) ? me.marked_cells : [])
          setMyMarked(cells)
          setMyBingoCount(me.bingo_count ?? 0)
          prevCompletedLinesRef.current = getCompletedLines(cells, gridSize).length
        }
      }
    })

    const channel = supabase
      .channel(`session-${session.id}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "players",
        filter: `session_id=eq.${session.id}`,
      }, payload => {
        const updated = payload.new as Player & { is_winner?: boolean }
        const cells = Array.isArray(updated.marked_cells) ? updated.marked_cells : []

        // If another player just won, end the game for everyone
        if (updated.is_winner && updated.id !== playerId) {
          setIsGameOver(true)
          setWinnerName(updated.name)
        }

        setPlayers(prev => {
          const exists = prev.find(p => p.id === updated.id)
          if (exists) return prev.map(p => p.id === updated.id ? { ...updated, marked_cells: cells } : p)
          return [...prev, { ...updated, marked_cells: cells }]
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [session.id, playerId, gridSize])

  // Called by BingoCard when the local player hits the win condition
  const handleMyGameOver = useCallback(async () => {
    setIsGameOver(true)
    setWinnerName(playerName)
    // Write a winner flag to DB so other players get notified via realtime
    const supabase = createClient()
    await supabase.from("players").update({ is_winner: true }).eq("id", playerId)
  }, [playerId, playerName])

  const myBingoCountRef = useRef(0)
  myBingoCountRef.current = myBingoCount

  const toggleCell = useCallback((index: number) => {
    if (isGameOver) return

    setMyMarked(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)

      const markedArray = Array.from(next)
      let newBingoCount = myBingoCountRef.current

      if (winMode === "full") {
        if (next.size === totalCells) {
          newBingoCount += 1
          confetti({ particleCount: 300, spread: 120, origin: { y: 0.5 } })
        }
      } else {
        const completedLines = getCompletedLines(next, gridSize)
        const gained = completedLines.length - prevCompletedLinesRef.current
        if (gained > 0) {
          newBingoCount += gained
          confetti({ particleCount: 100 + gained * 50, spread: 70, origin: { y: 0.6 } })
        }
        prevCompletedLinesRef.current = completedLines.length
      }

      myBingoCountRef.current = newBingoCount
      setMyBingoCount(newBingoCount)

      // Persist to DB
      const supabase = createClient()
      supabase.from("players").update({
        marked_cells: markedArray,
        total_cells_marked: markedArray.length,
        bingo_count: newBingoCount,
        last_active: new Date().toISOString(),
      }).eq("id", playerId).then(() => {})

      return next
    })
  }, [isGameOver, gridSize, winMode, totalCells, playerId])

  const otherPlayers = players.filter(p => p.id !== playerId)
  const viewingPlayer = viewingPlayerId ? players.find(p => p.id === viewingPlayerId) : null

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
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

      {/* Code banner */}
      {showCode && (
        <div className="rounded-xl border border-border bg-card px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Spielcode zum Teilen</p>
            <p className="font-mono text-2xl font-bold tracking-widest text-primary">{session.code}</p>
          </div>
          <button onClick={() => navigator.clipboard.writeText(session.code)} className="text-xs px-3 py-2 rounded-lg bg-muted hover:bg-muted/70 transition-colors">
            Kopieren
          </button>
        </div>
      )}

      {/* Players + card switcher */}
      <div className="flex flex-wrap gap-2">
        {/* Own card button */}
        <button
          onClick={() => setViewingPlayerId(null)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border-2 transition-all",
            viewingPlayerId === null ? "shadow-md scale-105" : "opacity-70 hover:opacity-100"
          )}
          style={{ borderColor: colorHex, backgroundColor: viewingPlayerId === null ? `${colorHex}30` : `${colorHex}10` }}
        >
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorHex }} />
          <span className="font-medium text-foreground">{playerName} (du)</span>
          {myBingoCount > 0 && (
            <span className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: colorHex }}>
              {myBingoCount}x
            </span>
          )}
        </button>

        {/* Other players' card buttons */}
        {otherPlayers.map(p => {
          const hex = resolveHex(p.color)
              const isViewing = viewingPlayerId === p.id
          return (
            <button
              key={p.id}
              onClick={() => setViewingPlayerId(isViewing ? null : p.id)}
              title="Karte ansehen"
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border-2 transition-all",
                isViewing ? "shadow-md scale-105" : "opacity-70 hover:opacity-100"
              )}
              style={{ borderColor: hex, backgroundColor: isViewing ? `${hex}30` : `${hex}10` }}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hex }} />
              <span className="font-medium text-foreground">{p.name}</span>
              {p.bingo_count > 0 && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: hex }}>
                  {p.bingo_count}x
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Viewing indicator */}
      {viewingPlayer && (
        <div className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground text-center">
          Du siehst die Karte von <span className="font-semibold text-foreground">{viewingPlayer.name}</span> (nur lesen)
        </div>
      )}

      {/* Winner banner */}
      {isGameOver && winnerName && (
        <div className={cn(
          "rounded-xl border-2 px-4 py-3 text-center",
          winnerName === playerName
            ? "border-primary bg-primary/10 text-primary"
            : "border-border bg-muted text-foreground"
        )}>
          <span className="font-bold text-lg">
            {winnerName === playerName ? "Du hast gewonnen!" : `${winnerName} hat gewonnen!`}
          </span>
          <p className="text-xs mt-0.5 text-muted-foreground">Spiel vorbei</p>
        </div>
      )}

      {/* Bingo card — own (interactive) or other player's (read-only) */}
      {viewingPlayer ? (
        <BingoCard
          items={shuffleWithSeed(items, session.code + viewingPlayer.id).slice(0, totalCells)}
          gridSize={gridSize}
          winMode={winMode}
          playerColor={resolveHex(viewingPlayer.color)}
          externalMarked={new Set<number>(viewingPlayer.marked_cells)}
          readOnly
          externalGameOver={isGameOver}
        />
      ) : (
        <BingoCard
          items={myItems}
          gridSize={gridSize}
          winMode={winMode}
          playerColor={colorHex}
          onCellToggle={toggleCell}
          externalMarked={myMarked}
          onGameOver={handleMyGameOver}
          externalGameOver={isGameOver && winnerName !== playerName}
        />
      )}

      {/* Scoreboard */}
      {players.length > 1 && (
        <div className="rounded-xl border border-border bg-card p-4 mt-2">
          <h3 className="text-sm font-semibold text-foreground mb-3">Punktestand</h3>
          <div className="flex flex-col gap-2">
            {[...players]
              .sort((a, b) => b.bingo_count - a.bingo_count || b.total_cells_marked - a.total_cells_marked)
              .map(p => {
                const hex = resolveHex(p.color)
                const isMe = p.id === playerId
                const count = isMe ? myBingoCount : p.bingo_count
                const marked = isMe ? myMarked.size : (Array.isArray(p.marked_cells) ? p.marked_cells : []).length
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: hex }} />
                    <span className={cn("text-sm flex-1", isMe && "font-semibold")}>
                      {p.name}{isMe ? " (du)" : ""}
                    </span>
                    <span className="text-xs text-muted-foreground">{marked}/{totalCells} Felder</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white min-w-[60px] text-center" style={{ backgroundColor: hex }}>
                      {count}x Bingo
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
