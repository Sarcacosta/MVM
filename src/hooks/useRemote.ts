import { useEffect, useState } from 'react';
import { api } from '../api';
export function useRemote<T>(url: string) {
  const [data, setData] = useState<T | null>(null),
    [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setData(null);
    setError('');
    api<T>(url)
      .then((d) => active && setData(d))
      .catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, [url]);
  return { data, error };
}
