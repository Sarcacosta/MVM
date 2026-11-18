import type Database from 'better-sqlite3';
import type { Express, RequestHandler } from 'express';

/** Dependencias compartidas por los módulos de rutas. */
export interface AppContext {
  app: Express;
  db: Database.Database;
  secret: string;
  opts: { mail?: (data: any) => Promise<void>; test?: boolean };
  uploads: string;
  required: RequestHandler;
  csrf: RequestHandler;
  catalog: () => { brands: unknown[]; models: unknown[] };
  images: (id: number) => unknown[];
  base: string;
}
