import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { buildMatchContext, findMatch } from "@/app/_libs/ai/matchContext";
import { buildPreviewPrompt, PREVIEW_SYSTEM_PROMPT } from "@/app/_libs/ai/prompts";

/** 프리뷰는 3~4문장 + 관전 포인트 2개로 고정이므로 길게 열어둘 필요가 없다. */
const MAX_TOKENS = 1024;
const PREVIEW_CACHE_LIMIT = 200;

/**
 * matchId + 경기 상태별 생성 결과 캐시.
 * 같은 경기를 여러 번 열어도 생성은 한 번만 일어나고, 상태가 바뀌면 자동으로 무효화된다.
 */
const previewCache = new Map<string, string>();

const TEXT_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-store",
};

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const matchId = Number((body as { matchId?: unknown } | null)?.matchId);

  if (!Number.isInteger(matchId) || matchId <= 0) {
    return NextResponse.json({ message: "Invalid matchId" }, { status: 400 });
  }

  // 키가 없으면 기능을 끈 상태로 본다. 화면에서는 이 섹션만 사라진다.
  if (!process.env.ANTHROPIC_API_KEY) {
    return new NextResponse(null, { status: 204 });
  }

  const match = await findMatch(matchId);

  if (!match) {
    return NextResponse.json({ message: "Match not found" }, { status: 404 });
  }

  const cacheKey = `${matchId}:${match.status}`;
  const cached = previewCache.get(cacheKey);

  if (cached) {
    return new NextResponse(cached, { headers: TEXT_HEADERS });
  }

  const context = await buildMatchContext(match);
  const client = new Anthropic();

  const messageStream = client.messages.stream({
    model: "claude-opus-5",
    max_tokens: MAX_TOKENS,
    // 짧은 프리뷰라 깊게 생각할 필요가 없다. 비용과 지연을 함께 줄인다.
    output_config: { effort: "low" },
    system: PREVIEW_SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildPreviewPrompt(context) }],
  });

  const encoder = new TextEncoder();
  let generated = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of messageStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            generated += event.delta.text;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        if (generated.length > 0) {
          if (previewCache.size >= PREVIEW_CACHE_LIMIT) {
            previewCache.clear();
          }
          previewCache.set(cacheKey, generated);
        }
      } catch (error) {
        // 실패해도 화면 전체를 죽이지 않는다. 지금까지 받은 내용만 남기고 닫는다.
        console.error("[ai/preview]", error);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, { headers: TEXT_HEADERS });
}
