import { csv2json } from "json-2-csv";
import { useState } from "react";

export default function ImportDialog({ onImport }: { onImport: (parsed: string[][]) => void }) {
  const [raw, setRaw] = useState("");

  function parseCSV(raw: string) {
    const tabCount = raw.match(/\t/g)?.length ?? 0;
    const commaCount = raw.match(/,/g)?.length ?? 0;
    const delimiter = tabCount > commaCount ? "\t" : ",";
    return (
      csv2json(raw, { delimiter: { field: delimiter }, headerFields: ["q", "a"] }) as {
        q: string;
        a: string;
      }[]
    ).map(({ q, a }) => [q, a]);
  }

  return (
    <dialog id="importDialog" closedby="any">
      ここにCSVかTSVを貼ってください。
      <textarea
        rows={4}
        placeholder="日本の首都は？,東京（とうきょう）
中国の首都は？,北京（ペキン）"
        onChange={(e) => setRaw(e.target.value)}
      />
      <button
        onClick={() => {
          const parsed = parseCSV(raw);
          onImport(parsed);
          (document.getElementById("importDialog") as HTMLDialogElement).close();
        }}
      >
        取り込み
      </button>
    </dialog>
  );
}
