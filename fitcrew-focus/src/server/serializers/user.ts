import type { PostVisibility, User } from "@prisma/client";

type UserWithCounts = User & {
  _count?: {
    posts: number;
    followers: number;
    following: number;
  };
};

type SerializeOptions = {
  includeSensitive?: boolean;
};

const visibilityMap: Record<PostVisibility, "public" | "followers" | "private"> = {
  PUBLIC: "public",
  FOLLOWERS: "followers",
  PRIVATE: "private",
};

function clean<T>(value: T | null | undefined): T | undefined {
  return value === null || value === undefined ? undefined : value;
}

export function serializeUser(user: UserWithCounts, options: SerializeOptions = {}) {
  const { includeSensitive = false } = options;

  return {
    id: user.id,
    handle: user.handle,
    name: user.name,
    ...(includeSensitive
      ? {
          email: clean(user.email),
          phone: clean(user.phone),
        }
      : {}),
    avatarUrl: clean(user.avatarUrl),
    bio: clean(user.bio),
    privacyDefaults: {
      defaultVisibility: visibilityMap[user.defaultVisibility],
      aiCommentDefault: user.aiCommentDefault,
    },
    stats: user._count
      ? {
          posts: user._count.posts,
          followers: user._count.followers,
          following: user._count.following,
        }
      : undefined,
    createdAt: user.createdAt.toISOString(),
  };
}

export type SerializedUser = ReturnType<typeof serializeUser>;
