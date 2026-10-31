import { forwardRef, useEffect, useState } from "react";
import "./settingsDialog.css";

const SettingsDialog = forwardRef<
  HTMLDialogElement,
  { questionLengthLimit: number; onChange: (value: number) => void }
>(function SettingsDialog({ questionLengthLimit, onChange }, ref) {
  const [draftQuestionLengthLimit, setDraftQuestionLengthLimit] = useState(
    String(questionLengthLimit),
  );

  useEffect(() => {
    setDraftQuestionLengthLimit(String(questionLengthLimit));
  }, [questionLengthLimit]);

  const parsedQuestionLengthLimit = Number.parseInt(draftQuestionLengthLimit, 10);
  const canSave = Number.isInteger(parsedQuestionLengthLimit) && parsedQuestionLengthLimit > 0;

  return (
    <dialog
      ref={ref}
      id="settingsDialog"
      closedby="any"
      onClick={(event) => event.stopPropagation()}
      onClose={() => setDraftQuestionLengthLimit(String(questionLengthLimit))}
    >
      <div className="toolbar">
        <h3>設定</h3>
        <button onClick={() => typeof ref !== "function" && ref?.current?.close()}>✕</button>
      </div>
      <label className="settings-field">
        <div className="settings-field-label">
          <div>問題文長すぎアラート</div>
          <div>問題文がこれより長ければ色を変える</div>
        </div>
        <span className="settings-input">
          <input
            type="number"
            min="1"
            step="1"
            value={draftQuestionLengthLimit}
            onChange={(event) => setDraftQuestionLengthLimit(event.target.value)}
          />
          文字
        </span>
      </label>
      <div className="settings-actions">
        <button
          className="primary-btn"
          disabled={!canSave}
          onClick={() => {
            onChange(parsedQuestionLengthLimit);
            if (typeof ref !== "function") ref?.current?.close();
          }}
        >
          保存
        </button>
      </div>
    </dialog>
  );
});

export default SettingsDialog;
