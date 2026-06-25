import "./switchViewDialog.css";

export default function SwitchFolderDialog({
  id,
  itemKind,
  items,
  activeItem,
  filteredQuestions,
  onChange,
  onItemCreate,
  onItemRename,
}: {
  id: string;
  itemKind: string;
  items: string[];
  activeItem: number | null;
  filteredQuestions: number[];
  onChange: (item: number | null) => void;
  onItemCreate: (item: string) => void;
  onItemRename: (index: number, newName: string) => void;
}) {
  const itemCount = items.map(
    (_, index) => filteredQuestions.filter((item) => item === index).length,
  );

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
          <span>
            全ての{itemKind} ({filteredQuestions.length})
          </span>
          {activeItem === null && <span>✅</span>}
        </div>
        {items
          .map((item, index) => ({ item, index }))
          .toSorted((a, b) =>
            a.index === 0 ? -1 : b.index === 0 ? 1 : b.item.localeCompare(a.item),
          )
          .map(({ item, index }) => (
            <div key={item} onClick={() => onChange(index)}>
              <span>
                {item} ({itemCount[index]})
              </span>
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
