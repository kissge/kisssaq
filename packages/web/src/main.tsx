import "./index.css";
import "sonner/dist/styles.css";

import { StrictMode } from "react";
import { Toaster } from "sonner";
import { ViteReactSSG } from "vite-react-ssg/single-page";

import App from "./App.tsx";

export const createRoot = ViteReactSSG(
  <StrictMode>
    <>
      <App />
      <Toaster richColors />
    </>
  </StrictMode>,
);
