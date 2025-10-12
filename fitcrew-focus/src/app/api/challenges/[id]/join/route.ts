import { NextRequest } from "next/server";
import { authenticate } from "@/server/auth/session";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import { ChallengeServiceError, joinChallenge } from "@/server/challenges/service";

type RouteParams = {
  id: string;
};

export async function POST(request: NextRequest, context: { params: RouteParams }) {
  const session = authenticate(request);
  if (!session) {
    return jsonError({ code: "unauthorized", message: "Challenge'a kat\u0131lmak i\u00E7in giri\u015F yapmal\u0131s\u0131n\u0131z." }, 401);
  }

  const { id } = context.params;
  if (!id) {
    return jsonError({ code: "validation_error", message: "Ge\u00E7erli bir challenge kimli\u011Fi belirtmelisiniz." }, 400);
  }

  try {
    const participation = await joinChallenge(id, session.sub);
    return jsonSuccess({ participation }, 201);
  } catch (error) {
    if (error instanceof ChallengeServiceError) {
      return jsonError({ code: error.code, message: error.message, details: error.details }, error.status);
    }
    console.error("Challenge kat\u0131lma hatas\u0131:", error);
    return jsonError({ code: "internal_error", message: "Challenge kat\u0131l\u0131rken hata olu\u015Ftu." }, 500);
  }
}
