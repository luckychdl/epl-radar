import { NextRequest, NextResponse } from "next/server";
import { REVALIDATE } from "@/app/_constants/football";
import { toErrorResponse } from "@/app/_libs/football/apiResponse";
import { footballServerFetch } from "@/app/_libs/football/footballServerFetch";
import { TeamMatchesResponse } from "@/app/_types/teams";

const ALLOWED_STATUS = new Set([
  "SCHEDULED",
  "TIMED",
  "IN_PLAY",
  "PAUSED",
  "FINISHED",
  "SUSPENDED",
  "POSTPONED",
  "CANCELLED",
  "AWARDED",
]);

interface Props {
  params: Promise<{ teamId: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  const { teamId } = await params;

  if (!/^\d+$/.test(teamId)) {
    return NextResponse.json({ message: "Invalid teamId" }, { status: 400 });
  }

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const competitions = searchParams.get("competitions");
  const limit = Number(searchParams.get("limit"));

  // 클라이언트 입력을 그대로 외부 API URL 에 붙이지 않고 화이트리스트로 걸러낸다.
  const query = new URLSearchParams();
  if (status && ALLOWED_STATUS.has(status)) query.set("status", status);
  if (competitions && /^[A-Z0-9,]+$/.test(competitions)) {
    query.set("competitions", competitions);
  }
  if (Number.isInteger(limit) && limit > 0 && limit <= 100) {
    query.set("limit", String(limit));
  }

  try {
    const data = await footballServerFetch<TeamMatchesResponse>(
      `/teams/${teamId}/matches?${query.toString()}`,
      { revalidate: REVALIDATE.standard },
    );

    return NextResponse.json(data);
  } catch (error) {
    return toErrorResponse(error);
  }
}
