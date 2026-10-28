import { json2csv } from "json-2-csv";
import { forwardRef, useState } from "react";
import type { Row } from "../lib/types";

type ExportRange = "all" | "visible" | "checked";
type ExportColumn = "folder" | "genre" | "comment";

const ExportDialog = forwardRef<
  HTMLDialogElement,
  {
    questions: Row[];
    visibleQuestions: Row[];
    checkedQuestions: Row[];
    folders: string[];
    genres: string[];
  }
>(({ questions, visibleQuestions, checkedQuestions, folders, genres }, ref) => {
  const [range, setRange] = useState<ExportRange>("visible");
  const [includeHeader, setIncludeHeader] = useState(false);
  const [columns, setColumns] = useState<Record<ExportColumn, boolean>>({
    folder: true,
    genre: true,
    comment: true,
  });

  function toggleColumn(column: ExportColumn) {
    setColumns((current) => ({ ...current, [column]: !current[column] }));
  }

  function exportCSV() {
    const rows =
      range === "all" ? questions : range === "visible" ? visibleQuestions : checkedQuestions;
    const records = rows.map(([q, a, f, g, comment]) => ({
      問題: q,
      解答: a,
      ...(columns.folder ? { フォルダ名: folders[f ?? 0] } : {}),
      ...(columns.genre ? { ジャンル名: genres[g ?? 0] } : {}),
      ...(columns.comment ? { コメント: comment ?? "" } : {}),
    }));
    const csv = json2csv(records);
    const data = new Blob([includeHeader ? csv : csv.replace(/.+\n/, "")], { type: "text/csv" });
    const url = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = "kissSaq.csv";
    link.click();
    URL.revokeObjectURL(url);
    if (typeof ref !== "function") ref?.current?.close();
  }

  return (
    <dialog ref={ref} closedby="closerequest">
      <div className="toolbar">
        <div>CSV出力</div>
        <button onClick={() => typeof ref !== "function" && ref?.current?.close()}>✕</button>
      </div>

      <fieldset>
        <legend>出力範囲</legend>
        <label>
          <input
            type="radio"
            name="export-range"
            checked={range === "all"}
            onChange={() => setRange("all")}
          />
          データベースにあるすべての問題（{questions.length.toLocaleString()}件）
        </label>
        <label>
          <input
            type="radio"
            name="export-range"
            checked={range === "visible"}
            onChange={() => setRange("visible")}
          />
          現在表示中の問題（{visibleQuestions.length.toLocaleString()}件）
        </label>
        <label>
          <input
            type="radio"
            name="export-range"
            checked={range === "checked"}
            disabled={checkedQuestions.length === 0}
            onChange={() => setRange("checked")}
          />
          現在チェックを入れている問題（{checkedQuestions.length.toLocaleString()}件）
        </label>
      </fieldset>

      <fieldset>
        <legend>ヘッダー</legend>
        <label>
          <input
            type="radio"
            name="export-header"
            checked={!includeHeader}
            onChange={() => setIncludeHeader(false)}
          />
          なし
        </label>
        <label>
          <input
            type="radio"
            name="export-header"
            checked={includeHeader}
            onChange={() => setIncludeHeader(true)}
          />
          あり
        </label>
      </fieldset>

      <fieldset>
        <legend>カラム</legend>
        <label>
          <input type="checkbox" checked readOnly />
          問題（必須）
        </label>
        <label>
          <input type="checkbox" checked readOnly />
          解答（必須）
        </label>
        <label>
          <input type="checkbox" checked={columns.folder} onChange={() => toggleColumn("folder")} />
          フォルダ名
        </label>
        <label>
          <input type="checkbox" checked={columns.genre} onChange={() => toggleColumn("genre")} />
          ジャンル名
        </label>
        <label>
          <input
            type="checkbox"
            checked={columns.comment}
            onChange={() => toggleColumn("comment")}
          />
          コメント
        </label>
      </fieldset>

      <div style={{ textAlign: "right" }}>
        <button onClick={exportCSV} style={{ padding: "0 1em" }}>
          出力
        </button>
      </div>
    </dialog>
  );
});

export default ExportDialog;
