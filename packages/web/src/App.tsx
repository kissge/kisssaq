import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { authorURL, wishlistURL } from "kissunlocklib";
import "./App.css";
import { useLocalStorage } from "./hooks/useLocalStorage";
import EditDialog, { type EditTarget } from "./components/editDialog";
import ExportDialog from "./components/exportDialog";
import SwitchViewDialog from "./components/switchViewDialog";
import UnlockDialog from "./components/unlockDialog";
import SyncDialog from "./components/syncDialog";
import SettingsDialog from "./components/settingsDialog";
import { useDatabase } from "./hooks/useDatabase";
import { useUnlocked } from "./hooks/useUnlocked";
import {
  FlagCount,
  type CommentText,
  type Config,
  type FolderID,
  type GenreID,
  type Row,
} from "./lib/types";

function isLong(text: string, threshold: number = 10): boolean {
  const length = text.length + [...text].filter((c) => c.charCodeAt(0) > 255).length;
  return length > threshold;
}

function App() {
  const { unlocked, refresh } = useUnlocked();
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
  const [order, setOrder] = useState<"default" | "genre" | "flag" | number[]>("default");
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [config, setConfig] = useLocalStorage<Config>("kissSaqConfig", {
    questionLengthThreshold: 60,
    showGenre: false,
    showComment: true,
  });
  const [isClient, setIsClient] = useState(false);
  const [isCSVImportDialogOpen, setIsCSVImportDialogOpen] = useState(false);
  const editDialogRef = useRef<HTMLDialogElement>(null);
  const switchFolderDialogRef = useRef<HTMLDialogElement>(null);
  const switchGenreDialogRef = useRef<HTMLDialogElement>(null);
  const unlockDialogRef = useRef<HTMLDialogElement>(null);
  const syncDialogRef = useRef<HTMLDialogElement>(null);
  const exportDialogRef = useRef<HTMLDialogElement>(null);
  const settingsDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    setIsClient(true);
    import("kisscsvimport");
  }, []);

  if (loading) {
    return null;
  }

  function startEdit(id: number, isNew: boolean = false) {
    const q = questions[id]?.[0] ?? "";
    const a = questions[id]?.[1] ?? "";
    const f = questions[id]?.[2] ?? activeFolder ?? (0 as FolderID);
    const g = questions[id]?.[3] ?? activeGenre ?? (0 as GenreID);
    const c = questions[id]?.[4] ?? ("" as CommentText);
    const flag = questions[id]?.[5] ?? null;
    setCurrentEditTarget({ q, a, f, g, c, flag, id, modified: false, isNew });
    editDialogRef.current?.showModal();
  }

  const filteredQuestions = (() => {
    if (Array.isArray(order)) {
      return order.map((i) => ({ i, qa: questions[i] }));
    } else {
      switch (order) {
        case "default":
          return questions.map((qa, i) => ({ i, qa })).toReversed();

        case "genre":
          return questions
            .map((qa, i) => ({ i, qa }))
            .toReversed()
            .toSorted((a, b) => (a.qa[3] ?? 0) - (b.qa[3] ?? 0));

        case "flag":
          return questions
            .map((qa, i) => ({ i, qa }))
            .toReversed()
            .toSorted((a, b) => (b.qa[5] ?? -1) - (a.qa[5] ?? -1));

        default:
          throw new Error(order satisfies never);
      }
    }
  })().filter(
    ({ qa: [q, a, f, g, c] }) =>
      (!searchKeyword ||
        q.includes(searchKeyword) ||
        a.includes(searchKeyword) ||
        c?.includes(searchKeyword)) &&
      (activeFolder === null || (f ?? 0) === activeFolder) &&
      (activeGenre === null || (g ?? 0) === activeGenre),
  );

  function splitQuestion(
    q: string,
    limit: number = config.questionLengthThreshold,
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
              <span>自作</span>
              <span>問題</span>
              <span>管理</span>
              <span>アプリ</span>
              <ruby>
                kissSaq
                <rt>きすさく</rt>
              </ruby>
            </h1>

            <ul>
              <li>まずは右下の「追加」ボタンをクリックして問題を登録してください。</li>
              <li>問題はフォルダ分けができます。</li>
              <li>CSV/TSV形式での書き出し・取り込みに対応しています。</li>
              <li>
                データベースはクラウドに同期し、複数のデバイス間（PCとスマートフォンなど）で共有することができます。
              </li>
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
        ) : (
          <p className="table-count">
            {filteredQuestions.length}件表示（全{questions.length}件）
          </p>
        )}

        <table
          style={{
            marginBottom: showSearchBox || checked.length > 0 ? "5em" : "3em",
          }}
        >
          <tbody>
            {filteredQuestions.map(({ i, qa: [q, a, , , c, f] }) => (
              <tr
                key={i + q}
                className={f != null ? "flagged" : ""}
                style={
                  { "--hue": (((f ?? 0) + 2) * (360 / FlagCount)) % 360 } as React.CSSProperties
                }
              >
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
                  {(order === "genre" || config.showGenre) && (
                    <span className="genre-label">{genres[questions[i][3] ?? 0]}</span>
                  )}
                  {q
                    ? splitQuestion(q).map(({ type, text }, i) => (
                        <span key={text + i} className={type}>
                          {text}
                        </span>
                      ))
                    : "ここをクリックして編集"}
                  {config.showComment && c && <div className="comment">📝 {c}</div>}
                </td>
                <td onClick={() => startEdit(i)}>{a}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={"search-toolbar" + (showSearchBox ? " shown" : "")}>
          <input
            placeholder="検索キーワードを入力"
            type="text"
            value={searchKeyword}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setSearchKeyword("");
                setShowSearchBox(false);
              }
            }}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <button
            style={{ border: "none" }}
            onClick={() => {
              setSearchKeyword("");
              setShowSearchBox(false);
            }}
          >
            ✕
          </button>
        </div>

        <div className={"bulk-toolbar" + (checked.length > 0 ? " shown" : "")}>
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
          <div>{checked.length}件を</div>
          <button
            onClick={() => {
              if (!confirm(`${checked.length}件の問題を削除します。よろしいですか？`)) {
                return;
              }

              setQuestions(questions.filter((_, j) => !checked.includes(j)));

              if (Array.isArray(order)) {
                setOrder(order.filter((i) => !checked.includes(i)));
              }

              setChecked([]);
            }}
          >
            削除
          </button>
          <select
            value={-1}
            onChange={(e) => {
              const target = (() => {
                if (e.target.value === "new") {
                  const newFolderName = prompt("新しいフォルダ名を入力してください。");
                  if (!newFolderName) {
                    return;
                  }

                  setFolders([...folders, newFolderName]);

                  return folders.length as FolderID;
                } else {
                  return Number.parseInt(e.target.value) as FolderID;
                }
              })();

              if (target === undefined) {
                return;
              }

              const newQuestions = questions.map((qa, i) => {
                if (checked.includes(i)) {
                  qa[2] = target;
                }

                return qa;
              });
              setQuestions(newQuestions);
              setChecked([]);
            }}
          >
            <option value={-1}>フォルダ移動</option>
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
            <option value="new">（新規フォルダ作成）</option>
          </select>
          <select
            value={-1}
            onChange={(e) => {
              const target = (() => {
                if (e.target.value === "new") {
                  const newGenreName = prompt("新しいジャンル名を入力してください。");
                  if (!newGenreName) {
                    return;
                  }

                  setGenres([...genres, newGenreName]);

                  return genres.length as GenreID;
                } else {
                  return Number.parseInt(e.target.value) as GenreID;
                }
              })();

              if (target === undefined) {
                return;
              }

              const newQuestions = questions.map((qa, i) => {
                if (checked.includes(i)) {
                  qa[3] = target;
                }

                return qa;
              });
              setQuestions(newQuestions);
              setChecked([]);
            }}
          >
            <option value={-1}>ジャンル変更</option>
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
            <option value="new">（新規ジャンル作成）</option>
          </select>
        </div>

        <div className={"global-toolbar " + (unlocked ? "unlocked" : "")}>
          <div>
            <button
              disabled={questions.length === 0}
              onClick={() => {
                if (Array.isArray(order)) {
                  return setOrder("default");
                }

                switch (order) {
                  case "default":
                    return setOrder("genre");
                  case "genre":
                    return setOrder("flag");
                  case "flag":
                    return setOrder(questions.map((_, i) => i).toSorted(() => Math.random() - 0.5));
                  default:
                    order satisfies never;
                }
              }}
            >
              {Array.isArray(order)
                ? "ランダム"
                : { default: "登録順", genre: "ジャンル順", flag: "フラグ順" }[order]}
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
                  ["", "", activeFolder ?? 0, activeGenre ?? 0, "", null] as Row,
                ]);

                if (Array.isArray(order)) {
                  setOrder([...order, questions.length]);
                }

                startEdit(questions.length, true);
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
        <button onClick={() => settingsDialogRef.current?.showModal()}>設定</button>
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
        <button onClick={() => setIsCSVImportDialogOpen(true)}>CSV取り込み</button>
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
          newQuestions[value.id] = [value.q, value.a, value.f, value.g, value.c, value.flag];
          setQuestions(newQuestions);
        }}
        onCancelAdd={(id) => {
          const newQuestions = [...questions];
          newQuestions.splice(id, 1);
          setQuestions(newQuestions);

          if (Array.isArray(order)) {
            setOrder(order.filter((i) => i !== id));
          }
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

      <UnlockDialog ref={unlockDialogRef} onUnlock={refresh} />

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
        onItemRemove={(index) => {
          const newFolders = [...folders];
          newFolders.splice(index, 1);
          setFolders(newFolders);

          const newQuestions = questions.map((qa) => {
            if ((qa[2] ?? 0) === index) {
              qa[2] = 0 as FolderID;
            } else if ((qa[2] ?? 0) > index) {
              qa[2] = ((qa[2] ?? 0) - 1) as FolderID;
            }

            return qa;
          });
          setQuestions(newQuestions);

          if (activeFolder === index) {
            setActiveFolder(null);
          } else if ((activeFolder ?? 0) > index) {
            setActiveFolder(((activeFolder ?? 0) - 1) as FolderID);
          }

          if (Array.isArray(order)) {
            setOrder(order.filter((i) => (questions[i]?.[2] ?? 0) !== index));
          }
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
        onItemRemove={(index) => {
          const newGenres = [...genres];
          newGenres.splice(index, 1);
          setGenres(newGenres);

          const newQuestions = questions.map((qa) => {
            if ((qa[3] ?? 0) === index) {
              qa[3] = 0 as GenreID;
            } else if ((qa[3] ?? 0) > index) {
              qa[3] = ((qa[3] ?? 0) - 1) as GenreID;
            }

            return qa;
          });
          setQuestions(newQuestions);

          if (activeGenre === index) {
            setActiveGenre(null);
          } else if ((activeGenre ?? 0) > index) {
            setActiveGenre(((activeGenre ?? 0) - 1) as GenreID);
          }

          if (Array.isArray(order)) {
            setOrder(order.filter((i) => (questions[i]?.[3] ?? 0) !== index));
          }
        }}
      />

      <SyncDialog ref={syncDialogRef} userID={userID} onUserIDChange={changeUserID} />

      <SettingsDialog
        ref={settingsDialogRef}
        config={config}
        onChange={(config) => setConfig({ ...config })}
      />

      {isClient && (
        <csv-import-dialog
          open={isCSVImportDialogOpen}
          onimport={({ detail }) => {
            setOrder("default");
            setQuestions([
              ...questions,
              ...detail.map(
                ({ question, answer, comment }) =>
                  [question, answer, activeFolder ?? 0, activeGenre ?? 0, comment, null] as Row,
              ),
            ]);
            setIsCSVImportDialogOpen(false);
          }}
          onclose={() => setIsCSVImportDialogOpen(false)}
        />
      )}

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
