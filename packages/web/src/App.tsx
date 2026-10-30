import { useRef, useState } from "react";
import { toast } from "sonner";
import "./App.css";
import { useLocalStorage } from "./hooks/useLocalStorage";
import EditDialog, { type EditTarget } from "./components/editDialog";
import ImportDialog from "./components/importDialog";
import ExportDialog from "./components/exportDialog";
import SwitchViewDialog from "./components/switchViewDialog";
import UnlockDialog from "./components/unlockDialog";
import SyncDialog from "./components/syncDialog";
import { useDatabase } from "./hooks/useDatabase";
import { useUnlocked } from "./hooks/useUnlocked";
import type { CommentText, FolderID, GenreID, Row } from "./lib/types";
import { authorURL, wishlistURL } from "kissunlocklib";

function isLong(text: string, threshold: number = 10): boolean {
  const length = text.length + [...text].filter((c) => c.charCodeAt(0) > 255).length;
  return length > threshold;
}

function App() {
  const { unlocked } = useUnlocked();
  const {
    questions,
    folders,
    genres,
    userID,
    loading,
    syncStatus,
    setQuestions,
    setFolders,
    setGenres,
    changeUserID,
  } = useDatabase(unlocked);
  const [checked, setChecked] = useState<number[]>([]);
  const [activeFolder, setActiveFolder] = useLocalStorage<FolderID | null>("activeFolder", null);
  const [activeGenre, setActiveGenre] = useLocalStorage<GenreID | null>("activeGenre", null);
  const [currentEditTarget, setCurrentEditTarget] = useState<EditTarget | null>(null);
  const [moveFolderTarget, setMoveFolderTarget] = useState(0 as FolderID);
  const [moveGenreTarget, setMoveGenreTarget] = useState(0 as GenreID);
  const [order, setOrder] = useState<"default" | "genre" | number[]>("default");
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const editDialogRef = useRef<HTMLDialogElement>(null);
  const switchFolderDialogRef = useRef<HTMLDialogElement>(null);
  const switchGenreDialogRef = useRef<HTMLDialogElement>(null);
  const unlockDialogRef = useRef<HTMLDialogElement>(null);
  const syncDialogRef = useRef<HTMLDialogElement>(null);
  const exportDialogRef = useRef<HTMLDialogElement>(null);
  const importDialogRef = useRef<HTMLDialogElement>(null);

  if (loading) {
    return null;
  }

  function startEdit(id: number) {
    const q = questions[id]?.[0] ?? "";
    const a = questions[id]?.[1] ?? "";
    const f = questions[id]?.[2] ?? activeFolder ?? (0 as FolderID);
    const g = questions[id]?.[3] ?? activeGenre ?? (0 as GenreID);
    const c = questions[id]?.[4] ?? ("" as CommentText);
    setCurrentEditTarget({ q, a, f, g, c, id, modified: false });
    editDialogRef.current?.showModal();
    setTimeout(() => editDialogRef.current?.querySelector("textarea")?.focus(), 10);
  }

  const filteredQuestions = (
    Array.isArray(order)
      ? order.map((i) => ({ i, qa: questions[i] }))
      : order === "default"
        ? questions.map((qa, i) => ({ i, qa })).toReversed()
        : questions
            .map((qa, i) => ({ i, qa }))
            .toReversed()
            .toSorted((a, b) => (a.qa[3] ?? 0) - (b.qa[3] ?? 0))
  ).filter(
    ({ qa: [q, a, f, g] }) =>
      (!searchKeyword || q.includes(searchKeyword) || a.includes(searchKeyword)) &&
      (activeFolder === null || (f ?? 0) === activeFolder) &&
      (activeGenre === null || (g ?? 0) === activeGenre),
  );

  function splitQuestion(
    q: string,
    limit: number = 60,
  ): { type: "normal" | "dimmed" | "over"; text: string }[] {
    const split = q.split(/(（.+?）|\(.+?\)|【.+?】|［.+?］)/);
    const result = [];
    let count = 0;
    for (const [i, part] of split.entries()) {
      if (i % 2) {
        result.push({ type: "dimmed" as const, text: part });
      } else {
        if (!Number.isFinite(count)) {
          result.push({ type: "over" as const, text: part });
        } else if (count + part.length > limit) {
          result.push({ type: "normal" as const, text: part.slice(0, limit - count) });
          result.push({ type: "over" as const, text: part.slice(limit - count) });
          count = Infinity;
        } else {
          result.push({ type: "normal" as const, text: part });
          count += part.length;
        }
      }
    }

    return result;
  }

  return (
    <>
      <section id="center">
        {activeFolder === null && activeGenre === null && questions.length === 0 ? (
          <div className="welcome-message">
            <h1>
              自作問題管理アプリ
              <ruby>
                kissSaq
                <rt>きすさく</rt>
              </ruby>
            </h1>

            <ul>
              <li>まずは右下の「追加」ボタンをクリックして問題を登録してください。</li>
              <li>問題はフォルダ分けができます。</li>
              <li>CSV/TSV形式での書き出し・取り込みに対応しています。</li>
            </ul>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="empty-message">
            <h2>問題が1件もありません</h2>
            <p>
              {activeFolder !== null && `フォルダ「${folders[activeFolder]}」`}
              {activeGenre !== null && `ジャンル「${genres[activeGenre]}」`}
              {searchKeyword && `検索キーワード「${searchKeyword}」`}に該当する問題が存在しません。
            </p>
          </div>
        ) : null}

        <table
          style={{
            marginBottom: showSearchBox || checked.length > 0 ? "6em" : "3em",
          }}
        >
          <tbody>
            {filteredQuestions.map(({ i, qa: [q, a] }) => (
              <tr key={i + q}>
                <th>
                  <input
                    type="checkbox"
                    checked={checked.includes(i)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setChecked([...checked, i]);
                      } else {
                        setChecked(checked.filter((n) => n !== i));
                      }
                    }}
                  />
                </th>
                <td onClick={() => startEdit(i)}>
                  {order === "genre" && (
                    <span className="genre-label">{genres[questions[i][3] ?? 0]}</span>
                  )}
                  {q
                    ? splitQuestion(q).map(({ type, text }) => (
                        <span key={text} className={type}>
                          {text}
                        </span>
                      ))
                    : "ここをクリックして編集"}
                </td>
                <td onClick={() => startEdit(i)}>{a}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {showSearchBox && (
          <div className="search-toolbar">
            <input
              placeholder="検索キーワードを入力"
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
        )}

        {checked.length > 0 && (
          <div className="bulk-toolbar">
            <input
              type="checkbox"
              checked={checked.length === filteredQuestions.length}
              onChange={(e) => {
                if (e.target.checked) {
                  setChecked(filteredQuestions.map(({ i }) => i));
                } else {
                  setChecked([]);
                }
              }}
            />
            {checked.length}件を
            <button
              onClick={() => {
                setQuestions(questions.filter((_, j) => !checked.includes(j)));

                if (Array.isArray(order)) {
                  setOrder(order.filter((i) => !checked.includes(i)));
                }

                setChecked([]);
              }}
            >
              削除
            </button>
            <div>
              <select
                value={moveFolderTarget}
                onChange={(e) => setMoveFolderTarget(Number.parseInt(e.target.value) as FolderID)}
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
              <button
                onClick={() => {
                  const newQuestions = questions.map((qa, i) => {
                    if (checked.includes(i)) {
                      qa[2] = moveFolderTarget as FolderID;
                    }

                    return qa;
                  });
                  setQuestions(newQuestions);
                  setChecked([]);
                  setMoveFolderTarget(0 as FolderID);
                }}
              >
                に移動
              </button>
            </div>
            <div>
              <select
                value={moveGenreTarget}
                onChange={(e) => setMoveGenreTarget(Number.parseInt(e.target.value) as GenreID)}
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
                  const newQuestions = questions.map((qa, i) => {
                    if (checked.includes(i)) {
                      qa[3] = moveGenreTarget as GenreID;
                    }

                    return qa;
                  });
                  setQuestions(newQuestions);
                  setChecked([]);
                  setMoveGenreTarget(0 as GenreID);
                }}
              >
                に変更
              </button>
            </div>
          </div>
        )}

        <div className={"global-toolbar " + (unlocked ? "unlocked" : "")}>
          <div>
            <button
              disabled={questions.length === 0}
              onClick={() => {
                setOrder(
                  order === "default"
                    ? questions.map((_, i) => i).toSorted(() => Math.random() - 0.5)
                    : order === "genre"
                      ? "default"
                      : "genre",
                );
              }}
            >
              {order === "default" ? "登録順" : order === "genre" ? "ジャンル順" : "ランダム"}
            </button>
            <button onClick={() => switchFolderDialogRef.current?.showModal()}>
              {activeFolder === null ? (
                "全フォルダ"
              ) : (
                <div className={isLong(folders[activeFolder]) ? "long-folder-name" : ""}>
                  {folders[activeFolder]}
                </div>
              )}
            </button>
            <button onClick={() => switchGenreDialogRef.current?.showModal()}>
              {activeGenre === null ? (
                "全ジャンル"
              ) : (
                <div className={isLong(genres[activeGenre]) ? "long-folder-name" : ""}>
                  {genres[activeGenre]}
                </div>
              )}
            </button>
            <button
              disabled={questions.length === 0}
              onClick={() => {
                if (showSearchBox) {
                  setSearchKeyword("");
                } else {
                  setTimeout(
                    () =>
                      (document.querySelector(".search-toolbar input") as HTMLInputElement).focus(),
                    10,
                  );
                }

                setShowSearchBox(!showSearchBox);
              }}
            >
              検索
            </button>
            <button
              className="primary-btn"
              onClick={() => {
                setQuestions([
                  ...questions,
                  ["", "", activeFolder ?? 0, activeGenre ?? 0, ""] as Row,
                ]);

                if (Array.isArray(order)) {
                  setOrder([...order, questions.length]);
                }

                startEdit(questions.length);
              }}
            >
              追加
            </button>
            <button className="more-btn" popoverTarget="moreMenu">
              ︙
            </button>
          </div>
        </div>
      </section>

      <div id="moreMenu" popover="auto">
        <button onClick={() => unlockDialogRef.current?.showModal()}>機能アンロック</button>
        <button
          onClick={() => {
            if (unlocked) {
              syncDialogRef.current?.showModal();
            } else {
              toast.error("クラウド同期を利用するためには、機能アンロックが必要です。", {
                position: "top-center",
              });
            }
          }}
        >
          クラウド同期 🔒
        </button>
        <button
          disabled={questions.length === 0}
          onClick={() => exportDialogRef.current?.showModal()}
        >
          CSV出力
        </button>
        <button onClick={() => importDialogRef.current?.showModal()}>CSV取り込み</button>
        <div className="credit">
          kissSaq<small>（きすさく）</small>
          <br />© 2026 _kidochan
          <div>
            <a href="https://github.com/kissge/kisssaq" target="_blank">
              GitHub
            </a>
            <a href={authorURL} target="_blank">
              作者
            </a>
            <a href={wishlistURL} target="_blank">
              応援してくれ
            </a>
          </div>
        </div>
      </div>

      <EditDialog
        ref={editDialogRef}
        currentEditTarget={currentEditTarget}
        folders={folders}
        genres={genres}
        onChange={setCurrentEditTarget}
        onSave={(value) => {
          const newQuestions = [...questions];
          newQuestions[value.id] = [value.q, value.a, value.f, value.g, value.c];
          setQuestions(newQuestions);
        }}
      />

      <ImportDialog
        ref={importDialogRef}
        activeFolder={activeFolder}
        activeGenre={activeGenre}
        onImport={(parsed) => {
          setOrder("default");
          setQuestions([...questions, ...parsed] as Row[]);
        }}
      />

      <ExportDialog
        ref={exportDialogRef}
        questions={questions}
        visibleQuestions={filteredQuestions.map(({ qa }) => qa)}
        checkedQuestions={checked.flatMap((index) => (questions[index] ? [questions[index]] : []))}
        folders={folders}
        genres={genres}
      />

      <UnlockDialog ref={unlockDialogRef} />

      <SwitchViewDialog
        ref={switchFolderDialogRef}
        id="switchFolderDialog"
        itemKind="フォルダ"
        items={folders}
        activeItem={activeFolder}
        filteredQuestions={questions
          .filter((qa) => activeGenre === null || (qa[3] ?? 0) === activeGenre)
          .map((qa) => qa[2] ?? 0)}
        onChange={(value) => setActiveFolder(value as FolderID | null)}
        onItemCreate={(name) => setFolders([...folders, name])}
        onItemRename={(index, newName) => {
          const newFolders = [...folders];
          newFolders[index] = newName;
          setFolders(newFolders);
        }}
      />

      <SwitchViewDialog
        ref={switchGenreDialogRef}
        id="switchGenreDialog"
        itemKind="ジャンル"
        items={genres}
        activeItem={activeGenre}
        filteredQuestions={questions
          .filter((qa) => activeFolder === null || (qa[2] ?? 0) === activeFolder)
          .map((qa) => qa[3] ?? 0)}
        onChange={(value) => setActiveGenre(value as GenreID | null)}
        onItemCreate={(name) => setGenres([...genres, name])}
        onItemRename={(index, newName) => {
          const newGenres = [...genres];
          newGenres[index] = newName;
          setGenres(newGenres);
        }}
      />

      <SyncDialog ref={syncDialogRef} userID={userID} onUserIDChange={changeUserID} />

      {unlocked && syncStatus !== "idle" && (
        <div
          className={`sync-status ${syncStatus}`}
          role="status"
          aria-label={syncStatus === "syncing" ? "クラウドに保存中" : "クラウドに保存済み"}
        >
          {syncStatus === "syncing" ? <span className="sync-spinner" /> : "✓"}
        </div>
      )}
    </>
  );
}

export default App;
