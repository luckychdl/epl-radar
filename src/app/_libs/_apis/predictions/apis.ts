import { AiPrediction } from "@/app/_types/predictions";

export class PredictionClosedError extends Error {
  constructor() {
    super("킥오프 이후에는 AI 예측을 새로 만들지 않습니다.");
    this.name = "PredictionClosedError";
  }
}

/**
 * AI 승부예측. 서버에 API 키가 없어 기능이 꺼져 있으면 null.
 * football-data 가 아니라 AI 라우트를 부르므로 /api/football axios 인스턴스를 쓰지 않는다.
 */
export async function getAiPrediction(
  matchId: number,
): Promise<AiPrediction | null> {
  const res = await fetch("/api/ai/prediction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ matchId }),
  });

  if (res.status === 204) return null;
  if (res.status === 409) throw new PredictionClosedError();
  if (!res.ok) throw new Error(`AI 예측 요청 실패 (${res.status})`);

  return res.json() as Promise<AiPrediction>;
}
