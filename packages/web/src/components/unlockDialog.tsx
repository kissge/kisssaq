import { isUnlocked, setPassword, wishlistURL, authorURL } from "kissunlocklib";
import { useState } from "react";
import { toast } from "sonner";
import { useUnlocked } from "../hooks/useUnlocked";

export default function UnlockDialog() {
  const [passwordInput, setPasswordInput] = useState("");
  const { unlocked, loading, refresh } = useUnlocked();

  return (
    <dialog id="unlockDialog" closedby="closerequest">
      <div className="toolbar">
        <div>パスワードを入力するといくつかの追加機能がアンロックされます。</div>
        <button
          onClick={() => (document.getElementById("unlockDialog") as HTMLDialogElement).close()}
        >
          ✕
        </button>
      </div>

      <details>
        <summary>利用できる機能（今日現在。今後増減する可能性があります）</summary>
        <ul>
          <li>データベースのクラウド同期</li>
        </ul>
      </details>

      <p style={{ fontWeight: "bold" }}>
        一度アンロックすると、kissqとkissSaqの両方で追加機能が利用できるようになります。 👈
        とてもすごい
      </p>

      <p>
        パスワードを入手するには、
        <a href={wishlistURL} target="_blank">
          こちら
        </a>
        から何らかのアイテムを作者に送り付けたのち、
        <a href={authorURL} target="_blank">
          作者
        </a>
        にXのDMで問い合わせてください。
      </p>

      <div className="password-wrapper">
        <input
          type="password"
          placeholder="パスワード"
          disabled={unlocked || loading}
          onChange={(e) => setPasswordInput(e.target.value)}
        />
        <button
          onClick={async () => {
            try {
              await setPassword(passwordInput);
              if (await isUnlocked()) {
                await refresh();
                toast.success("アンロックされました。");
                (document.getElementById("unlockDialog") as HTMLDialogElement).close();
              } else {
                toast.error("パスワードが違います。");
              }
            } catch (error) {
              console.error("Failed to unlock.", error);
              toast.error("アンロック処理に失敗しました。");
            }
          }}
          disabled={unlocked || loading}
        >
          アンロック
        </button>
        {unlocked && <p>アンロック済みです。</p>}
      </div>
    </dialog>
  );
}
