import { useState, useEffect } from "react";

const STORAGE_KEY = "allerguard_user_id";

export function useLocalUser() {
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setUserId(parseInt(stored, 10));
    }
    setIsLoaded(true);
  }, []);

  const saveUserId = (id: number) => {
    localStorage.setItem(STORAGE_KEY, id.toString());
    setUserId(id);
  };

  const clearUserId = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUserId(null);
  };

  return { userId, saveUserId, clearUserId, isLoaded };
}
