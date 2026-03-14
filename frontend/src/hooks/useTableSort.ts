// Custom hook: encapsulates reusable useTableSort state and behavior.
import { useState, useCallback } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

export function useTableSort<T>(initialData: T[], initialSortKey?: keyof T) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(
    initialSortKey ? { key: initialSortKey, direction: 'asc' } : null
  );

  const sortedData = useCallback(() => {
    if (!sortConfig) return initialData;

    return [...initialData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [initialData, sortConfig]);

  const requestSort = useCallback((key: keyof T) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  }, []);

  return {
    sortedData: sortedData(),
    sortConfig,
    requestSort
  };
}
