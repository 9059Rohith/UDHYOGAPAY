import { useEffect, useRef, useState } from 'react';

export function useDebouncedValue<T>(value: T, delay: number): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}
