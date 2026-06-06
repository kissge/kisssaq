import { csv2json } from "json-2-csv";
import { useState } from "react";

export default function ImportDialog({
  activeFolder,
  onImport,
}: {
  activeFolder: number | null;
  onImport: (parsed: [string, string, number][]) => void;
}) {
  const [raw, setRaw] = useState("");

  function parseCSV(raw: string) {
    const tabCount = raw.match(/\t/g)?.length ?? 0;
    const commaCount = raw.match(/,/g)?.length ?? 0;
    const delimiter = tabCount > commaCount ? "\t" : ",";
    return csv2json(raw, { delimiter: { field: delimiter }, headerFields: ["q", "a"] }) as {
      q: unknown;
      a: unknown;
    }[];
  }

  return (
    <dialog id="importDialog" closedby="closerequest">
      <div className="toolbar">
        <div>ここにCSVかTSVを貼ってください。</div>
        <button
          onClick={() => (document.getElementById("importDialog") as HTMLDialogElement).close()}
        >
          ✕
        </button>
      </div>
      <textarea
        rows={4}
        placeholder="日本の首都は？,東京（とうきょう）
中国の首都は？,北京（ペキン）"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
      />
      <button
        disabled={!raw.trim()}
        onClick={() => {
          const parsed = parseCSV(raw)
            .map(({ q, a }) => {
              return [String(q ?? ""), String(a ?? ""), activeFolder ?? 0] as [
                string,
                string,
                number,
              ];
            })
            .toReversed();
          onImport(parsed);
          setRaw("");
          (document.getElementById("importDialog") as HTMLDialogElement).close();
        }}
      >
        取り込み
      </button>
    </dialog>
  );
}
