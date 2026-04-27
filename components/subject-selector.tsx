"use client"

interface Subject {
  id: string
  name: string
  icon: string
}

const subjects: Subject[] = [
  { id: "politik", name: "Politik", icon: "P" },
  { id: "geschichte", name: "Geschichte", icon: "G" },
  { id: "wirtschaft", name: "Wirtschaft", icon: "W" },
  { id: "allgemein", name: "Allgemein", icon: "A" },
]

interface SubjectSelectorProps {
  teacherName: string
  onSelect: (subject: string) => void
  onBack: () => void
}

export function SubjectSelector({ teacherName, onSelect, onBack }: SubjectSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-8">
      <button
        onClick={onBack}
        className="self-start flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Zurück zur Lehrerauswahl
      </button>

      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Wähle ein Fach
        </h2>
        <p className="text-muted-foreground">
          {teacherName} - In welchem Fach möchtest du Bingo spielen?
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => onSelect(subject.id)}
            className="group relative px-6 py-8 rounded-xl border-2 border-border bg-card hover:border-primary hover:bg-accent transition-all duration-200"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {subject.icon}
              </div>
              <span className="text-base font-medium text-foreground">
                {subject.name}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
