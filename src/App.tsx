import { useState } from "react";
import "./App.css";
import { useLocalStorage } from "./hooks/useLocalStorage";

function App() {
  const [questions, setQuestions] = useLocalStorage<string[][]>("q", []);
  const [checked, setChecked] = useState<number[]>([]);
  const [currentEditTarget, setCurrentEditTarget] = useState<{
    q: string;
    a: string;
    id: number;
  } | null>(null);

  function startEdit(id: number) {
    const q = questions[id]?.[0] ?? "";
    const a = questions[id]?.[1] ?? "";
    setCurrentEditTarget({ q, a, id });
    const dialog = document.getElementById("editDialog") as HTMLDialogElement;
    dialog.showModal();
    setTimeout(() => dialog.querySelector("textarea")!.focus(), 10);
  }

  return (
    <>
      <section id="center">
        <table>
          <tbody>
            {questions.map(([q, a], i) => (
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

        <div className="global-toolbar">
          kissSaq
          <div className="spacer" />
          <button
            onClick={() => {
              setQuestions([...questions, ["", ""]]);
              startEdit(questions.length);
            }}
          >
            追加
          </button>
          <button
            disabled={checked.length === 0}
            onClick={() => {
              setQuestions(questions.filter((_, j) => !checked.includes(j)));
              setChecked([]);
            }}
          >
            削除
          </button>
        </div>
      </section>

      <dialog id="editDialog" closedby="any">
        {currentEditTarget && (
          <>
            <div className="toolbar">
              <div>
                {currentEditTarget.q.length} (
                {currentEditTarget.q.replace(/\s*\(.+?\)\s*|（.+）/g, "").length})
              </div>
              <button
                onClick={() => (document.getElementById("editDialog") as HTMLDialogElement).close()}
              >
                ✕
              </button>
            </div>
            <textarea
              value={currentEditTarget.q}
              onChange={(e) => setCurrentEditTarget({ ...currentEditTarget, q: e.target.value })}
              rows={4}
              placeholder="日本の首都は？"
            />
            <textarea
              value={currentEditTarget.a}
              onChange={(e) => setCurrentEditTarget({ ...currentEditTarget, a: e.target.value })}
              rows={2}
              placeholder="東京（とうきょう）"
            />
            <button
              onClick={() => {
                const newQuestions = [...questions];
                newQuestions[currentEditTarget.id] = [currentEditTarget.q, currentEditTarget.a];
                setQuestions(newQuestions);
                (document.getElementById("editDialog") as HTMLDialogElement).close();
              }}
            >
              保存
            </button>
          </>
        )}
      </dialog>
    </>
  );
}

export default App;
