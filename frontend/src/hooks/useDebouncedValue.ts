import { useEffect, useRef } from 'react';

export function useDebouncedValue<T>(value: T, delay: number): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

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
