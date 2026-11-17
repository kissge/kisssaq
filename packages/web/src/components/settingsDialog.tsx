import "./settingsDialog.css";

import { forwardRef, useEffect, useState } from "react";

import { SuspiciousSymbols, type SuspiciousSymbolsKey } from "../lib/suspiciousSymbols";

import type { Config } from "../lib/types";

const SettingsDialog = forwardRef<
  HTMLDialogElement,
  { config: Config; onChange: (value: Config) => void }
>(function SettingsDialog({ config, onChange }, ref) {
  const [draft, setDraft] = useState<Config>({ ...config });

  useEffect(() => setDraft({ ...config }), [config]);

  const canSave =
    Number.isInteger(draft.questionLengthThreshold) && draft.questionLengthThreshold > 0;

  return (
    <dialog
      ref={ref}
      id="settingsDialog"
      closedby="any"
      onClick={(event) => event.stopPropagation()}
      onClose={() => setDraft({ ...config })}
    >
      <div className="toolbar">
        <h3>設定</h3>
        <button onClick={() => typeof ref !== "function" && ref?.current?.close()}>✕</button>
      </div>

      <fieldset>
        <legend>表示</legend>

        <div>
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
                value={draft.questionLengthThreshold}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    questionLengthThreshold: Number.parseInt(event.target.value, 10),
                  })
                }
              />
              文字
            </span>
          </label>
          <div className="settings-field">
            <div className="settings-field-label">
              <div>ジャンル</div>
            </div>
            <div className="settings-input">
              <label>
                <input
                  type="radio"
                  name="showGenre"
                  checked={draft.showGenre}
                  onChange={() => setDraft({ ...draft, showGenre: true })}
                />
                常に表示
              </label>
              <label>
                <input
                  type="radio"
                  name="showGenre"
                  checked={!draft.showGenre}
                  onChange={() => setDraft({ ...draft, showGenre: false })}
                />
                ジャンル順の時のみ
              </label>
            </div>
          </div>
          <div className="settings-field">
            <div className="settings-field-label">
              <div>コメント</div>
            </div>
            <div className="settings-input">
              <label>
                <input
                  type="radio"
                  name="showComment"
                  checked={draft.showComment}
                  onChange={() => setDraft({ ...draft, showComment: true })}
                />
                表示
              </label>
              <label>
                <input
                  type="radio"
                  name="showComment"
                  checked={!draft.showComment}
                  onChange={() => setDraft({ ...draft, showComment: false })}
                />
                非表示
              </label>
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>校正</legend>
        <div>
          <div className="settings-field">
            <div className="settings-field-label">
              <div>役物の統一</div>
              <div>警告を表示し、保存時に自動で書き換え</div>
            </div>
            <div className="settings-input" style={{ flex: "0 1 5em" }}>
              {Object.entries(SuspiciousSymbols).map(([key, { label }]) => (
                <label key={key}>
                  {label}
                  <select
                    defaultValue={
                      draft.suspiciousSymbols.warn.includes(key as SuspiciousSymbolsKey)
                        ? "warn"
                        : draft.suspiciousSymbols.fix.includes(key as SuspiciousSymbolsKey)
                          ? "fix"
                          : ""
                    }
                    onChange={(e) => {
                      function _(kind: "warn" | "fix") {
                        if (e.target.value === kind) {
                          return [...draft.suspiciousSymbols[kind], key as SuspiciousSymbolsKey];
                        } else {
                          return [...draft.suspiciousSymbols[kind]].filter(
                            ([s]) => s !== (key as SuspiciousSymbolsKey),
                          );
                        }
                      }

                      setDraft({ ...draft, suspiciousSymbols: { warn: _("warn"), fix: _("fix") } });
                    }}
                  >
                    <option value="">－</option>
                    <option value="warn">警告</option>
                    <option value="fix">自動修正</option>
                  </select>
                </label>
              ))}
            </div>
          </div>
        </div>
      </fieldset>

      <div className="settings-actions">
        <button
          className="primary-btn"
          disabled={!canSave}
          onClick={() => {
            onChange(draft);
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
