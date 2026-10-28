import { forwardRef, useState } from "react";
import { toast } from "sonner";
import { apiClient } from "../lib/apiClient";

const SyncDialog = forwardRef<
  HTMLDialogElement,
  {
    userID: string;
    onUserIDChange: (userID: string) => void;
  }
>(({ userID, onUserIDChange }, ref) => {
  const [newUserID, setNewUserID] = useState("");
  const [checking, setChecking] = useState(false);

  async function copyUserID() {
    try {
      await navigator.clipboard.writeText(userID);
      toast.success("ユーザーIDをコピーしました。");
    } catch (error) {
      console.error("Failed to copy user ID.", error);
      toast.error("ユーザーIDのコピーに失敗しました。");
    }
  }

  async function changeUserID() {
    const nextUserID = newUserID.trim();
    if (!nextUserID) {
      toast.error("ユーザーIDを入力してください。");
      return;
    }

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(nextUserID)) {
      toast.error("ユーザーIDの形式が正しくありません。");
      return;
    }

    if (nextUserID === userID) {
      toast.error("現在のユーザーIDと同じです。");
      return;
    }

    setChecking(true);
    try {
      const response = await apiClient.question[":id"].$get({
        param: { id: nextUserID },
      });

      if (response.status === 404) {
        toast.error("指定されたユーザーIDのクラウドデータが見つかりません。");
        return;
      }

      if (!response.ok) {
        toast.error("APIサーバーへの通信に失敗しました。");
        return;
      }

      if (
        !window.confirm(
          "クラウドデータを確認しました。この端末の内部データベースを削除し、取得したデータに切り替えます。続行しますか？",
        )
      ) {
        return;
      }

      onUserIDChange(nextUserID);
      setNewUserID("");
      if (typeof ref !== "function") ref?.current?.close();
      toast.success("クラウドデータを取得しています。");
    } catch (error) {
      console.error("Failed to check remote database.", error);
      toast.error("クラウドデータの確認に失敗しました。");
    } finally {
      setChecking(false);
    }
  }

  return (
    <dialog ref={ref} closedby="closerequest">
      <div className="toolbar">
        <p>クラウド同期 🔒</p>
        <button onClick={() => typeof ref !== "function" && ref?.current?.close()}>✕</button>
      </div>

      <h3>現在のユーザーID</h3>
      <p className="description">
        このデバイスの現在のユーザーIDです。他のデバイスと接続するには、このIDをコピーして共有してください。
      </p>
      <div className="user-id">
        <code>{userID}</code>
        <button onClick={copyUserID}>コピー</button>
      </div>

      <hr />

      <h3>この端末のユーザーIDを変更</h3>
      <p className="description">
        別のデバイスからコピーしてきたユーザーIDに変更すると、そのデバイスとクラウドデータを共有できます。一方のデバイスで問題を追加・編集すると、もう一方のデバイスにも同期されます。
      </p>
      <p className="description warning">⚠️ 両方のデバイスで同時にkissSaqを開かないでください</p>
      <p className="description warning">⚠️ ユーザーIDを変更すると、現在のデータは失われます</p>
      <div className="user-id">
        <input
          value={newUserID}
          onChange={(event) => setNewUserID(event.target.value)}
          placeholder="ユーザーID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)"
        />
        <button disabled={checking} onClick={changeUserID}>
          {checking ? "確認中..." : "このユーザーIDに変更する"}
        </button>
      </div>
    </dialog>
  );
});

export default SyncDialog;
