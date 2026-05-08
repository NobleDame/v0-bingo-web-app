import Link from "next/link"
import { BingoApp } from "@/components/bingo-app"

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Lehrer Bingo
          </h1>
        </header>

        <BingoApp />
      </main>

      <footer className="border-t border-border py-5 text-center text-xs text-muted-foreground flex items-center justify-center gap-3">
        <span>Lehrer-Bingo</span>
        <span>&mdash;</span>
        <Link href="/regeln" className="underline underline-offset-2 hover:text-foreground transition-colors">
          Spielregeln
        </Link>
        <span>&mdash;</span>
        <Link href="/dev" className="underline underline-offset-2 hover:text-foreground transition-colors">
          Dev
        </Link>
      </footer>
    </div>
  )
}
