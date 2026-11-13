export const SuspiciousSymbols: [string, string][] = [["×", "✕"]];

export function splitSuspiciousSymbols(text: string, targetSymbols: [string, string][]) {
  const suspiciousRegExp = new RegExp(
    "(" + targetSymbols.map(([sus]) => RegExp.escape(sus)).join("|") + ")",
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
  targetSymbols: [string, string][],
): T {
  let replacedText = text;
  for (const [sus, correct] of targetSymbols) {
    replacedText = replacedText.replaceAll(sus, correct) as T;
  }
  return replacedText;
}
