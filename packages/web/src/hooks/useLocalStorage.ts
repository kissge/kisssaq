import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function readStoredValue<T>(key: string, initialValue: T): T {
  try {
    const item = window.localStorage.getItem(key);

    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    console.error(error);
    toast.error("ローカルデータの読み込みに失敗しました。");
    return initialValue;
  }
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const initialValueRef = useRef(initialValue);

  useEffect(() => {
    setStoredValue(readStoredValue(key, initialValueRef.current));
  }, [key]);

  const setValue = (value: T) => {
    try {
      setStoredValue(value);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(error);
      toast.error("ローカルデータの保存に失敗しました。");
    }
  };

  return [storedValue, setValue];
}
