import "./editDialog.css";

export interface EditTarget {
  id: number;
  q: string;
  a: string;
  f: number;
}

export default function EditDialog({
  currentEditTarget,
  folders,
  onChange,
  onSave,
}: {
  currentEditTarget: EditTarget | null;
  folders: string[];
  onChange: (value: EditTarget) => void;
  onSave: (value: EditTarget) => void;
}) {
  return (
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
            onChange={(e) => onChange({ ...currentEditTarget, q: e.target.value })}
            rows={4}
            placeholder="日本の首都は？"
          />
          <textarea
            value={currentEditTarget.a}
            onChange={(e) => onChange({ ...currentEditTarget, a: e.target.value })}
            rows={2}
            placeholder="東京（とうきょう）"
          />
          <div className="flex">
            <select
              value={currentEditTarget.f}
              onChange={(e) =>
                onChange({ ...currentEditTarget, f: Number.parseInt(e.target.value) })
              }
            >
              {folders.map((folder, index) => (
                <option key={folder} value={index}>
                  {folder}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                onSave(currentEditTarget);
                (document.getElementById("editDialog") as HTMLDialogElement).close();
              }}
            >
              保存
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}
