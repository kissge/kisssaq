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
  youso: {
    label: "→ （アラビア数字）要素",
    search: /[一二三四五六七八九](?=要素)/,
    replace: (sub) => String("一二三四五六七八九".indexOf(sub) + 1),
  },
  bun: {
    label: "→ （アラビア数字）文",
    search: /[一二三四五六七八九](?=文)(?!文字)/,
    replace: (sub) => String("一二三四五六七八九".indexOf(sub) + 1),
  },
  moji: {
    label: "→ （漢数字）文字",
    search: /\d(?=文字)/,
    replace: (sub) => "一二三四五六七八九".charAt(Number(sub) - 1) || sub,
  },
} satisfies Record<
  string,
  { label: string; search: RegExp; replace: string | Parameters<string["replace"]>[1] }
>;
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
