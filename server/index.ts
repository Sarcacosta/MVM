import 'dotenv/config';
import { createApp } from './app';
import { openDb, seed } from './db';
const db = openDb();
seed(db);
const app = createApp(db);
const server = app.listen(Number(process.env.PORT || 3001), '127.0.0.1', () =>
  console.log('Servidor: http://127.0.0.1:' + (process.env.PORT || 3001)),
);
for (const sig of ['SIGTERM', 'SIGINT'])
  process.on(sig, () =>
    server.close(() => {
      db.close();
      process.exit(0);
    }),
  );
