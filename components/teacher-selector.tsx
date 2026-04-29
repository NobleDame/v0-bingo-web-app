"use client"

export interface Teacher {
  id: string
  name: string
  category: string
  subjects: { id: string; name: string; slug: string }[]
}

interface TeacherSelectorProps {
  teachers: Teacher[]
  onSelect: (teacher: Teacher) => void
}

export function TeacherSelector({ teachers, onSelect }: TeacherSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Wähle einen Lehrer
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-2xl">
        {teachers.map((teacher) => (
          <button
            key={teacher.id}
            onClick={() => onSelect(teacher)}
            className="group relative px-6 py-8 rounded-xl border-2 border-border bg-card hover:border-primary hover:bg-accent transition-all duration-200"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {teacher.name.split(" ").pop()?.[0] ?? "?"}
              </div>
              <span className="text-lg font-medium text-foreground">
                {teacher.name}
              </span>
              <div className="flex flex-wrap gap-1 justify-center">
                {teacher.subjects.map((subject) => (
                  <span
                    key={subject.id}
                    className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium group-hover:bg-primary/10 group-hover:text-primary transition-colors"
                  >
                    {subject.name}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
