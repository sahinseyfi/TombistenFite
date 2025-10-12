import type { CoachNote, User } from "@prisma/client";

type CoachNoteWithRelations = CoachNote & {
  coach: Pick<User, "id" | "name" | "handle" | "avatarUrl">;
  posts: Array<{
    postId: string;
  }>;
  measurements: Array<{
    measurementId: string;
  }>;
};

export function serializeCoachNote(note: CoachNoteWithRelations) {
  return {
    id: note.id,
    coach: {
      id: note.coach.id,
      name: note.coach.name,
      handle: note.coach.handle,
      avatarUrl: note.coach.avatarUrl,
    },
    memberId: note.memberId,
    origin: note.origin,
    title: note.title,
    body: note.body,
    tags: note.tags,
    archivedAt: note.archivedAt ? note.archivedAt.toISOString() : null,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
    postIds: note.posts.map((link: { postId: string }) => link.postId),
    measurementIds: note.measurements.map((link: { measurementId: string }) => link.measurementId),
  };
}

export type SerializedCoachNote = ReturnType<typeof serializeCoachNote>;
