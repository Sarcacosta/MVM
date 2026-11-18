import type Database from 'better-sqlite3';
import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import session from 'express-session';
import helmet from 'helmet';
import multer from 'multer';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { registerAuthRoutes } from './routes/auth';
import { registerCatalogRoutes } from './routes/catalog';
import { registerContactRoutes } from './routes/contact';
import { registerImageRoutes } from './routes/images';
import { registerPublicRoutes } from './routes/public';
import { registerWorkRoutes } from './routes/works';
import { SqlStore } from './session-store';
declare module 'express-session' {
  interface SessionData {
    adminId: number;
    csrf: string;
  }
}
export function createApp(
  db: Database.Database,
  opts: { mail?: (data: any) => Promise<void>; test?: boolean } = {},
) {
  const app = express(),
    prod = process.env.NODE_ENV === 'production';
  const secret = process.env.SESSION_SECRET || randomBytes(48).toString('hex');
  if (prod && (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32))
    throw Error('Configura SESSION_SECRET seguro.');
  if (prod && process.env.MAIL_MODE !== 'smtp') throw Error('Configura SMTP antes de producción.');
  const origin = process.env.APP_ORIGIN || 'http://127.0.0.1:5173';
  const uploads = resolve(process.env.UPLOAD_DIR || './uploads');
  mkdirSync(uploads, { recursive: true });
  app.disable('x-powered-by');
  if (prod) app.set('trust proxy', 1);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:'],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
      strictTransportSecurity: prod ? undefined : false,
    }),
  );
  app.use(cors({ origin, credentials: true }));
  app.use(express.json({ limit: '32kb' }));
  app.use('/api', (_q, response, next) => {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Robots-Tag', 'noindex, nofollow');
    next();
  });
  app.use(
    session({
      name: 'lya.sid',
      secret,
      resave: false,
      saveUninitialized: false,
      store: new SqlStore(db),
      cookie: { httpOnly: true, secure: prod, sameSite: 'lax', maxAge: 8 * 3600000 },
    }),
  );
  app.use('/api', (request, response, next) => {
    if (
      !['GET', 'HEAD', 'OPTIONS'].includes(request.method) &&
      request.get('origin') !== origin &&
      !opts.test
    )
      return response.status(403).json({ error: 'Origen no autorizado.' });
    next();
  });
  const required = (request: Request, response: Response, next: NextFunction) =>
    request.session.adminId
      ? next()
      : response.status(401).json({ error: 'Inicia sesión para continuar.' });
  const csrf = (request: Request, response: Response, next: NextFunction) =>
    ['GET', 'HEAD'].includes(request.method) || request.get('x-csrf-token') === request.session.csrf
      ? next()
      : response
          .status(403)
          .json({ error: 'Sesión de seguridad inválida. Recarga e inténtalo de nuevo.' });
  const catalog = () => ({
    brands: db.prepare('SELECT * FROM brands ORDER BY name').all(),
    models: db.prepare('SELECT * FROM models ORDER BY name').all(),
  });
  const images = (id: number) =>
    db.prepare('SELECT * FROM images WHERE work_id=? ORDER BY cover DESC,position,id').all(id);
  const base =
    'SELECT w.*,m.name AS model,b.name AS brand,b.id AS brand_id FROM works w LEFT JOIN models m ON m.id=w.model_id LEFT JOIN brands b ON b.id=m.brand_id';

  const context = { app, db, secret, opts, uploads, required, csrf, catalog, images, base };
  registerPublicRoutes(context);
  registerContactRoutes(context);
  registerAuthRoutes(context);
  registerWorkRoutes(context);
  registerCatalogRoutes(context);
  registerImageRoutes(context);
  app.use('/uploads', express.static(uploads, { immutable: true, maxAge: '7d' }));
  if (existsSync(resolve('dist/index.html'))) {
    app.use(express.static(resolve('dist')));
    app.get('/{*path}', (request, response) => {
      if (request.path.startsWith('/api/'))
        return response.status(404).json({ error: 'Ruta no encontrada.' });
      response.sendFile(resolve('dist/index.html'));
    });
  }
  app.use('/api', (_q, response) => response.status(404).json({ error: 'Ruta no encontrada.' }));
  app.use((e: any, _q: Request, response: Response, _n: NextFunction) => {
    console.error(
      JSON.stringify({
        event: 'request_failed',
        kind: e instanceof multer.MulterError ? 'upload' : 'internal',
      }),
    );
    response.status(e instanceof multer.MulterError ? 400 : 500).json({
      error:
        e instanceof multer.MulterError
          ? 'El archivo supera el límite permitido.'
          : 'No se pudo completar la operación.',
    });
  });
  return app;
}
