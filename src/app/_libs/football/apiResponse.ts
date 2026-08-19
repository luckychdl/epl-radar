import { NextResponse } from "next/server";
import { FootballApiError } from "./footballServerFetch";

/** 라우트 핸들러에서 발생한 에러를 상태 코드가 살아 있는 JSON 응답으로 변환한다. */
export function toErrorResponse(error: unknown) {
  if (error instanceof FootballApiError) {
    return NextResponse.json(
      { message: "Football API Error", status: error.status },
      { status: error.status },
    );
  }

  console.error("[api/football]", error);

  return NextResponse.json(
    { message: "Internal Server Error" },
    { status: 500 },
  );
}
