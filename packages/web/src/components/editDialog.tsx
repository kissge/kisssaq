import "./editDialog.css";

import { forwardRef, useEffect, useRef } from "react";

import { replaceSuspiciousSymbols, splitSuspiciousSymbols } from "../lib/suspiciousSymbols";
import {
  type Answer,
  Flag,
  type FolderID,
  type GenreID,
  type Question,
  type CommentText,
  FlagCount,
  type Config,
} from "../lib/types";

export interface EditTarget {
  id: number;
  q: Question;
  a: Answer;
  f: FolderID;
  g: GenreID;
  c: CommentText;
  flag: Flag | null;
  modified: boolean;
  isNew: boolean;
}

const EditDialog = forwardRef<
  HTMLDialogElement,
  {
    currentEditTarget: EditTarget | null;
    folders: string[];
    genres: string[];
    config: Config;
    onChange: (value: EditTarget) => void;
    onSave: (value: EditTarget) => void;
    onCancelAdd: (id: number) => void;
  }
>(({ currentEditTarget, folders, genres, config, onChange, onSave, onCancelAdd }, ref) => {
  const overlayRefQ = useRef<HTMLDivElement>(null);
  const overlayRefA = useRef<HTMLDivElement>(null);
  const overlayRefC = useRef<HTMLDivElement>(null);

  function save() {
    const value = {
      ...currentEditTarget!,
      q: replaceSuspiciousSymbols(currentEditTarget!.q, config.suspiciousSymbols),
      a: replaceSuspiciousSymbols(currentEditTarget!.a, config.suspiciousSymbols),
      c: replaceSuspiciousSymbols(currentEditTarget!.c, config.suspiciousSymbols),
    };
    onSave(value);
    onChange({ ...value, modified: false });
    if (typeof ref !== "function") ref?.current?.close();
  }

  useEffect(() => {
    if (!currentEditTarget?.modified) {
      return;
    }

    function confirmClose(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = true;
    }

    window.addEventListener("beforeunload", confirmClose);
    return () => {
      window.removeEventListener("beforeunload", confirmClose);
    };
  }, [currentEditTarget?.modified]);

  return (
    <dialog
      ref={ref}
      closedby={currentEditTarget?.modified ? "none" : "any"}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          save();
        }
      }}
      onClose={() => {
        if (currentEditTarget?.isNew) {
          if (currentEditTarget.q || currentEditTarget.a || currentEditTarget.c) {
            return;
          }

          onCancelAdd(currentEditTarget.id);
        }
      }}
    >
      {currentEditTarget && (
        <>
          <div className="toolbar">
            <div>
              {currentEditTarget.q.length} (
              {currentEditTarget.q.replace(/(（.+?）|\(.+?\)|【.+?】|［.+?］)/g, "").length})
            </div>
            <button
              onClick={() => {
                if (typeof ref !== "function") {
                  if (
                    !currentEditTarget.modified ||
                    window.confirm("変更が保存されていません。本当に閉じますか？")
                  ) {
                    onChange({ ...currentEditTarget!, modified: false });
                    ref?.current?.close();
                  }
                }
              }}
            >
              ✕
            </button>
          </div>
          <div className="textarea-wrapper">
            <textarea
              lang="ja"
              value={currentEditTarget.q}
              autoFocus
              onChange={(e) =>
                onChange({ ...currentEditTarget, modified: true, q: e.target.value as Question })
              }
              onScroll={(e) => {
                if (overlayRefQ.current) {
                  overlayRefQ.current.scrollTop = e.currentTarget.scrollTop;
                }
              }}
              rows={4}
              placeholder="日本の首都は？"
            />
            <div className="overlay" ref={overlayRefQ}>
              {splitSuspiciousSymbols(currentEditTarget.q, config.suspiciousSymbols)}
              {/* 末尾の改行を描画させるためのダミー文字 */}
              {"​"}
            </div>
          </div>

          <div className="textarea-wrapper">
            <textarea
              lang="ja"
              value={currentEditTarget.a}
              onChange={(e) =>
                onChange({ ...currentEditTarget, modified: true, a: e.target.value as Answer })
              }
              onScroll={(e) => {
                if (overlayRefA.current) {
                  overlayRefA.current.scrollTop = e.currentTarget.scrollTop;
                }
              }}
              style={{ fieldSizing: "content" }}
              placeholder="東京（とうきょう）"
            />
            <div className="overlay" ref={overlayRefA}>
              {splitSuspiciousSymbols(currentEditTarget.a, config.suspiciousSymbols)}
              {/* 末尾の改行を描画させるためのダミー文字 */}
              {"​"}
            </div>
          </div>

          <div className="textarea-wrapper">
            <textarea
              lang="ja"
              value={currentEditTarget.c}
              onChange={(e) =>
                onChange({ ...currentEditTarget, modified: true, c: e.target.value as CommentText })
              }
              onScroll={(e) => {
                if (overlayRefC.current) {
                  overlayRefC.current.scrollTop = e.currentTarget.scrollTop;
                }
              }}
              style={{ fieldSizing: "content" }}
              placeholder="自由記入欄"
            />
            <div className="overlay" ref={overlayRefC}>
              {splitSuspiciousSymbols(currentEditTarget.c, config.suspiciousSymbols)}
              {/* 末尾の改行を描画させるためのダミー文字 */}
              {"​"}
            </div>
          </div>

          <div className="flex flags-wrapper">
            フラグ
            {Array.from({ length: FlagCount }, (_, i) => Flag(i + 1)).map((flag) => (
              <label
                key={flag}
                className={currentEditTarget.flag === flag ? "flagged" : ""}
                style={{ "--hue": ((flag + 2) * (360 / FlagCount)) % 360 } as React.CSSProperties}
              >
                ★
                <input
                  type="radio"
                  name="flag"
                  defaultChecked={currentEditTarget.flag === flag}
                  onClick={(e) => {
                    if (currentEditTarget.flag === flag) {
                      (e.target as HTMLInputElement).checked = false;
                      onChange({ ...currentEditTarget, modified: true, flag: null });
                    } else {
                      onChange({ ...currentEditTarget, modified: true, flag });
                    }
                  }}
                />
              </label>
            ))}
          </div>
          <div className="flex">
            <select
              value={currentEditTarget.f}
              onChange={(e) =>
                onChange({
                  ...currentEditTarget,
                  modified: true,
                  f: Number.parseInt(e.target.value) as FolderID,
                })
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
                onChange({
                  ...currentEditTarget,
                  modified: true,
                  g: Number.parseInt(e.target.value) as GenreID,
                })
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
            <button className={currentEditTarget?.modified ? "primary-btn" : ""} onClick={save}>
              保存
            </button>
          </div>
        </>
      )}
    </dialog>
  );
});

export default EditDialog;
