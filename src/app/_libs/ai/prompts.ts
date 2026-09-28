import { MatchOutcome } from "@/app/_libs/_utils/match";
import { TableRow } from "@/app/_types/standings";

export interface TeamPreviewContext {
  name: string;
  /** 최근 경기 폼 (오래된 순) */
  form: MatchOutcome[];
  standing?: Pick<
    TableRow,
    "position" | "points" | "playedGames" | "goalsFor" | "goalsAgainst"
  >;
}

export interface PreviewContext {
  competitionName: string;
  kickOffUtc: string;
  home: TeamPreviewContext;
  away: TeamPreviewContext;
  /** 최근 상대 전적 요약 (없으면 빈 배열) */
  headToHead: string[];
}

export const PREVIEW_SYSTEM_PROMPT = [
  "당신은 축구 경기 프리뷰를 쓰는 한국어 스포츠 에디터입니다.",
  "출력 형식을 정확히 지키세요:",
  "1) 먼저 3~4문장의 프리뷰 문단 하나.",
  "2) 그다음 '관전 포인트' 라는 줄, 이어서 '- ' 로 시작하는 항목 두 개.",
  "",
  "제약:",
  "- 주어진 데이터에 없는 사실을 만들어내지 마세요.",
  "- 특히 부상, 이적, 라인업, 선수 개인 기록, 감독 발언은 데이터에 없습니다. 언급하지 마세요.",
  "- 순위와 최근 폼, 상대 전적처럼 주어진 숫자만 근거로 쓰세요.",
  "- 확정된 예측 대신 근거를 들어 전망하세요.",
  "- 마크다운 강조 표시(**, ##)를 쓰지 마세요.",
].join("\n");

function describeTeam(team: TeamPreviewContext) {
  const form = team.form.length > 0 ? team.form.join("") : "정보 없음";
  const standing = team.standing
    ? `${team.standing.position}위, ${team.standing.playedGames}경기 ${team.standing.points}점, ` +
      `${team.standing.goalsFor}득점 ${team.standing.goalsAgainst}실점`
    : "순위 정보 없음";

  return `${team.name} (${standing} / 최근 폼 ${form})`;
}

function describeMatch(context: PreviewContext) {
  const lines = [
    `대회: ${context.competitionName}`,
    `킥오프(UTC): ${context.kickOffUtc}`,
    `홈: ${describeTeam(context.home)}`,
    `원정: ${describeTeam(context.away)}`,
  ];

  if (context.headToHead.length > 0) {
    lines.push(`최근 상대 전적: ${context.headToHead.join(", ")}`);
  }

  return lines;
}

export function buildPreviewPrompt(context: PreviewContext) {
  return [
    ...describeMatch(context),
    "",
    "위 데이터만 사용해 프리뷰를 작성하세요.",
  ].join("\n");
}

export const PREDICTION_SYSTEM_PROMPT = [
  "당신은 축구 경기 결과를 확률로 전망하는 분석가입니다.",
  "주어진 데이터만 근거로 홈 승 / 무승부 / 원정 승 확률과 가장 가능성 높은 스코어 하나를 내세요.",
  "",
  "규칙:",
  "- homeWin, draw, awayWin 은 0~100 정수이며 합은 100 입니다.",
  "- homeGoals, awayGoals 는 0~9 정수이며, 그 스코어의 승부는 확률이 가장 높은 결과와 일치해야 합니다.",
  "- reason 은 한국어 1~2문장으로, 어떤 숫자를 근거로 삼았는지 밝히세요.",
  "- 홈 이점은 반영하되 과장하지 마세요.",
  "- 데이터가 부족하면(순위·폼 정보 없음) 확률을 한쪽으로 몰지 말고 무승부 가능성을 충분히 두세요.",
  "- 부상, 이적, 라인업, 선수 개인 기록, 감독 발언은 데이터에 없습니다. 언급하지 마세요.",
].join("\n");

/** 구조화 출력 스키마. 범위 제약은 스키마에 싣지 않고 prediction 유틸이 한 번 더 보정한다. */
export const PREDICTION_OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    homeWin: { type: "integer" },
    draw: { type: "integer" },
    awayWin: { type: "integer" },
    homeGoals: { type: "integer" },
    awayGoals: { type: "integer" },
    reason: { type: "string" },
  },
  required: ["homeWin", "draw", "awayWin", "homeGoals", "awayGoals", "reason"],
  additionalProperties: false,
} as const;

export function buildPredictionPrompt(context: PreviewContext) {
  return [
    ...describeMatch(context),
    "",
    "위 데이터만 사용해 이 경기의 결과를 예측하세요.",
  ].join("\n");
}
