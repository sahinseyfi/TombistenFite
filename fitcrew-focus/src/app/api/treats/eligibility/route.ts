import { NextRequest } from "next/server";
import { authenticate } from "@/server/auth/session";
import { jsonError, jsonSuccess } from "@/server/api/responses";
import { computeEligibility } from "@/server/treats/eligibility";

export async function GET(request: NextRequest) {
  const session = authenticate(request);
  if (!session) {
    return jsonError({ code: "unauthorized", message: "Kacamak hak durumunu gormek icin giris yapmalisiniz." }, 401);
  }

  const eligibility = await computeEligibility(session.sub);

  return jsonSuccess({ eligibility }, { request });
}
