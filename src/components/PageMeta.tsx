import { useEffect } from 'react';

export function PageMeta({ title }: { title: string }) {
  useEffect(() => {
    document.title = title + ' · Taller de camiones';
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        'content',
        title +
          ' — Referencias de personalización y trabajos en acero para camiones. Sitio de demostración.',
      );
  }, [title]);
  return null;
}
