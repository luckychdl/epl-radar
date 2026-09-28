import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  clampGoals,
  isPredictionOpen,
  pruneEntries,
  settleEntries,
  toPredictionSnapshot,
} from "@/app/_libs/_utils/prediction";
import { Match } from "@/app/_types/matches";
import {
  AiPrediction,
  PredictedScore,
  PredictionEntry,
} from "@/app/_types/predictions";

/** localStorage 용량을 고려한 상한. 한 시즌 동안 매주 몇 경기씩 예측해도 충분하다. */
const MAX_ENTRIES = 300;

interface PredictionState {
  entries: Record<number, PredictionEntry>;
  saveUserPrediction: (match: Match, score: PredictedScore) => void;
  removeUserPrediction: (matchId: number) => void;
  saveAiPrediction: (match: Match, ai: AiPrediction) => void;
  /** 이미 화면에 있는 경기 데이터로 결과를 채운다. 추가 요청을 내지 않는다. */
  settle: (matches: Match[]) => void;
}

function upsert(
  entries: Record<number, PredictionEntry>,
  match: Match,
  patch: Partial<PredictionEntry>,
) {
  const current = entries[match.id];

  return pruneEntries(
    {
      ...entries,
      [match.id]: {
        ...current,
        match: current?.match ?? toPredictionSnapshot(match),
        ...patch,
      },
    },
    MAX_ENTRIES,
  );
}

export const usePredictionStore = create<PredictionState>()(
  persist(
    (set) => ({
      entries: {},
      saveUserPrediction: (match, score) =>
        set((state) => {
          // 화면이 오래 열려 있던 사이 킥오프가 지났을 수 있다. 저장 시점에 한 번 더 막는다.
          if (!isPredictionOpen(match, new Date())) return state;

          return {
            entries: upsert(state.entries, match, {
              user: {
                home: clampGoals(score.home),
                away: clampGoals(score.away),
                savedAt: new Date().toISOString(),
              },
            }),
          };
        }),
      removeUserPrediction: (matchId) =>
        set((state) => {
          const entry = state.entries[matchId];
          if (!entry?.user) return state;

          const rest = { ...state.entries };

          // AI 예측까지 본 경기는 AI 성적 집계를 위해 기록을 남긴다.
          if (entry.ai) {
            rest[matchId] = { ...entry, user: undefined };
          } else {
            delete rest[matchId];
          }

          return { entries: rest };
        }),
      saveAiPrediction: (match, ai) =>
        set((state) => ({
          entries: upsert(state.entries, match, { ai }),
        })),
      settle: (matches) =>
        set((state) => {
          const next = settleEntries(state.entries, matches);

          return next ? { entries: next } : state;
        }),
    }),
    { name: "epl-radar-predictions", version: 1 },
  ),
);
