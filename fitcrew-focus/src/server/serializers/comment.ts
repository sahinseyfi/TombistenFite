import type { Comment, User } from "@prisma/client";

type AuthorSummary = Pick<User, "id" | "handle" | "name" | "avatarUrl">;

export type CommentWithAuthor = Comment & {
  author: AuthorSummary;
};

export function serializeComment(comment: CommentWithAuthor) {
  return {
    id: comment.id,
    postId: comment.postId,
    body: comment.body,
    author: {
      id: comment.author.id,
      handle: comment.author.handle,
      name: comment.author.name,
      avatarUrl: comment.author.avatarUrl ?? undefined,
    },
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
  };
}
