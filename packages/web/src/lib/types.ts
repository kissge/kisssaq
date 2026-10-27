export type Question = string & { __qBrand: never };
export type Answer = string & { __aBrand: never };
export type FolderID = number & { __fBrand: never };
export type GenreID = number & { __gBrand: never };
export type CommentText = string & { __cBrand: never };

export type Row = [
  Question,
  Answer,
  FolderID | null | undefined,
  GenreID | null | undefined,
  CommentText | null | undefined,
];
