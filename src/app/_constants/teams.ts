export const TEAM_TABS = [
  { type: "overview", label: "Overview" },
  { type: "matches", label: "Matches" },
  { type: "squad", label: "Squad" },
  { type: "stats", label: "Stats" },
] as const;

export type TeamTabType = (typeof TEAM_TABS)[number]["type"];

export function isTeamTabType(value: string): value is TeamTabType {
  return TEAM_TABS.some((tab) => tab.type === value);
}
