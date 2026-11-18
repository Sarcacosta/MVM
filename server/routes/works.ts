import type { AppContext } from '../context';
import { workSchema } from '../validation';

export function registerWorkRoutes({ app, db, images, base }: AppContext) {
  app.get('/api/admin/works', (_q, response) =>
    response.json(
      (db.prepare(base + ' ORDER BY w.id DESC').all() as any[]).map((w) => ({
        ...w,
        images: images(w.id),
      })),
    ),
  );
  app.post('/api/admin/works', (_q, response) => {
    const id = db.prepare("INSERT INTO works(title) VALUES('Nuevo trabajo')").run().lastInsertRowid;
    response.status(201).json({ id });
  });
  app.put('/api/admin/works/:id', (request, response) => {
    const parsed = workSchema.safeParse(request.body);
    if (!parsed.success)
      return response.status(400).json({ error: 'Revisa título, descripción, tipo y modelo.' });
    const d = parsed.data;
    if (!db.prepare('SELECT id FROM works WHERE id=?').get(request.params.id))
      return response.status(404).json({ error: 'Trabajo no encontrado.' });
    if (d.modelId && !db.prepare('SELECT id FROM models WHERE id=?').get(d.modelId))
      return response.status(400).json({ error: 'Modelo inválido.' });
    const photos = images(Number(request.params.id)) as any[];
    if (
      d.published &&
      (!d.description.trim() ||
        !d.type.trim() ||
        !d.modelId ||
        !photos.length ||
        photos.some((i) => !i.alt.trim()))
    )
      return response.status(400).json({
        error:
          'Para publicar necesitas descripción, tipo, modelo y fotografías con texto alternativo.',
      });
    db.prepare(
      'UPDATE works SET title=?,description=?,type=?,model_id=?,published=?,featured=? WHERE id=?',
    ).run(d.title, d.description, d.type, d.modelId, +d.published, +d.featured, request.params.id);
    response.json({ ok: true });
  });
}
