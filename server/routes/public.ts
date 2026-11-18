import { siteConfig } from '../config';
import type { AppContext } from '../context';

export function registerPublicRoutes({ app, db, catalog, images, base }: AppContext) {
  app.get('/api/config', (_q, response) =>
    response.json({ ...siteConfig, mailMode: process.env.MAIL_MODE || 'test' }),
  );
  app.get('/api/catalog', (_q, response) => response.json(catalog()));
  app.get('/api/works', (request, response) => {
    const page = Math.max(1, Math.min(10000, Number(request.query.page) || 1));
    const clauses = ['w.published=1'],
      args: any[] = [];
    for (const [key, column] of [
      ['brand', 'b.id'],
      ['model', 'm.id'],
    ])
      if (request.query[key]) {
        clauses.push(`${column}=?`);
        args.push(Number(request.query[key]));
      }
    if (request.query.featured === '1') clauses.push('w.featured=1');
    const where = ' WHERE ' + clauses.join(' AND ');
    const total = (
      db.prepare('SELECT COUNT(*) AS n FROM (' + base + where + ')').get(...args) as any
    ).n;
    const rows = db
      .prepare(base + where + ' ORDER BY w.id DESC LIMIT 12 OFFSET ?')
      .all(...args, (page - 1) * 12) as any[];
    response.json({
      items: rows.map((w) => ({ ...w, images: images(w.id) })),
      total,
      page,
      pages: Math.ceil(total / 12),
    });
  });
  app.get('/api/works/:id', (request, response) => {
    const w = db.prepare(base + ' WHERE w.id=? AND w.published=1').get(request.params.id) as any;
    if (!w) return response.status(404).json({ error: 'Trabajo no encontrado.' });
    response.json({ ...w, images: images(w.id) });
  });
}
