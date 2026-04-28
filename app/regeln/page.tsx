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
                <span className="leading-relaxed">Wähle die Kartengröße (3x3 bis 6x6) und die Spielweise.
                  (größere Felder sind nur bei genug Einträgen möglich)
                </span>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Spielweisen</h2>
            <div className="flex flex-col gap-3">
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="font-medium text-foreground mb-1">Linie</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Gewinne durch eine horizontale, vertikale oder diagonale Reihe im Bingo.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="font-medium text-foreground mb-1">Voll</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Alle Felder auf der Karte müssen markiert werden.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Einträge hinzufügen</h2>
            <p className="text-muted-foreground leading-relaxed">
              Auf der Startseite können eigene Einträge hinzugefügt werden und sind nach dem Neuladen der Seite verfügbar.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Fairplay</h2>
            <p className="text-muted-foreground leading-relaxed">
              einfach respektvolle Einträge machen und fertig. Gesunder Menschenverstand :)
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
