import { forwardRef } from "react";
import type { Answer, FolderID, GenreID, Question, CommentText } from "../lib/types";
import "./editDialog.css";

export interface EditTarget {
  id: number;
  q: Question;
  a: Answer;
  f: FolderID;
  g: GenreID;
  c: CommentText;
}

const EditDialog = forwardRef<
  HTMLDialogElement,
  {
    currentEditTarget: EditTarget | null;
    folders: string[];
    genres: string[];
    onChange: (value: EditTarget) => void;
    onSave: (value: EditTarget) => void;
  }
>(({ currentEditTarget, folders, genres, onChange, onSave }, ref) => {
  return (
    <dialog ref={ref} closedby="closerequest">
      {currentEditTarget && (
        <>
          <div className="toolbar">
            <div>
              {currentEditTarget.q.length} (
              {currentEditTarget.q.replace(/(（.+?）|\(.+?\)|【.+?】|［.+?］)/g, "").length})
            </div>
            <button onClick={() => typeof ref !== "function" && ref?.current?.close()}>✕</button>
          </div>
          <textarea
            value={currentEditTarget.q}
            onChange={(e) => onChange({ ...currentEditTarget, q: e.target.value as Question })}
            rows={5}
            placeholder="日本の首都は？"
          />
          <textarea
            value={currentEditTarget.a}
            onChange={(e) => onChange({ ...currentEditTarget, a: e.target.value as Answer })}
            rows={3}
            placeholder="東京（とうきょう）"
          />
          <textarea
            value={currentEditTarget.c}
            onChange={(e) => onChange({ ...currentEditTarget, c: e.target.value as CommentText })}
            rows={3}
            placeholder="自由記入欄"
          />
          <div className="flex">
            <select
              value={currentEditTarget.f}
              onChange={(e) =>
                onChange({ ...currentEditTarget, f: Number.parseInt(e.target.value) as FolderID })
              }
            >
              {folders
                .map((folder, index) => ({ folder, index }))
                .toSorted((a, b) =>
                  a.index === 0 ? -1 : b.index === 0 ? 1 : b.folder.localeCompare(a.folder),
                )
                .map(({ folder, index }) => (
                  <option key={folder} value={index}>
                    {folder}
                  </option>
                ))}
            </select>
            <select
              value={currentEditTarget.g}
              onChange={(e) =>
                onChange({ ...currentEditTarget, g: Number.parseInt(e.target.value) as GenreID })
              }
            >
              {genres
                .map((genre, index) => ({ genre, index }))
                .toSorted((a, b) =>
                  a.index === 0 ? -1 : b.index === 0 ? 1 : b.genre.localeCompare(a.genre),
                )
                .map(({ genre, index }) => (
                  <option key={genre} value={index}>
                    {genre}
                  </option>
                ))}
            </select>
            <button
              onClick={() => {
                onSave(currentEditTarget);
                if (typeof ref !== "function") ref?.current?.close();
              }}
            >
              保存
            </button>
          </div>
        </>
      )}
    </dialog>
  );
});

export default EditDialog;
