import { hash } from 'bcryptjs';
import 'dotenv/config';
import { createInterface } from 'node:readline/promises';
import { openDb } from './db';
const rl = createInterface({ input: process.stdin, output: process.stdout });
try {
  const email = (await rl.question('Correo del administrador: ')).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Error('Correo inválido.');
  // Read through the terminal with echo disabled when supported; never use shell arguments.
  process.stdout.write('Contraseña (mínimo 12 caracteres, entrada oculta): ');
  rl.close();
  if (!process.stdin.isTTY)
    throw Error('Ejecuta este procedimiento desde una terminal interactiva.');
  process.stdin.setRawMode(true);
  process.stdin.resume();
  const password = await new Promise<string>((resolve, reject) => {
    let s = '';
    process.stdin.on('data', function read(b) {
      const c = b.toString();
      if (c === '\u0003') {
        process.stdin.off('data', read);
        reject(Error('Cancelado'));
      } else if (c === '\r' || c === '\n') {
        process.stdin.off('data', read);
        resolve(s);
      } else if (c === '\u007f' || c === '\b') s = s.slice(0, -1);
      else s += c;
    });
  });
  process.stdin.setRawMode(false);
  process.stdin.pause();
  console.log();
  if (password.length < 12 || password.length > 72) throw Error('Usa entre 12 y 72 caracteres.');
  const db = openDb();
  db.prepare('INSERT INTO admins(email,password_hash) VALUES(?,?)').run(
    email,
    await hash(password, 12),
  );
  db.close();
  console.log('Administrador creado.');
} catch {
  console.error('No se creó el administrador. Verifica los datos y que el correo no exista.');
  process.exitCode = 1;
} finally {
  rl.close();
  if (process.stdin.isTTY) process.stdin.setRawMode(false);
  process.stdin.pause();
}
