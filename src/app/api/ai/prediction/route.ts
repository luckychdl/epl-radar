import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { buildMatchContext, findMatch } from "@/app/_libs/ai/matchContext";
import {
  buildPredictionPrompt,
  PREDICTION_OUTPUT_SCHEMA,
  PREDICTION_SYSTEM_PROMPT,
} from "@/app/_libs/ai/prompts";
import {
  isPredictionOpen,
  normalizeAiPrediction,
} from "@/app/_libs/_utils/prediction";
import { Match } from "@/app/_types/matches";
import { AiPrediction } from "@/app/_types/predictions";

/** 출력은 짧은 JSON 이지만 적응형 사고가 먼저 토큰을 쓰므로 여유를 둔다. */
const MAX_TOKENS = 4096;
const PREDICTION_CACHE_LIMIT = 300;

/**
 * matchId 별 예측 캐시. 프리뷰와 달리 상태로 무효화하지 않는다.
 * 예측은 킥오프 전 한 번 내면 끝까지 고정돼야 채점이 의미가 있다.
 */
const predictionCache = new Map<number, AiPrediction>();

/** 같은 경기를 여러 명이 동시에 열어도 생성 요청은 하나만 나가게 한다. */
const pendingPredictions = new Map<number, Promise<AiPrediction | null>>();

const NO_STORE = { "Cache-Control": "no-store" };

async function generatePrediction(match: Match): Promise<AiPrediction | null> {
  const context = await buildMatchContext(match);
  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: MAX_TOKENS,
      // 주어진 숫자 몇 개로 확률을 매기는 작업이라 깊게 생각할 필요가 없다.
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: PREDICTION_OUTPUT_SCHEMA },
      },
      system: PREDICTION_SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildPredictionPrompt(context) }],
    });

    if (response.stop_reason !== "end_turn") {
      console.warn("[ai/prediction] 비정상 종료", response.stop_reason);
      return null;
    }

    const text = response.content.find((block) => block.type === "text");

    return text ? normalizeAiPrediction(JSON.parse(text.text)) : null;
  } catch (error) {
    console.error("[ai/prediction]", error);
    return null;
  }
}

function getOrCreatePrediction(match: Match) {
  const pending = pendingPredictions.get(match.id);
  if (pending) return pending;

  const task = generatePrediction(match)
    .then((prediction) => {
      if (prediction) {
        if (predictionCache.size >= PREDICTION_CACHE_LIMIT) {
          predictionCache.clear();
        }
        predictionCache.set(match.id, prediction);
      }
      return prediction;
    })
    .finally(() => pendingPredictions.delete(match.id));

  pendingPredictions.set(match.id, task);

  return task;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const matchId = Number((body as { matchId?: unknown } | null)?.matchId);

  if (!Number.isInteger(matchId) || matchId <= 0) {
    return NextResponse.json({ message: "Invalid matchId" }, { status: 400 });
  }

  // 키가 없으면 기능을 끈 상태로 본다. 화면에서는 AI 예측 영역만 사라진다.
  if (!process.env.ANTHROPIC_API_KEY) {
    return new NextResponse(null, { status: 204 });
  }

  const cached = predictionCache.get(matchId);

  if (cached) {
    return NextResponse.json(cached, { headers: NO_STORE });
  }

  const match = await findMatch(matchId);

  if (!match) {
    return NextResponse.json({ message: "Match not found" }, { status: 404 });
  }

  // 결과를 보고 나서 내는 예측은 의미가 없다. 킥오프 이후에는 새로 만들지 않는다.
  if (!isPredictionOpen(match, new Date())) {
    return NextResponse.json(
      { message: "Prediction closed" },
      { status: 409 },
    );
  }

  const prediction = await getOrCreatePrediction(match);

  if (!prediction) {
    return NextResponse.json(
      { message: "Prediction unavailable" },
      { status: 502 },
    );
  }

  return NextResponse.json(prediction, { headers: NO_STORE });
}
