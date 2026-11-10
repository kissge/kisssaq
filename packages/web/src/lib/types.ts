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

export interface Config {
  questionLengthThreshold: number;
  showGenre: boolean;
  showComment: boolean;
}

export const FlagCount = 3;
