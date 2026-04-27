import { createClient } from "@/lib/supabase/server"
import { BingoApp } from "@/components/bingo-app"

export default async function Home() {
  const supabase = await createClient()
  
  const { data: items, error } = await supabase
    .from("bingo_items")
    .select("id, text, category")
    .order("created_at", { ascending: false })

  if (error) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">
            Fehler beim Laden
          </h1>
          <p className="text-muted-foreground">
            Die Bingo-Einträge konnten nicht geladen werden.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Stelle sicher, dass die Datenbank-Tabelle existiert.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Lehrer Bingo
          </h1>
          <p className="text-muted-foreground">
            Wähle einen Lehrer und spiele Bingo!
          </p>
        </header>

        <BingoApp items={items || []} />
      </div>
    </main>
  )
}
