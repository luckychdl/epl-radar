import { NextResponse } from "next/server";
import { toErrorResponse } from "@/app/_libs/football/apiResponse";
import { getCompetitionsServer } from "@/app/_libs/football/competitions";

export async function GET() {
  try {
    return NextResponse.json(await getCompetitionsServer());
  } catch (error) {
    return toErrorResponse(error);
  }
}
