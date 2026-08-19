import { NextResponse } from "next/server";
import { toErrorResponse } from "@/app/_libs/football/apiResponse";
import { getTeamInfoServer } from "@/app/_libs/football/teams";

interface Props {
  params: Promise<{ teamId: string }>;
}

export async function GET(_request: Request, { params }: Props) {
  const { teamId } = await params;

  if (!/^\d+$/.test(teamId)) {
    return NextResponse.json({ message: "Invalid teamId" }, { status: 400 });
  }

  try {
    return NextResponse.json(await getTeamInfoServer(teamId));
  } catch (error) {
    return toErrorResponse(error);
  }
}
