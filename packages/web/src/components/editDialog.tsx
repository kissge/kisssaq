import "./editDialog.css";

export interface EditTarget {
  id: number;
  q: string;
  a: string;
  f: number;
  g: number;
}

export default function EditDialog({
  currentEditTarget,
  folders,
  genres,
  onChange,
  onSave,
}: {
  currentEditTarget: EditTarget | null;
  folders: string[];
  genres: string[];
  onChange: (value: EditTarget) => void;
  onSave: (value: EditTarget) => void;
}) {
  return (
    <dialog id="editDialog" closedby="closerequest">
      {currentEditTarget && (
        <>
          <div className="toolbar">
            <div>
              {currentEditTarget.q.length} (
              {currentEditTarget.q.replace(/(（.+?）|\(.+?\)|【.+?】|［.+?］)/g, "").length})
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
            rows={5}
            placeholder="日本の首都は？"
          />
          <textarea
            value={currentEditTarget.a}
            onChange={(e) => onChange({ ...currentEditTarget, a: e.target.value })}
            rows={3}
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
            <select
              value={currentEditTarget.g}
              onChange={(e) =>
                onChange({ ...currentEditTarget, g: Number.parseInt(e.target.value) })
              }
            >
              {genres.map((genre, index) => (
                <option key={genre} value={index}>
                  {genre}
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
