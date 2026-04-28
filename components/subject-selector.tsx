"use client"

interface Subject {
  id: string
  name: string
  icon: string
}

const subjectsByTeacher: Record<string, Subject[]> = {
  graw: [
    { id: "gk", name: "GK", icon: "GK" },
    { id: "geschichte", name: "Geschichte", icon: "Ge" },
  ],
  hiss: [
    { id: "deutsch", name: "Deutsch", icon: "De" },
  ],
  springer: [
    { id: "physik", name: "Physik", icon: "Ph" },
    { id: "kunst", name: "Kunst", icon: "Ku" },
  ],
  wolff: [
    { id: "bio", name: "Bio", icon: "Bio" },
  ]
}

interface SubjectSelectorProps {
  teacherCategory: string
  teacherName: string
  onSelect: (subject: string) => void
  onBack: () => void
}

export function SubjectSelector({ teacherCategory, teacherName, onSelect }: SubjectSelectorProps) {
  const subjects = subjectsByTeacher[teacherCategory] || []
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Wähle ein Fach
        </h2>
        <p className="text-muted-foreground">
          {teacherName}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-3xl">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => onSelect(subject.id)}
            className="group relative px-6 py-8 rounded-xl border-2 border-border bg-card hover:border-primary hover:bg-accent transition-all duration-200"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
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
