import { useCallback, useEffect, useRef, useState } from 'react';

export const useToggle = (initialValue: boolean = false, timeoutMs: number = 5000) => {
  const [value, setValue] = useState<boolean>(initialValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggle = useCallback(() => {
    setValue((prev) => {
      const next = !prev;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (timeoutMs && next) {
        timerRef.current = setTimeout(() => {
          setValue(false);
        }, timeoutMs);
      }
      return next;
    });
  }, [timeoutMs]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  return [value, toggle] as const;
};
