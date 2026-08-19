// src/app/_constants/leagues.ts
export const SUPPORTED_LEAGUES = [
  { code: "PL", name: "Premier League" },
  { code: "PD", name: "Primera Division" },
  { code: "SA", name: "Serie A" },
  { code: "BL1", name: "Bundesliga" },
  { code: "FL1", name: "Ligue 1" },
  { code: "CL", name: "UEFA Champions League" },
  { code: "EC", name: "European Championship" },
  { code: "WC", name: "FIFA World Cup" },
] as const;

/** /v4/matches?competitions= 에 넘기는 값 */
export const SUPPORTED_LEAGUE_CODES = SUPPORTED_LEAGUES.map(
  (league) => league.code,
).join(",");
