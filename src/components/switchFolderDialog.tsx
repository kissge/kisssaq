import "./switchFolderDialog.css";

export default function SwitchFolderDialog({
  folders,
  activeFolder,
  onChange,
  onFolderCreate,
}: {
  folders: string[];
  activeFolder: number | null;
  onChange: (folder: number | null) => void;
  onFolderCreate: (folder: string) => void;
}) {
  return (
    <dialog id="switchFolderDialog" closedby="any">
      <div className="toolbar">
        <div>表示するフォルダを選択</div>
        <button
          onClick={() =>
            (document.getElementById("switchFolderDialog") as HTMLDialogElement).close()
          }
        >
          ✕
        </button>
      </div>

      <div className="select">
        <div onClick={() => onChange(null)}>
          <span>全てのフォルダ</span>
          {activeFolder === null && <span>✅</span>}
        </div>
        {folders.map((folder, index) => (
          <div key={folder} onClick={() => onChange(index)}>
            <span>{folder}</span>
            {activeFolder === index && <span>✅</span>}
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          const newFolder = prompt("フォルダ名を入力");
          if (newFolder) {
            onFolderCreate(newFolder);
            onChange(folders.length);
          }
        }}
      >
        新しいフォルダを追加
      </button>
    </dialog>
  );
}
