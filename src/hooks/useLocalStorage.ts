import { useEffect, useState } from "react";

function readStoredValue<T>(key: string, initialValue: T): T {
  try {
    const item = window.localStorage.getItem(key);

    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    console.error(error);
    return initialValue;
  }
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => initialValue);

  useEffect(() => {
    setTimeout(() => {
      setStoredValue(readStoredValue(key, initialValue));
    }, 0);
  }, [key, initialValue]);

  const setValue = (value: T) => {
    try {
      setStoredValue(value);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };

  return [storedValue, setValue];
}
