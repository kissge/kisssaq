import { isUnlocked } from "kissunlocklib";
import { useCallback, useEffect, useState } from "react";

export function useUnlocked() {
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      setUnlocked(await isUnlocked());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const result = await isUnlocked();

      if (!cancelled) {
        setUnlocked(result);
        setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { unlocked, loading, refresh };
}
