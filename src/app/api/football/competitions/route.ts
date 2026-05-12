import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch("https://api.football-data.org/v4/competitions", {
    headers: {
      "X-Auth-Token": process.env.NEXT_PUBLIC_FOOTBALL_API_KEY!,
    },

    next: {
      revalidate: 60 * 60,
    },
  });

  if (!res.ok) {
    return NextResponse.json(
      { message: "Football API Error" },

      { status: res.status },
    );
  }

  const data = await res.json();

  return NextResponse.json(data);
}
