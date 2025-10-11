import { describe, expect, it, beforeEach, vi } from "vitest";
import { PostVisibility } from "@prisma/client";

const { postFindUnique, followFindUnique } = vi.hoisted(() => ({
  postFindUnique: vi.fn(),
  followFindUnique: vi.fn(),
}));

vi.mock("@/server/db", () => ({
  prisma: {
    post: {
      findUnique: postFindUnique,
    },
    follow: {
      findUnique: followFindUnique,
    },
  },
}));

import { ensurePostAccess } from "@/server/posts/utils";

describe("ensurePostAccess", () => {
  beforeEach(() => {
    postFindUnique.mockReset();
    followFindUnique.mockReset();
  });

  it("post kimligi bosken dogrudan validasyon hatasi dondurur", async () => {
    const result = await ensurePostAccess("", null);

    expect(result).toEqual({
      ok: false,
      status: 400,
      code: "validation_error",
      message: "Gecerli bir gonderi kimligi belirtmelisiniz.",
    });
    expect(postFindUnique).not.toHaveBeenCalled();
  });

  it("post bulunmadiginda 404 doner", async () => {
    postFindUnique.mockResolvedValueOnce(null);

    const result = await ensurePostAccess("post-1", null);

    expect(postFindUnique).toHaveBeenCalledWith({
      where: { id: "post-1" },
      select: { id: true, authorId: true, visibility: true },
    });
    expect(result).toEqual({
      ok: false,
      status: 404,
      code: "not_found",
      message: "Gonderi bulunamadi.",
    });
  });

  it("genel paylasimlar icin izinsiz kullaniciya erisim saglar", async () => {
    postFindUnique.mockResolvedValueOnce({
      id: "post-2",
      authorId: "author-1",
      visibility: PostVisibility.PUBLIC,
    });

    const result = await ensurePostAccess("post-2", null);

    expect(result).toEqual({
      ok: true,
      post: {
        id: "post-2",
        authorId: "author-1",
        visibility: PostVisibility.PUBLIC,
      },
    });
    expect(followFindUnique).not.toHaveBeenCalled();
  });

  it("takipci kisitlamasinda onaysiz takipciyi reddeder", async () => {
    postFindUnique.mockResolvedValueOnce({
      id: "post-3",
      authorId: "author-2",
      visibility: PostVisibility.FOLLOWERS,
    });
    followFindUnique.mockResolvedValueOnce(null);

    const result = await ensurePostAccess("post-3", "viewer-1");

    expect(followFindUnique).toHaveBeenCalledWith({
      where: {
        followerId_followeeId: {
          followerId: "viewer-1",
          followeeId: "author-2",
        },
      },
      select: { status: true },
    });
    expect(result).toEqual({
      ok: false,
      status: 403,
      code: "forbidden",
      message: "Bu gonderiye erisim yetkiniz yok.",
    });
  });

  it("takipci kisitlamasinda onayli takipciye erisim saglar", async () => {
    postFindUnique.mockResolvedValueOnce({
      id: "post-4",
      authorId: "author-2",
      visibility: PostVisibility.FOLLOWERS,
    });
    followFindUnique.mockResolvedValueOnce({ status: "ACCEPTED" });

    const result = await ensurePostAccess("post-4", "viewer-2");

    expect(result).toEqual({
      ok: true,
      post: {
        id: "post-4",
        authorId: "author-2",
        visibility: PostVisibility.FOLLOWERS,
      },
    });
  });
});
