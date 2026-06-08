import "./switchViewDialog.css";

export default function SwitchFolderDialog({
  id,
  itemKind,
  items,
  activeItem,
  onChange,
  onItemCreate,
  onItemRename,
}: {
  id: string;
  itemKind: string;
  items: string[];
  activeItem: number | null;
  onChange: (item: number | null) => void;
  onItemCreate: (item: string) => void;
  onItemRename: (index: number, newName: string) => void;
}) {
  return (
    <dialog id={id} closedby="closerequest">
      <div className="toolbar">
        <div>表示する{itemKind}を選択</div>
        <button onClick={() => (document.getElementById(id) as HTMLDialogElement).close()}>
          ✕
        </button>
      </div>

      <div className="select">
        <div onClick={() => onChange(null)}>
          <span>全ての{itemKind}</span>
          {activeItem === null && <span>✅</span>}
        </div>
        {items.map((item, index) => (
          <div key={item} onClick={() => onChange(index)}>
            <span>{item}</span>
            {activeItem === index && <span>✅</span>}
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          const newFolder = prompt(`新しい${itemKind}名を入力`);
          if (newFolder) {
            onItemCreate(newFolder);
            onChange(items.length);
          }
        }}
      >
        新しい{itemKind}を追加
      </button>
      <button
        disabled={activeItem === null}
        onClick={() => {
          const newName = prompt(`新しい${itemKind}名を入力`, items[activeItem!]);
          if (newName) {
            onItemRename(activeItem!, newName);
          }
        }}
      >
        {itemKind}名を変更
      </button>
    </dialog>
  );
}
