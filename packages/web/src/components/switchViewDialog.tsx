import "./switchViewDialog.css";

import { forwardRef } from "react";

import type { FolderID, GenreID } from "../lib/types";

type SwitchDialogProps = {
  id: string;
  itemKind: string;
  items: string[];
  activeItem: number | null;
  filteredQuestions: number[];
  onChange: (item: FolderID | GenreID | null) => void;
  onItemCreate: (item: string) => void;
  onItemRename: (index: number, newName: string) => void;
  onItemRemove: (index: number) => void;
};

const SwitchFolderDialog = forwardRef<HTMLDialogElement, SwitchDialogProps>(
  function SwitchFolderDialog(
    {
      id,
      itemKind,
      items,
      activeItem,
      filteredQuestions,
      onChange,
      onItemCreate,
      onItemRename,
      onItemRemove,
    },
    ref,
  ) {
    const itemCount = items.map(
      (_, index) => filteredQuestions.filter((item) => item === index).length,
    );

    return (
      <dialog ref={ref} id={id} closedby="any" onClick={(event) => event.stopPropagation()}>
        <div className="toolbar">
          <div>表示する{itemKind}を選択</div>
          <button onClick={() => typeof ref !== "function" && ref?.current?.close()}>✕</button>
        </div>
        <div className="select">
          <div className={activeItem === null ? "active" : ""} onClick={() => onChange(null)}>
            <span>
              全ての{itemKind} ({filteredQuestions.length})
            </span>
          </div>
          {items
            .map((item, index) => ({ item, index }))
            .toSorted((a, b) =>
              a.index === 0 ? -1 : b.index === 0 ? 1 : b.item.localeCompare(a.item),
            )
            .map(({ item, index }) => (
              <div
                key={item}
                className={activeItem === index ? "active" : ""}
                onClick={() => onChange(index as FolderID | GenreID)}
              >
                {item} ({itemCount[index]})
              </div>
            ))}
        </div>
        <div className="actions">
          <button
            onClick={() => {
              const newFolder = prompt(`新しい${itemKind}名を入力`);
              if (newFolder) {
                onItemCreate(newFolder);
                onChange(items.length as FolderID | GenreID);
              }
            }}
          >
            新規追加
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
            名前を変更
          </button>
          <button
            disabled={activeItem === null}
            onClick={() => {
              if (
                confirm(
                  `本当に${items[activeItem!]}を削除しますか？${itemCount[activeItem!] > 0 ? "\n" + items[activeItem!] + "に含まれる" + itemCount[activeItem!] + "件の質問は未分類に移動されます。" : ""}`,
                )
              ) {
                onItemRemove(activeItem!);
              }
            }}
          >
            削除
          </button>
        </div>
      </dialog>
    );
  },
);

export default SwitchFolderDialog;
