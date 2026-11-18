import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { hash } from 'bcryptjs';
import sharp from 'sharp';
import { randomUUID } from 'node:crypto';
import { openDb, seed } from '../server/db';
import { createApp } from '../server/app';
process.env.MAIL_MODE = 'test';
process.env.UPLOAD_DIR = './data/test-uploads';
const contact = {
  name: 'Persona de prueba',
  phone: '+57 300 123 4567',
  email: '',
  message: 'Consulta de demostración para un camión.',
  consent: true,
};
function setup(mail?: () => Promise<void>) {
  const db = openDb(':memory:');
  seed(db);
  return { db, app: createApp(db, { test: true, mail }) };
}
test('filtros dependientes, paginación y catálogo', async () => {
  const { app, db } = setup();
  try {
    const cat = await request(app).get('/api/catalog').expect(200);
    assert.equal(cat.body.models.filter((m: any) => m.brand_id === 1).length, 2);
    const all = await request(app).get('/api/works').expect(200);
    assert.equal(all.body.items.length, 12);
    assert.equal(all.body.pages, 2);
    const filtered = await request(app).get('/api/works?brand=1&model=1').expect(200);
    assert.ok(filtered.body.items.length);
    assert.ok(filtered.body.items.every((w: any) => w.brand_id === 1 && w.model_id === 1));
    const invalid = await request(app).get('/api/works?brand=2&model=1').expect(200);
    assert.equal(invalid.body.total, 0);
    const page = await request(app).get('/api/works?page=2').expect(200);
    assert.equal(page.body.items.length, 2);
  } finally {
    db.close();
  }
});
test('formulario rechaza datos inválidos y relaciones inconsistentes', async () => {
  const { app, db } = setup();
  try {
    for (const body of [
      { ...contact, name: 'x' },
      { ...contact, phone: '123' },
      { ...contact, email: 'inválido' },
      { ...contact, consent: false },
      { ...contact, message: 'corto' },
      { ...contact, website: 'spam' },
      { ...contact, brandId: 1, modelId: 3 },
    ])
      await request(app)
        .post('/api/contact')
        .set('idempotency-key', randomUUID())
        .send(body)
        .expect(400);
  } finally {
    db.close();
  }
});
test('prueba identificada, idempotencia y fallo real sin falso éxito', async () => {
  let deliveries = 0;
  const { app, db } = setup(async () => {
    deliveries++;
  });
  try {
    const key = randomUUID();
    for (let i = 0; i < 2; i++) {
      const r = await request(app)
        .post('/api/contact')
        .set('idempotency-key', key)
        .send(contact)
        .expect(200);
      assert.equal(r.body.mode, 'test');
      assert.match(r.body.message, /No se envió/);
    }
    assert.equal(deliveries, 1);
    await request(app)
      .post('/api/contact')
      .set('idempotency-key', key)
      .send({ ...contact, name: 'Otra persona' })
      .expect(409);
  } finally {
    db.close();
  }
  const failed = setup(async () => {
    throw Error('provider failed');
  });
  try {
    await request(failed.app)
      .post('/api/contact')
      .set('idempotency-key', randomUUID())
      .send(contact)
      .expect(502);
  } finally {
    failed.db.close();
  }
});
test('permisos, CSRF, publicación, imágenes, catálogos y cierre de sesión', async () => {
  const { app, db } = setup();
  try {
    await request(app).post('/api/admin/works').expect(401);
    await request(app).get('/api/admin/works').expect(401);
    const email = 'admin@example.test',
      password = randomUUID();
    db.prepare('INSERT INTO admins(email,password_hash) VALUES(?,?)').run(
      email,
      await hash(password, 4),
    );
    const agent = request.agent(app);
    const login = await agent.post('/api/admin/login').send({ email, password }).expect(200);
    const token = login.body.csrf;
    await agent.post('/api/admin/works').expect(403);
    const seeded = (await request(app).get('/api/works/1').expect(200)).body.images;
    const removeCover = `/api/admin/works/1/images/${seeded[0].id}`;
    await request(app).delete(removeCover).expect(401);
    await agent.delete(removeCover).expect(403);
    await agent
      .delete(`/api/admin/works/2/images/${seeded[0].id}`)
      .set('x-csrf-token', token)
      .expect(404);
    await agent.delete(removeCover).set('x-csrf-token', token).expect(200);
    const remaining = (await request(app).get('/api/works/1').expect(200)).body.images;
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0].id, seeded[1].id);
    assert.equal(remaining[0].cover, 1);
    assert.equal(remaining[0].position, 0);
    await agent
      .delete(`/api/admin/works/1/images/${remaining[0].id}`)
      .set('x-csrf-token', token)
      .expect(409);
    const created = await agent.post('/api/admin/works').set('x-csrf-token', token).expect(201);
    const id = created.body.id;
    await request(app)
      .get('/api/works/' + id)
      .expect(404);
    const work = {
      title: 'Trabajo de prueba',
      description: 'Descripción del trabajo',
      type: 'Acero',
      modelId: 1,
      published: true,
      featured: true,
    };
    await agent
      .put('/api/admin/works/' + id)
      .set('x-csrf-token', token)
      .send(work)
      .expect(400);
    await agent
      .post(`/api/admin/works/${id}/images`)
      .set('x-csrf-token', token)
      .field('alt', 'Archivo falso')
      .attach('image', Buffer.from('not an image'), {
        filename: 'fake.webp',
        contentType: 'image/webp',
      })
      .expect(400);
    const image = await sharp({
      create: { width: 30, height: 30, channels: 3, background: '#abc' },
    })
      .png()
      .toBuffer();
    await agent
      .post(`/api/admin/works/${id}/images`)
      .set('x-csrf-token', token)
      .field('alt', 'Imagen de prueba')
      .attach('image', image, { filename: 'valid.png', contentType: 'image/png' })
      .expect(201);
    await agent
      .put('/api/admin/works/' + id)
      .set('x-csrf-token', token)
      .send(work)
      .expect(200);
    await request(app)
      .get('/api/works/' + id)
      .expect(200);
    await agent.delete('/api/admin/brands/1').set('x-csrf-token', token).expect(409);
    await agent
      .put('/api/admin/works/' + id)
      .set('x-csrf-token', token)
      .send({ ...work, published: false })
      .expect(200);
    await request(app)
      .get('/api/works/' + id)
      .expect(404);
    await agent.post('/api/admin/logout').set('x-csrf-token', token).expect(200);
    await agent.get('/api/admin/works').expect(401);
  } finally {
    db.close();
  }
});
test('rechaza origen ajeno en mutaciones', async () => {
  const db = openDb(':memory:');
  try {
    const app = createApp(db);
    await request(app)
      .post('/api/contact')
      .set('origin', 'https://otro.example')
      .send(contact)
      .expect(403);
  } finally {
    db.close();
  }
});
