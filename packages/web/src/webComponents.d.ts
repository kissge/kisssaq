import * as React from "react";

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "csv-import-dialog": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        open: boolean;
        onimport: (
          event: CustomEvent<{ id: number; question: string; answer: string; comment: string }[]>,
        ) => void;
        onclose: () => void;
      };
    }
  }
}
