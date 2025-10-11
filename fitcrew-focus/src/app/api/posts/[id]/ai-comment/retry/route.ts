import { NextRequest } from "next/server";
import { prisma } from "@/server/db";
import { authenticate } from "@/server/auth/session";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import { resetAiComment } from "@/server/ai/comments";

type RouteParams = {
  params: {
    id: string;
  };
};

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = authenticate(request);
  if (!session) {
    return jsonError({ code: "unauthorized", message: "AI yorumunu yeniden oluşturmak için giriş yapmalısınız." }, 401);
  }

  const postId = params.id;
  if (!postId || postId.trim().length === 0) {
    return jsonError({ code: "validation_error", message: "Geçerli bir gönderi kimliği belirtilmelidir." }, 422);
  }

  const existing = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true, aiCommentRequested: true },
  });

  if (!existing) {
    return jsonError({ code: "not_found", message: "Gönderi bulunamadı." }, 404);
  }

  if (existing.authorId !== session.sub) {
    return jsonError({ code: "forbidden", message: "Bu gönderi için yetkiniz bulunmuyor." }, 403);
  }

  const updated = await resetAiComment(existing.id);

  return jsonSuccess({
    postId: updated.id,
    status: updated.aiCommentStatus,
  });
}
