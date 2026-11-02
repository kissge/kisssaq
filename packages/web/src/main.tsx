import { StrictMode } from "react";
import { ViteReactSSG } from "vite-react-ssg/single-page";
import { Toaster } from "sonner";
import "./index.css";
import App from "./App.tsx";
import "sonner/dist/styles.css";

if ("virtualKeyboard" in navigator) {
  console.log("virtualKeyboard is supported");
  (navigator as any).virtualKeyboard.overlaysContent = true;
}

export const createRoot = ViteReactSSG(
  <StrictMode>
    <>
      <App />
      <Toaster richColors />
    </>
  </StrictMode>,
);
