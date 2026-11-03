import { StrictMode } from "react";
import { ViteReactSSG } from "vite-react-ssg/single-page";
import { Toaster } from "sonner";
import "./index.css";
import App from "./App.tsx";
import "sonner/dist/styles.css";

export const createRoot = ViteReactSSG(
  <StrictMode>
    <>
      <App />
      <Toaster richColors />
    </>
  </StrictMode>,
);
