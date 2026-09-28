"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import PredictionGradeBadge from "@/app/_components/_widgets/predictions/PredictionGradeBadge/PredictionGradeBadge";
import {
  getAiPrediction,
  PredictionClosedError,
} from "@/app/_libs/_apis/predictions/apis";
import {
  getFavoredOutcome,
  gradePrediction,
} from "@/app/_libs/_utils/prediction";
import { usePredictionStore } from "@/app/_stores/usePredictionStore";
import { Match } from "@/app/_types/matches";
import { PredictionEntry } from "@/app/_types/predictions";
import styles from "./PredictionAiPick.module.scss";

type State = "idle" | "loading" | "error" | "hidden";

interface Props {
  match: Match;
  entry?: PredictionEntry;
  isOpen: boolean;
}

export default function PredictionAiPick({ match, entry, isOpen }: Props) {
  const saveAiPrediction = usePredictionStore(
    (state) => state.saveAiPrediction,
  );
  const [state, setState] = useState<State>("idle");

  const ai = entry?.ai;

  // 사용자가 눌렀을 때만 생성 요청을 낸다. 목록에서 경기마다 자동으로 부르지 않는다.
  const loadPrediction = async () => {
    setState("loading");

    try {
      const prediction = await getAiPrediction(match.id);

      if (!prediction) {
        setState("hidden");
        return;
      }

      saveAiPrediction(match, prediction);
      setState("idle");
    } catch (error) {
      setState(error instanceof PredictionClosedError ? "hidden" : "error");
    }
  };

  // 킥오프 전에 열어보지 않은 경기는 보여줄 AI 예측이 없다.
  if (state === "hidden" || (!ai && !isOpen)) return null;

  const header = (
    <h4>
      <Sparkles size={12} />
      AI 예측
      <small>AI 생성 내용</small>
    </h4>
  );

  if (ai) {
    const favored = getFavoredOutcome(ai);
    const bars = [
      { key: "HOME", label: match.homeTeam.shortName, value: ai.homeWin },
      { key: "DRAW", label: "무승부", value: ai.draw },
      { key: "AWAY", label: match.awayTeam.shortName, value: ai.awayWin },
    ] as const;

    return (
      <div className={styles.predictionAiPick}>
        {header}
        <div className={styles.score}>
          <strong>
            {ai.score.home} : {ai.score.away}
          </strong>
          {entry?.result && (
            <PredictionGradeBadge
              grade={gradePrediction(ai.score, entry.result)}
            />
          )}
        </div>
        <div
          className={styles.probability}
          role="img"
          aria-label={bars.map((bar) => `${bar.label} ${bar.value}%`).join(", ")}
        >
          {bars.map((bar) => (
            <span
              key={bar.key}
              className={`${styles[bar.key.toLowerCase()]} ${bar.key === favored ? styles.favored : ""}`}
              style={{ flexGrow: Math.max(bar.value, 1) }}
            />
          ))}
        </div>
        <ul className={styles.legend}>
          {bars.map((bar) => (
            <li
              key={bar.key}
              className={bar.key === favored ? styles.favored : undefined}
            >
              <span>{bar.label}</span>
              <em>{bar.value}%</em>
            </li>
          ))}
        </ul>
        <p className={styles.reason}>{ai.reason}</p>
      </div>
    );
  }

  return (
    <div className={styles.predictionAiPick}>
      {header}
      {state === "idle" && (
        <button
          type="button"
          className={styles.trigger}
          onClick={loadPrediction}
        >
          <Sparkles size={14} />
          AI 예측 보기
        </button>
      )}
      {state === "loading" && (
        <div className={styles.skeleton} aria-label="AI 예측 생성 중">
          <span />
          <span />
          <span />
        </div>
      )}
      {state === "error" && (
        <div className={styles.error}>
          <p>AI 예측을 불러오지 못했습니다.</p>
          <button type="button" onClick={loadPrediction}>
            다시 시도
          </button>
        </div>
      )}
    </div>
  );
}
