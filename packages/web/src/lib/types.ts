export type Question = string & { __qBrand: never };
export type Answer = string & { __aBrand: never };
export type FolderID = number & { __fBrand: never };
export type GenreID = number & { __gBrand: never };
export type CommentText = string & { __cBrand: never };
export type Flag = number & { __flBrand: never };
export function Flag(value: number): Flag {
  return value as Flag;
}

export type Row = [
  Question,
  Answer,
  FolderID | null | undefined,
  GenreID | null | undefined,
  CommentText | null | undefined,
  Flag | null | undefined,
];

export const defaultConfig = {
  questionLengthThreshold: 60,
  showGenre: false,
  showComment: true,
  suspiciousSymbols: [] as [string, string][],
};
export type Config = typeof defaultConfig;

export type Order = "default" | "genre" | "flag" | "comment";
export const Orders: Record<Order, string> = {
  default: "登録順",
  genre: "ジャンル順",
  flag: "フラグ順",
  comment: "コメント順",
};

export const FlagCount = 3;
