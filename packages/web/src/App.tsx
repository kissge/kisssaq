import { useState } from "react";
import "./App.css";
import { useLocalStorage } from "./hooks/useLocalStorage";
import EditDialog, { type EditTarget } from "./components/editDialog";
import ImportDialog from "./components/importDialog";
import { json2csv } from "json-2-csv";
import SwitchViewDialog from "./components/switchViewDialog";

function App() {
  const [questions, setQuestions] = useLocalStorage<[string, string, number][]>("q", []);
  const [folders, setFolders] = useLocalStorage("f", ["未分類"]);
  const [checked, setChecked] = useState<number[]>([]);
  const [activeFolder, setActiveFolder] = useLocalStorage<number | null>("activeFolder", null);
  const [currentEditTarget, setCurrentEditTarget] = useState<EditTarget | null>(null);
  const [moveFolderTarget, setMoveFolderTarget] = useState(0);
  const [order, setOrder] = useState<"default" | number[]>("default");
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  function startEdit(id: number) {
    const q = questions[id]?.[0] ?? "";
    const a = questions[id]?.[1] ?? "";
    const f = questions[id]?.[2] ?? activeFolder ?? 0;
    setCurrentEditTarget({ q, a, f, id });
    const dialog = document.getElementById("editDialog") as HTMLDialogElement;
    dialog.showModal();
    setTimeout(() => dialog.querySelector("textarea")!.focus(), 10);
  }

  return (
    <>
      <section id="center">
        {activeFolder === null && questions.length === 0 && (
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
              <li>問題はフォルダ分けすることができます。</li>
              <li>CSV/TSV形式での書き出し・取り込みに対応しています。</li>
            </ul>
          </div>
        )}

        <table
          style={{
            marginBottom: showSearchBox || checked.length > 0 ? "6em" : "3em",
          }}
        >
          <tbody>
            {(Array.isArray(order)
              ? order.map((i) => ({ i, qa: questions[i] }))
              : questions.map((qa, i) => ({ i, qa })).toReversed()
            )
              .filter(
                ({ qa: [q, a, f] }) =>
                  (!searchKeyword || q.includes(searchKeyword) || a.includes(searchKeyword)) &&
                  (activeFolder === null || (f ?? 0) === activeFolder),
              )
              .map(({ i, qa: [q, a] }) => (
                <tr key={i + q}>
                  <th>
                    <input
                      type="checkbox"
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
                    {q
                      ? q
                          .split(/(（.+?）|\(.+?\)|【.+?】|［.+?］)/)
                          .map((p, j) => (j % 2 ? <em key={j}>{p}</em> : p))
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
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
        )}

        {checked.length > 0 && (
          <div className="bulk-toolbar">
            選択中の{checked.length}件を
            <button
              onClick={() => {
                setQuestions(questions.filter((_, j) => !checked.includes(j)));

                if (order !== "default") {
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
                onChange={(e) => setMoveFolderTarget(Number.parseInt(e.target.value))}
              >
                {folders.map((folder, index) => (
                  <option key={folder} value={index}>
                    {folder}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  const newQuestions = questions.map((qa, i) => {
                    if (checked.includes(i)) {
                      qa[2] = moveFolderTarget;
                    }

                    return qa;
                  });
                  setQuestions(newQuestions);
                  setChecked([]);
                }}
              >
                に移動
              </button>
            </div>
          </div>
        )}

        <div className="global-toolbar">
          <img src="https://kissge.github.io/shared/me-mini-512.png" alt="logo" className="logo" />
          kissSaq
          <div className="spacer" />
          <button
            disabled={questions.length === 0}
            onClick={() => {
              setOrder(
                order === "default"
                  ? questions.map((_, i) => i).toSorted(() => Math.random() - 0.5)
                  : "default",
              );
            }}
          >
            {order === "default" ? "登録順" : "ランダム"}
          </button>
          <button
            disabled={questions.length === 0}
            onClick={() => {
              const data = new Blob(
                [json2csv(questions.map(([q, a, f]) => [q, a, f ?? 0])).replace(/.+\n/, "")],
                { type: "text/csv" },
              );
              const url = URL.createObjectURL(data);
              const a = document.createElement("a");
              a.href = url;
              a.download = "kisssaq.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            書出
          </button>
          <button
            onClick={() => {
              const dialog = document.getElementById("importDialog") as HTMLDialogElement;
              dialog.showModal();
            }}
          >
            取込
          </button>
          <button
            onClick={() => {
              const dialog = document.getElementById("switchFolderDialog") as HTMLDialogElement;
              dialog.showModal();
            }}
          >
            ﾌｫﾙﾀﾞ
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
            onClick={() => {
              setQuestions([...questions, ["", "", activeFolder ?? 0]]);

              if (order !== "default") {
                setOrder([...order, questions.length]);
              }

              startEdit(questions.length);
            }}
          >
            追加
          </button>
        </div>
      </section>

      <EditDialog
        currentEditTarget={currentEditTarget}
        folders={folders}
        onChange={setCurrentEditTarget}
        onSave={(value) => {
          const newQuestions = [...questions];
          newQuestions[value.id] = [value.q, value.a, value.f];
          setQuestions(newQuestions);
        }}
      />

      <ImportDialog
        activeFolder={activeFolder}
        onImport={(parsed) => {
          setOrder("default");
          setQuestions([...questions, ...parsed]);
        }}
      />

      <SwitchViewDialog
        id="switchFolderDialog"
        itemKind="フォルダ"
        items={folders}
        activeItem={activeFolder}
        onChange={setActiveFolder}
        onItemCreate={(name) => setFolders([...folders, name])}
        onItemRename={(index, newName) => {
          const newFolders = [...folders];
          newFolders[index] = newName;
          setFolders(newFolders);
        }}
      />
    </>
  );
}

export default App;
