import { csv2json } from "json-2-csv";
import { forwardRef, useRef, useState } from "react";

const ImportDialog = forwardRef<
  HTMLDialogElement,
  {
    activeFolder: number | null;
    activeGenre: number | null;
    onImport: (parsed: [string, string, number, number, string][]) => void;
  }
>(({ activeFolder, activeGenre, onImport }, ref) => {
  const [raw, setRaw] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function parseCSV(raw: string) {
    const tabCount = raw.match(/\t/g)?.length ?? 0;
    const commaCount = raw.match(/,/g)?.length ?? 0;
    const delimiter = tabCount > commaCount ? "\t" : ",";
    return csv2json(raw, { delimiter: { field: delimiter }, headerFields: ["q", "a", "c"] }) as {
      q: unknown;
      a: unknown;
      c: unknown;
    }[];
  }

  return (
    <dialog ref={ref} closedby="any" onClick={(event) => event.stopPropagation()}>
      <div className="toolbar">
        <div>CSV取り込み</div>
        <button onClick={() => typeof ref !== "function" && ref?.current?.close()}>✕</button>
      </div>

      <p style={{ marginBottom: "0.5em" }}>
        <button className="file-open-btn" onClick={() => fileInputRef.current?.click()}>
          ファイルを開く
        </button>
        か、この下にCSVかTSVを貼ってください。
      </p>

      <textarea
        rows={4}
        placeholder="日本の首都は？,東京（とうきょう）,かんたん
中国の首都は？,北京（ペキン）,意外と忘れがち"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
      />

      <p>左から順に、問題、解答、コメントの3列のデータをヘッダーなしで入力して下さい。</p>

      <button
        disabled={!raw.trim()}
        className="primary-btn"
        onClick={() => {
          const parsed = parseCSV(raw)
            .map<[string, string, number, number, string]>(({ q, a, c }) => {
              return [
                String(q ?? ""),
                String(a ?? ""),
                activeFolder ?? 0,
                activeGenre ?? 0,
                String(c ?? ""),
              ];
            })
            .toReversed();
          onImport(parsed);
          setRaw("");
          if (typeof ref !== "function") ref?.current?.close();
        }}
      >
        取り込み
      </button>

      <input
        type="file"
        accept=".csv,.tsv"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (event) => {
            const text = event.target?.result;
            if (typeof text === "string") setRaw(text);
          };
          reader.readAsText(file, "UTF-8");
        }}
      />
    </dialog>
  );
});

export default ImportDialog;
