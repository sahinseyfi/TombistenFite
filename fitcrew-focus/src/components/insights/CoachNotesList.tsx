import Image from "next/image";
import type { SerializedCoachNote } from "@/server/serializers/coach-note";

type CoachNotesListProps = {
  notes: SerializedCoachNote[];
};

function formatDate(iso: string | null) {
  if (!iso) {
    return "Belirsiz tarih";
  }
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
  });
}

export default function CoachNotesList({ notes }: CoachNotesListProps) {
  if (notes.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
        Ko\u00E7 notlar\u0131 henuz yok. AI \u00F6nerilerini ve manuel notlar\u0131 burada g\u00F6receksiniz.
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {notes.map((note) => (
        <article
          key={note.id}
          className="space-y-3 rounded-3xl border border-border bg-card p-4 shadow-sm"
        >
          <header className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted">
              {note.coach.avatarUrl ? (
                <Image
                  src={note.coach.avatarUrl}
                  alt={`${note.coach.name} avatar\u0131`}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                  {note.coach.name.at(0)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{note.coach.name}</p>
              <p className="text-xs text-muted-foreground">
                @{note.coach.handle} \u2022 {formatDate(note.createdAt)}
              </p>
            </div>
            <span className="ml-auto rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase text-primary">
              {note.origin === "AI_COMMENT" ? "AI destekli" : "Ko\u00E7"}
            </span>
          </header>

          {note.title && <h3 className="text-base font-semibold text-foreground">{note.title}</h3>}
          <p className="text-sm leading-relaxed text-muted-foreground">{note.body}</p>

          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag: string) => (
                <span
                  key={`${note.id}-${tag}`}
                  className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {(note.postIds.length > 0 || note.measurementIds.length > 0) && (
            <footer className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              {note.postIds.length > 0 && (
                <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
                  {note.postIds.length} g\u00F6nderi
                </span>
              )}
              {note.measurementIds.length > 0 && (
                <span className="rounded-full bg-secondary/10 px-3 py-1 font-semibold text-secondary">
                  {note.measurementIds.length} \u00F6l\u00E7\u00FCm
                </span>
              )}
            </footer>
          )}
        </article>
      ))}
    </section>
  );
}
