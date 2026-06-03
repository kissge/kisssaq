import { useState } from "react";
import "./App.css";
import { useLocalStorage } from "./hooks/useLocalStorage";
import EditDialog, { type EditTarget } from "./components/editDialog";
import ImportDialog from "./components/importDialog";

function App() {
  const [questions, setQuestions] = useLocalStorage<string[][]>("q", []);
  const [checked, setChecked] = useState<number[]>([]);
  const [currentEditTarget, setCurrentEditTarget] = useState<EditTarget | null>(null);
  const [order, setOrder] = useState<"default" | number[]>("default");

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
            {(Array.isArray(order)
              ? order.map((i) => ({ i, qa: questions[i] }))
              : questions.map((qa, i) => ({ i, qa }))
            ).map(({ i, qa: [q, a] }) => (
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
            onClick={() => {
              const dialog = document.getElementById("importDialog") as HTMLDialogElement;
              dialog.showModal();
            }}
          >
            取込
          </button>
          <button
            onClick={() => {
              setQuestions([...questions, ["", ""]]);

              if (order !== "default") {
                setOrder([...order, questions.length]);
              }

              startEdit(questions.length);
            }}
          >
            追加
          </button>
          <button
            disabled={checked.length === 0}
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
        </div>
      </section>

      <EditDialog
        currentEditTarget={currentEditTarget}
        onChange={setCurrentEditTarget}
        onSave={(value) => {
          const newQuestions = [...questions];
          newQuestions[value.id] = [value.q, value.a];
          setQuestions(newQuestions);
        }}
      />

      <ImportDialog
        onImport={(parsed) => {
          setOrder("default");
          setQuestions([...questions, ...parsed]);
        }}
      />
    </>
  );
}

export default App;
