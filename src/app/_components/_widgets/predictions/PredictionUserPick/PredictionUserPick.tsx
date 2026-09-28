"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import PredictionGradeBadge from "@/app/_components/_widgets/predictions/PredictionGradeBadge/PredictionGradeBadge";
import {
  clampGoals,
  gradePrediction,
  MAX_PREDICTED_GOALS,
} from "@/app/_libs/_utils/prediction";
import { usePredictionStore } from "@/app/_stores/usePredictionStore";
import { Match } from "@/app/_types/matches";
import { PredictedScore, PredictionEntry } from "@/app/_types/predictions";
import styles from "./PredictionUserPick.module.scss";

interface Props {
  match: Match;
  entry?: PredictionEntry;
  isOpen: boolean;
}

interface StepperProps {
  teamName: string;
  crest: string;
  value: number;
  onChange: (value: number) => void;
}

function GoalStepper({ teamName, crest, value, onChange }: StepperProps) {
  return (
    <div className={styles.stepper}>
      <span className={styles.team}>
        {crest && <Image src={crest} alt="" width={18} height={18} />}
        {teamName}
      </span>
      <div>
        <button
          type="button"
          onClick={() => onChange(clampGoals(value - 1))}
          disabled={value <= 0}
          aria-label={`${teamName} 득점 줄이기`}
        >
          <Minus size={12} />
        </button>
        <strong aria-live="polite">{value}</strong>
        <button
          type="button"
          onClick={() => onChange(clampGoals(value + 1))}
          disabled={value >= MAX_PREDICTED_GOALS}
          aria-label={`${teamName} 득점 늘리기`}
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
}

export default function PredictionUserPick({ match, entry, isOpen }: Props) {
  const saveUserPrediction = usePredictionStore(
    (state) => state.saveUserPrediction,
  );
  const removeUserPrediction = usePredictionStore(
    (state) => state.removeUserPrediction,
  );

  const saved = entry?.user;
  const [isEditing, setIsEditing] = useState(!saved);
  const [draft, setDraft] = useState<PredictedScore>({
    home: saved?.home ?? 0,
    away: saved?.away ?? 0,
  });

  if (!isOpen) {
    return (
      <div className={styles.predictionUserPick}>
        <h4>내 예측</h4>
        {saved ? (
          <div className={styles.saved}>
            <strong>
              {saved.home} : {saved.away}
            </strong>
            {entry?.result && (
              <PredictionGradeBadge
                grade={gradePrediction(saved, entry.result)}
              />
            )}
          </div>
        ) : (
          <p className={styles.none}>예측하지 않은 경기입니다.</p>
        )}
      </div>
    );
  }

  if (saved && !isEditing) {
    return (
      <div className={styles.predictionUserPick}>
        <h4>내 예측</h4>
        <div className={styles.saved}>
          <strong>
            {saved.home} : {saved.away}
          </strong>
          <span className={styles.hint}>킥오프 전까지 수정할 수 있습니다</span>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => {
              setDraft({ home: saved.home, away: saved.away });
              setIsEditing(true);
            }}
          >
            수정
          </button>
          <button
            type="button"
            className={styles.subtle}
            onClick={() => removeUserPrediction(match.id)}
          >
            삭제
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.predictionUserPick}>
      <h4>내 예측</h4>
      <div className={styles.steppers}>
        <GoalStepper
          teamName={match.homeTeam.shortName}
          crest={match.homeTeam.crest}
          value={draft.home}
          onChange={(home) => setDraft((prev) => ({ ...prev, home }))}
        />
        <GoalStepper
          teamName={match.awayTeam.shortName}
          crest={match.awayTeam.crest}
          value={draft.away}
          onChange={(away) => setDraft((prev) => ({ ...prev, away }))}
        />
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primary}
          onClick={() => {
            saveUserPrediction(match, draft);
            setIsEditing(false);
          }}
        >
          예측 저장
        </button>
        {saved && (
          <button
            type="button"
            className={styles.subtle}
            onClick={() => setIsEditing(false)}
          >
            취소
          </button>
        )}
      </div>
    </div>
  );
}
