import { useState } from "react";

export default function ImportDialog({ onImport }: { onImport: (parsed: string[][]) => void }) {
  const [raw, setRaw] = useState("");

  function parseCSV(raw: string, sep: string) {
    return raw.split(/[\r\n]+/).map((row) => row.split(sep));
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
          const parsed = parseCSV(raw, raw.includes("\t") ? "\t" : ",");
          onImport(parsed);
          (document.getElementById("importDialog") as HTMLDialogElement).close();
        }}
      >
        取り込み
      </button>
    </dialog>
  );
}
