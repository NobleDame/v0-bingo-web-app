"use client"

export interface Subject {
  id: string
  name: string
  slug: string
}

interface SubjectSelectorProps {
  teacherName: string
  subjects: Subject[]
  onSelect: (subject: Subject) => void
}

export function SubjectSelector({ teacherName, subjects, onSelect }: SubjectSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Wähle ein Fach
        </h2>
        <p className="text-muted-foreground">{teacherName}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-3xl">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => onSelect(subject)}
            className="group relative px-6 py-8 rounded-xl border-2 border-border bg-card hover:border-primary hover:bg-accent transition-all duration-200"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {subject.name.slice(0, 2)}
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
