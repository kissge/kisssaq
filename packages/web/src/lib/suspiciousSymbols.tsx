import type { Config } from "./types";

// `?:` なしで `()` を使わないこと！
export const SuspiciousSymbols = {
  x: {
    label: "× → ✕",
    search: /×/,
    replace: "✕",
  },
  o: {
    label: "○ → ◯", // 漢数字のゼロは必要かもしれないので入れないことにした
    search: /○/,
    replace: "◯",
  },
};
export type SuspiciousSymbolsKey = keyof typeof SuspiciousSymbols;

export function splitSuspiciousSymbols(text: string, targetSymbols: Config["suspiciousSymbols"]) {
  const suspiciousRegExp = new RegExp(
    "(" +
      [...targetSymbols.fix, ...targetSymbols.warn]
        .map((label) => "(?:" + String(SuspiciousSymbols[label].search).slice(1, -1) + ")")
        .join("|") +
      ")",
    "g",
  );

  return text.split(suspiciousRegExp).map((part, j) => (
    <span key={part + j} className={j % 2 ? "sus" : ""}>
      {part}
    </span>
  ));
}

export function replaceSuspiciousSymbols<T extends string>(
  text: T,
  targetSymbols: SuspiciousSymbolsKey[],
): T {
  let replacedText = text;
  for (const label of targetSymbols) {
    replacedText = replacedText.replaceAll(
      new RegExp(SuspiciousSymbols[label].search, "g"),
      SuspiciousSymbols[label].replace,
    ) as T;
  }
  return replacedText;
}
