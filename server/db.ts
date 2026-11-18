import Database from 'better-sqlite3';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
export function openDb(path = process.env.DB_PATH || './data/site.sqlite') {
  if (path !== ':memory:') mkdirSync(dirname(resolve(path)), { recursive: true });
  const db = new Database(path);
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');
  db.exec(
    readFileSync(fileURLToPath(new URL('./migrations/001_initial.sql', import.meta.url)), 'utf8'),
  );
  return db;
}
export function seed(db: Database.Database) {
  if ((db.prepare('SELECT COUNT(*) AS n FROM brands').get() as any).n) return;
  db.transaction(() => {
    const brands = [
      ['Kenworth', 'T800', 'T680'],
      ['Freightliner', 'Cascadia', 'M2'],
      ['International', 'ProStar', 'LT'],
      ['Chevrolet', 'NPR', 'NQR'],
    ];
    for (const [name, ...models] of brands) {
      const b = db.prepare('INSERT INTO brands(name) VALUES(?)').run(name);
      for (const model of models)
        db.prepare('INSERT INTO models(brand_id,name) VALUES(?,?)').run(b.lastInsertRowid, model);
    }
    const titles = [
      'Defensa en acero pulido',
      'Estribos con identidad',
      'Detalles que hacen la diferencia',
      'Frente de ruta',
      'Acabados de cabina',
      'Acero para cada recorrido',
      'Líneas de carácter',
      'Personalización exterior',
      'Protección con estilo',
      'Detalles de carrocería',
      'Perfil de carretera',
      'Un frente diferente',
      'Pasos de acceso',
      'Acabado integral',
    ];
    for (let i = 0; i < titles.length; i++) {
      const w = db
        .prepare(
          'INSERT INTO works(title,description,type,model_id,published,featured,demo) VALUES(?,?,?,?,1,?,1)',
        )
        .run(
          titles[i],
          'Referencia de demostración para explorar materiales, proporciones y acabados. Esta ficha no representa un trabajo realizado por la empresa. El diseño y la viabilidad se acuerdan al revisar cada vehículo.',
          i % 2 ? 'Personalización' : 'Trabajo en acero',
          (i % 8) + 1,
          i < 3 ? 1 : 0,
        );
      for (let j = 0; j < 2; j++)
        db.prepare('INSERT INTO images(work_id,url,alt,position,cover) VALUES(?,?,?,?,?)').run(
          w.lastInsertRowid,
          `/samples/truck-${(i + j) % 3}.svg`,
          'Ilustración de muestra de un camión con acabados metálicos',
          j,
          j === 0 ? 1 : 0,
        );
    }
  })();
}
