import { describe, expect, it, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { PostVisibility } from "@prisma/client";

const { postFindMany, postFindUnique, authenticateMock } = vi.hoisted(() => ({
  postFindMany: vi.fn(),
  postFindUnique: vi.fn(),
  authenticateMock: vi.fn(),
}));

vi.mock("@/server/db", () => ({
  prisma: {
    post: {
      findMany: postFindMany,
      findUnique: postFindUnique,
    },
  },
}));

vi.mock("@/server/auth/session", () => ({
  authenticate: authenticateMock,
}));

import { GET } from "@/app/api/posts/route";

function buildRequest(url: string, init?: ConstructorParameters<typeof NextRequest>[1]) {
  return new NextRequest(url, init);
}

const baseDate = new Date("2025-10-10T12:00:00.000Z");

function createPost(id: string, visibility: PostVisibility = PostVisibility.PUBLIC) {
  return {
    id,
    authorId: "author-1",
    createdAt: baseDate,
    updatedAt: baseDate,
    photos: [],
    caption: null,
    mealType: null,
    weightKg: null,
    visibility,
    aiCommentStatus: "IDLE",
    aiCommentSummary: null,
    aiCommentTips: [] as string[],
    aiCommentUpdatedAt: null,
    aiCommentError: null,
    aiCommentRequested: false,
    measurementId: null,
    commentsCount: 0,
    likesCount: 0,
    author: {
      id: "author-1",
      handle: "fitcrew",
      name: "Fit Crew",
      avatarUrl: null,
    },
    measurement: null,
  };
}

describe("GET /api/posts", () => {
  beforeEach(() => {
    postFindMany.mockReset();
    postFindUnique.mockReset();
    authenticateMock.mockReset();
  });

  it("takip akisi icin oturum olmadan 401 dondurur", async () => {
    authenticateMock.mockReturnValueOnce(null);

    const response = await GET(buildRequest("https://app.local/api/posts?scope=following"));

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error.code).toBe("unauthorized");
    expect(postFindMany).not.toHaveBeenCalled();
  });

  it("public akista sayfalama icin nextCursor dondurur", async () => {
    authenticateMock.mockReturnValueOnce(null);

    const posts = Array.from({ length: 7 }, (_, index) => createPost(`post-${index}`));
    postFindMany.mockResolvedValueOnce(posts);

    const response = await GET(buildRequest("https://app.local/api/posts?scope=public&limit=6"));

    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body.posts).toHaveLength(6);
    expect(body.posts[0].id).toBe("post-0");
    expect(body.posts[0].likedByViewer).toBe(false);
    expect(body.nextCursor).toBe("post-6");

    expect(postFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { visibility: PostVisibility.PUBLIC },
        take: 7,
      }),
    );
    expect(postFindUnique).not.toHaveBeenCalled();
  });

  it("gecersiz cursor icin 400 dondurur", async () => {
    authenticateMock.mockReturnValueOnce(null);
    postFindUnique.mockResolvedValueOnce(null);

    const response = await GET(buildRequest("https://app.local/api/posts?scope=public&cursor=missing"));

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("invalid_cursor");
    expect(postFindMany).not.toHaveBeenCalled();
  });

  it("If-None-Match eslesirse 304 dondurur", async () => {
    authenticateMock.mockReturnValue(null);

    const posts = Array.from({ length: 2 }, (_, index) => createPost(`post-${index}`));
    postFindMany.mockResolvedValueOnce(posts);

    const firstResponse = await GET(buildRequest("https://app.local/api/posts?scope=public"));
    expect(firstResponse.status).toBe(200);
    const etag = firstResponse.headers.get("etag");
    expect(etag).toBeTruthy();

    postFindMany.mockResolvedValueOnce(posts);
    const secondResponse = await GET(
      buildRequest("https://app.local/api/posts?scope=public", {
        headers: {
          "if-none-match": etag!,
        },
      }),
    );

    expect(secondResponse.status).toBe(304);
    expect(secondResponse.headers.get("etag")).toBe(etag);
  });
});
