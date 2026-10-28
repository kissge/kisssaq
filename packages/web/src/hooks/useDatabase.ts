import { useEffect, useState } from "react";
import { apiClient } from "../lib/apiClient";
import type { Row } from "../lib/types";

const defaultFolders = ["未分類"];
const defaultGenres = [
  "未分類",
  "アニメ・ゲーム",
  "スポーツ",
  "ライフスタイル・グルメ",
  "文化・芸術",
  "歴史・地理・社会",
  "理系学問",
  "芸能",
  "語学・文学",
];

type Database = {
  questions: Row[];
  folders: string[];
  genres: string[];
};

type StoredDatabase = Database & {
  userID: string;
  updatedAt: string | null;
};

function readStoredValue<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch (error) {
    console.error(`Failed to read localStorage key "${key}".`, error);
    return fallback;
  }
}

function getUserID(): string {
  const stored = window.localStorage.getItem("userID");
  if (stored) {
    return stored;
  }

  const userID = crypto.randomUUID();
  window.localStorage.setItem("userID", userID);
  return userID;
}

function getJSTNow(): string {
  return new Date().toLocaleString("sv-SE", {
    timeZone: "Asia/Tokyo",
    hour12: false,
  });
}

function parseJST(value: string | null): number {
  if (!value) {
    return 0;
  }

  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  return Date.parse(normalized.endsWith("+09:00") ? normalized : `${normalized}+09:00`);
}

function readLocalDatabase(): StoredDatabase {
  return {
    questions: readStoredValue<Row[]>("q", []),
    folders: readStoredValue<string[]>("f", defaultFolders),
    genres: readStoredValue<string[]>("g", defaultGenres),
    userID: getUserID(),
    updatedAt: readStoredValue<string | null>("updatedAt", null),
  };
}

function writeLocalDatabase(database: StoredDatabase): void {
  try {
    window.localStorage.setItem("q", JSON.stringify(database.questions));
    window.localStorage.setItem("f", JSON.stringify(database.folders));
    window.localStorage.setItem("g", JSON.stringify(database.genres));
    window.localStorage.setItem("userID", database.userID);
    window.localStorage.setItem("updatedAt", JSON.stringify(database.updatedAt));
  } catch (error) {
    console.error("Failed to write database to localStorage.", error);
    alert(error);
  }
}

export function useDatabase(unlocked: boolean) {
  const [database, setDatabase] = useState<Database>({
    questions: [],
    folders: defaultFolders,
    genres: defaultGenres,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const local = readLocalDatabase();
      let selected = local;

      if (window.localStorage.getItem("updatedAt") === null) {
        writeLocalDatabase(local);
      }

      if (unlocked) {
        try {
          const response = await apiClient.question[":id"].$get({ param: { id: local.userID } });

          if (response.ok) {
            const remote = await response.json();
            if (parseJST(remote.updatedAt) > parseJST(local.updatedAt)) {
              selected = {
                ...local,
                questions: remote.db.q as Row[],
                folders: remote.db.f,
                genres: remote.db.g,
                updatedAt: remote.updatedAt,
              };
              writeLocalDatabase(selected);
            }
          } else if (response.status !== 404) {
            throw new Error(`Failed to fetch remote database: ${response.status}`);
          }
        } catch (error) {
          console.error("Failed to synchronize remote database.", error);
        }
      }

      if (!cancelled) {
        setDatabase({
          questions: selected.questions,
          folders: selected.folders,
          genres: selected.genres,
        });
        setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [unlocked]);

  function updateDatabase<K extends keyof Database>(key: K, value: Database[K]) {
    const local = readLocalDatabase();
    const updated = {
      ...local,
      [key]: value,
      updatedAt: getJSTNow(),
    } as StoredDatabase;
    setDatabase((current) => ({ ...current, [key]: value }));
    writeLocalDatabase(updated);
  }

  return {
    ...database,
    loading,
    setQuestions: (value: Row[]) => updateDatabase("questions", value),
    setFolders: (value: string[]) => updateDatabase("folders", value),
    setGenres: (value: string[]) => updateDatabase("genres", value),
  };
}
