import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import sharp from 'sharp';
import type { AppContext } from '../context';

export function registerImageRoutes({ app, db, uploads, images }: AppContext) {
  const removeImage = db.transaction((workId: number, imageId: number) => {
    const work = db.prepare('SELECT published FROM works WHERE id=?').get(workId) as
      { published: number } | undefined;
    const photos = db
      .prepare('SELECT id, cover FROM images WHERE work_id=? ORDER BY position,id')
      .all(workId) as { id: number; cover: number }[];
    if (!work || !photos.some((photo) => photo.id === imageId)) return 'missing';
    if (work.published && photos.length === 1) return 'required';

    db.prepare('DELETE FROM images WHERE id=? AND work_id=?').run(imageId, workId);
    const remaining = photos.filter((photo) => photo.id !== imageId);
    const coverId = (remaining.find((photo) => photo.cover) ?? remaining[0])?.id;
    const update = db.prepare('UPDATE images SET position=?,cover=? WHERE id=? AND work_id=?');
    remaining.forEach((photo, index) =>
      update.run(index, Number(photo.id === coverId), photo.id, workId),
    );
    return 'removed';
  });

  app.delete('/api/admin/works/:id/images/:imageId', (request, response) => {
    const workId = Number(request.params.id);
    const imageId = Number(request.params.imageId);
    if (
      !Number.isSafeInteger(workId) ||
      !Number.isSafeInteger(imageId) ||
      workId < 1 ||
      imageId < 1
    )
      return response.status(404).json({ error: 'Fotografía no encontrada.' });

    const result = removeImage(workId, imageId);
    if (result === 'missing')
      return response.status(404).json({ error: 'Fotografía no encontrada en este trabajo.' });
    if (result === 'required')
      return response.status(409).json({
        error: 'Agrega otra foto o retira la publicación antes de eliminar la última imagen.',
      });
    return response.json({ images: images(workId) });
  });

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024, files: 1 },
    fileFilter: (_q, f, cb) =>
      cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(f.mimetype)),
  });
  app.post(
    '/api/admin/works/:id/images',
    upload.single('image'),
    async (request, response, next) => {
      try {
        if (!db.prepare('SELECT id FROM works WHERE id=?').get(request.params.id))
          return response.status(404).json({ error: 'Trabajo no encontrado.' });
        const count = (
          db
            .prepare('SELECT COUNT(*) AS n FROM images WHERE work_id=?')
            .get(request.params.id) as any
        ).n;
        if (count >= 12)
          return response.status(400).json({ error: 'Máximo 12 imágenes por trabajo.' });
        if (!request.file)
          return response.status(400).json({ error: 'Selecciona JPEG, PNG o WebP, máximo 10 MB.' });
        const alt = typeof request.body.alt === 'string' ? request.body.alt.trim() : '';
        if (!alt || alt.length > 300)
          return response
            .status(400)
            .json({ error: 'Añade un texto alternativo de hasta 300 caracteres.' });
        const img = sharp(request.file.buffer, { limitInputPixels: 40000000 });
        let meta;
        try {
          meta = await img.metadata();
        } catch {
          return response
            .status(400)
            .json({ error: 'El contenido no es una imagen válida o supera el límite de píxeles.' });
        }
        if (!['jpeg', 'png', 'webp'].includes(meta.format || ''))
          return response.status(400).json({ error: 'El contenido no es una imagen permitida.' });
        const filename = randomUUID() + '.webp';
        await img
          .rotate()
          .resize({ width: 1600, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toFile(resolve(uploads, filename));
        const x = db
          .prepare('INSERT INTO images(work_id,url,alt,position,cover) VALUES(?,?,?,?,?)')
          .run(request.params.id, '/uploads/' + filename, alt, count, count === 0 ? 1 : 0);
        response.status(201).json({ id: x.lastInsertRowid });
      } catch (e) {
        next(e);
      }
    },
  );
  app.put('/api/admin/works/:id/images', (request, response) => {
    const data = request.body.images;
    const current = images(Number(request.params.id)) as any[];
    if (
      !Array.isArray(data) ||
      data.length !== current.length ||
      new Set(data.map((i: any) => i.id)).size !== current.length ||
      data.filter((i: any) => i.cover === true).length !== 1 ||
      data.some(
        (i: any) =>
          !current.some((c) => c.id === i.id) ||
          typeof i.alt !== 'string' ||
          !i.alt.trim() ||
          i.alt.length > 300,
      )
    )
      return response.status(400).json({
        error: 'Envía todas las fotos, sin duplicados, con una portada y textos alternativos.',
      });
    db.transaction(() =>
      data.forEach((im: any, index: number) =>
        db
          .prepare('UPDATE images SET alt=?,position=?,cover=? WHERE id=? AND work_id=?')
          .run(im.alt.trim(), index, +im.cover, im.id, request.params.id),
      ),
    )();
    response.json({ ok: true });
  });
}
