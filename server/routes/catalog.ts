import type { AppContext } from '../context';

export function registerCatalogRoutes({ app, db }: AppContext) {
  for (const kind of ['brands', 'models']) {
    app.post('/api/admin/' + kind, (request, response) => {
      const name = typeof request.body.name === 'string' ? request.body.name.trim() : '';
      if (name.length < 2 || name.length > 80)
        return response.status(400).json({ error: 'Escribe un nombre entre 2 y 80 caracteres.' });
      try {
        const x =
          kind === 'brands'
            ? db.prepare('INSERT INTO brands(name) VALUES(?)').run(name)
            : db
                .prepare('INSERT INTO models(name,brand_id) VALUES(?,?)')
                .run(name, Number(request.body.brandId));
        response.status(201).json({ id: x.lastInsertRowid });
      } catch {
        response.status(409).json({ error: 'Ya existe o la marca es inválida.' });
      }
    });
    app.put('/api/admin/' + kind + '/:id', (request, response) => {
      const name = typeof request.body.name === 'string' ? request.body.name.trim() : '';
      if (name.length < 2 || name.length > 80)
        return response.status(400).json({ error: 'Nombre inválido.' });
      try {
        const x = db.prepare(`UPDATE ${kind} SET name=? WHERE id=?`).run(name, request.params.id);
        response.status(x.changes ? 200 : 404).json({ ok: !!x.changes });
      } catch {
        response.status(409).json({ error: 'Ese nombre ya existe.' });
      }
    });
    app.delete('/api/admin/' + kind + '/:id', (request, response) => {
      try {
        const x = db.prepare(`DELETE FROM ${kind} WHERE id=?`).run(request.params.id);
        response.status(x.changes ? 200 : 404).json({ ok: !!x.changes });
      } catch {
        response
          .status(409)
          .json({ error: 'Está en uso. Reasigna sus relaciones antes de eliminar.' });
      }
    });
  }
}
