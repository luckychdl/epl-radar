import { MatchOutcome } from "@/app/_libs/_utils/match";
import { TableRow } from "@/app/_types/standings";

export interface TeamPreviewContext {
  name: string;
  /** 최근 경기 폼 (오래된 순) */
  form: MatchOutcome[];
  standing?: Pick<TableRow, "position" | "points" | "playedGames">;
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
    ? `${team.standing.position}위, ${team.standing.playedGames}경기 ${team.standing.points}점`
    : "순위 정보 없음";

  return `${team.name} (${standing} / 최근 폼 ${form})`;
}

export function buildPreviewPrompt(context: PreviewContext) {
  const lines = [
    `대회: ${context.competitionName}`,
    `킥오프(UTC): ${context.kickOffUtc}`,
    `홈: ${describeTeam(context.home)}`,
    `원정: ${describeTeam(context.away)}`,
  ];

  if (context.headToHead.length > 0) {
    lines.push(`최근 상대 전적: ${context.headToHead.join(", ")}`);
  }

  lines.push("", "위 데이터만 사용해 프리뷰를 작성하세요.");

  return lines.join("\n");
}
