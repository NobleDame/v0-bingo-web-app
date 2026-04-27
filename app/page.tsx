import { BingoApp } from "@/components/bingo-app"

export default function Home() {
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

        <BingoApp />
      </div>
    </main>
  )
}
