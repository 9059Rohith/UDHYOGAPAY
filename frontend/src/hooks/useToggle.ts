// Custom hook: encapsulates reusable useToggle state and behavior.
import { useState, useCallback } from 'react';

export const useToggle = (initialValue: boolean = false): [boolean, () => void, (value: boolean) => void] => {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((v) => !v);
  }, []);

  return [value, toggle, setValue];
};
