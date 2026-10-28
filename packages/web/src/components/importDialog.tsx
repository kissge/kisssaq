import { csv2json } from "json-2-csv";
import { forwardRef, useState } from "react";

const ImportDialog = forwardRef<
  HTMLDialogElement,
  {
    activeFolder: number | null;
    activeGenre: number | null;
    onImport: (parsed: [string, string, number, number, string][]) => void;
  }
>(({ activeFolder, activeGenre, onImport }, ref) => {
  const [raw, setRaw] = useState("");

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
    <dialog ref={ref} closedby="closerequest">
      <div className="toolbar">
        <div>ここにCSVかTSVを貼ってください。</div>
        <button onClick={() => typeof ref !== "function" && ref?.current?.close()}>✕</button>
      </div>
      <textarea
        rows={4}
        placeholder="日本の首都は？,東京（とうきょう）,かんたん
中国の首都は？,北京（ペキン）,意外と忘れがち"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
      />
      <button
        disabled={!raw.trim()}
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
    </dialog>
  );
});

export default ImportDialog;
