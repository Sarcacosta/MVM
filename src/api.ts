export type Image = {
  id: number;
  url: string;
  alt: string;
  cover: number | boolean;
  position: number;
};
export type Work = {
  id: number;
  title: string;
  description: string;
  type: string;
  brand: string;
  brand_id: number;
  model: string;
  model_id: number | null;
  published: number;
  featured: number;
  demo: number;
  images: Image[];
};
export type Catalog = {
  brands: { id: number; name: string }[];
  models: { id: number; brand_id: number; name: string }[];
};
export type Config = {
  name: string;
  tagline: string;
  location: string;
  hours: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  whatsappMessage: string;
  about: string;
  mailMode: string;
  services: { title: string; text: string; image?: string;
  imageAlt?: string;}[];
};
let csrf = '';
export const setCsrf = (s: string) => {
  csrf = s;
};
const unavailable =
  'No se pudo conectar con el servidor. Comprueba que npm run dev siga abierto y vuelve a intentar.';
export async function decodeApiResponse(res: Response) {
  const text = await res.text();
  if (!text.trim()) throw Error(unavailable);
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw Error(
      'El servidor devolvió una respuesta no válida. Vuelve a intentar en unos segundos.',
    );
  }
  if (!res.ok)
    throw Error(
      typeof data?.error === 'string' ? data.error : 'No se pudo completar la solicitud.',
    );
  return data;
}
export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData))
    headers.set('Content-Type', 'application/json');
  if (csrf) headers.set('x-csrf-token', csrf);
  const attempts = !options.method || options.method === 'GET' ? 3 : 1;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      let res: Response;
      try {
        res = await fetch('/api' + path, {
          ...options,
          headers,
          credentials: 'same-origin',
          signal: options.signal || AbortSignal.timeout(20000),
        });
      } catch {
        throw Error(unavailable);
      }
      if (res.status >= 500 && attempt < attempts - 1) {
        await new Promise((r) => setTimeout(r, 350 * (attempt + 1)));
        continue;
      }
      return await decodeApiResponse(res);
    } catch (e) {
      if (attempt === attempts - 1) throw e;
      await new Promise((r) => setTimeout(r, 350 * (attempt + 1)));
    }
  }
  throw Error(unavailable);
}
export function whatsapp(c: Config, reference?: string) {
  return c.whatsappNumber && /^[1-9]\d{6,14}$/.test(c.whatsappNumber)
    ? `https://wa.me/${c.whatsappNumber}?text=${encodeURIComponent(c.whatsappMessage + (reference ? ' Referencia: ' + reference : ''))}`
    : null;
}
