import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://api.football-data.org/v4";

interface Props {
  params: Promise<{
    teamId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  const { teamId } = await params;

  const searchParams = request.nextUrl.searchParams;

  const status = searchParams.get("status");
  const limit = searchParams.get("limit");
  const code = searchParams.get("competitions");

  const res = await fetch(
    `${BASE_URL}/teams/${teamId}/matches?status=${status}&competitions=${code}&limit=${limit}`,
    {
      headers: {
        "X-Auth-Token": process.env.FOOTBALL_API_KEY!,
      },

      next: {
        revalidate: 60 * 10,
      },
    },
  );

  const data = await res.json();

  return NextResponse.json(data);
}
