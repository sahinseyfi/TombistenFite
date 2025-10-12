import { NextRequest } from "next/server";
import { authenticate } from "@/server/auth/session";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import { getChallengesForUser } from "@/server/challenges/service";

export async function GET(request: NextRequest) {
  const session = authenticate(request);
  if (!session) {
    return jsonError({ code: "unauthorized", message: "Challenge listesini g\u00F6rmek i\u00E7in giri\u015F yapmal\u0131s\u0131n\u0131z." }, 401);
  }

  const challenges = await getChallengesForUser(session.sub);
  return jsonSuccess({ challenges }, { request });
}
