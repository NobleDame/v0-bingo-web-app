import Link from "next/link"

export default function RegelnPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          &larr; Zurück zum Spiel
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">Spielregeln</h1>
        <p className="text-muted-foreground mb-10 text-balance">
          So funktioniert das Lehrer-Bingo.
        </p>

        <div className="flex flex-col gap-8">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Ziel des Spiels</h2>
            <p className="text-muted-foreground leading-relaxed">
              Beobachte deinen Lehrer im Unterricht und markiere alle Felder auf deiner Bingo-Karte,
              die du erkennst. Je nach Spielweise gewinnst du, wenn du eine vollständige Reihe,
              Spalte oder Diagonale hast &ndash; oder wenn alle Felder markiert sind.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Spielablauf</h2>
            <ol className="flex flex-col gap-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold mt-0.5">1</span>
                <span className="leading-relaxed">Wähle einen Lehrer aus der Liste aus.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold mt-0.5">2</span>
                <span className="leading-relaxed">Wähle ein Fach für das Bingo</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold mt-0.5">3</span>
                <span className="leading-relaxed">Wähle die Kartengröße (3x3 bis 6x6) und die Spielweise.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold mt-0.5">4</span>
                <span className="leading-relaxed">Sobald etwas passiert, das auf deiner Karte steht, tippe auf das Feld um es zu markieren.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold mt-0.5">5</span>
                <span className="leading-relaxed">Bei BINGO gewinnt das Spiel &ndash; feiere lautlos.</span>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Spielweisen</h2>
            <div className="flex flex-col gap-3">
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="font-medium text-foreground mb-1">Linie</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Eine vollständige Reihe, Spalte oder Diagonale ergibt BINGO. Dies ist die klassische
                  und schnellere Variante.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="font-medium text-foreground mb-1">Voll</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Alle Felder auf der Karte müssen markiert werden. Diese Variante dauert länger und
                  eignet sich besonders für lange Unterrichtsstunden.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Einträge hinzufügen</h2>
            <p className="text-muted-foreground leading-relaxed">
              Auf der Startseite kannst du eigene Beobachtungen als neue Bingo-Felder einreichen.
              Wähle dazu einen Lehrer, das passende Fach und beschreibe das Ereignis kurz. Dein Eintrag
              erscheint sofort in der Datenbank und kann beim nächsten Spiel auf der Karte auftauchen.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Fairplay</h2>
            <p className="text-muted-foreground leading-relaxed">
              Bitte keine beleidigenden oder verletzenden Einträge hinzufügen. Das Spiel soll Spass machen
              und respektvoll bleiben.
            </p>
          </section>
        </div>
      </div>

      <footer className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        Lehrer-Bingo &mdash;{" "}
        <Link href="/regeln" className="underline underline-offset-2 hover:text-foreground transition-colors">
          Spielregeln
        </Link>
      </footer>
    </main>
  )
}
