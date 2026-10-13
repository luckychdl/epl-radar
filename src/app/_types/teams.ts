import { Match } from "./matches";

export interface TeamMatchesResponse {
  resultSet: {
    count: number;
  };
  matches: Match[];
}
