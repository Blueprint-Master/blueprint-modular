/**
 * Hook React pour réactivité granulaire : le composant ne se re-render
 * que quand la clé du store change.
 */
import { useState, useEffect } from 'react';
import reactiveStore from './reactiveStore';

export function useReactive(key) {
  const [value, setValue] = useState(() => reactiveStore.get(key));
  useEffect(() => {
    return reactiveStore.subscribe(key, setValue);
  }, [key]);
  return value;
}

export default useReactive;
