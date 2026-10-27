import { hc } from "hono/client";
import type { AppType } from "@kisssaq/api";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8787";

export const apiClient = hc<AppType>(apiUrl);
