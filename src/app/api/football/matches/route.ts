import { NextRequest, NextResponse } from "next/server";
import {
  getTodayMatchesServer,
  normalizeDateParam,
} from "@/app/_libs/football/todayMatches";
import { TodayMatchesResponse } from "@/app/_types/todayMatches";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");

  if (date !== null && normalizeDateParam(date) === undefined) {
    return NextResponse.json(
      { message: "Invalid date (expected yyyyMMdd)" },
      { status: 400 },
    );
  }

  // getTodayMatchesServer 는 실패를 삼키고 빈 목록을 돌려준다.
  // 429 를 500 으로 바꾸지 않고, 빈 결과 + 플래그로 클라이언트에 알린다.
  const data = await getTodayMatchesServer(date);
  const body: TodayMatchesResponse = {
    ...data,
    degraded: data.leagues.length === 0,
  };

  return NextResponse.json(body);
}
