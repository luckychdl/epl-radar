/** localStorage 에 저장하는 최소 정보. 화면을 그리는 데 필요한 만큼만 담는다. */
export interface FavoriteTeam {
  id: number;
  name: string;
  crest: string;
  /** 팀 상세 링크에 쓰는 리그 코드 */
  code: string;
}

export interface FavoriteLeague {
  code: string;
  name: string;
}
