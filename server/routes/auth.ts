import { compare } from 'bcryptjs';
import { rateLimit } from 'express-rate-limit';
import { randomBytes } from 'node:crypto';
import type { AppContext } from '../context';

export function registerAuthRoutes({ app, db, required, csrf }: AppContext) {
  const loginLimit = rateLimit({
    windowMs: 15 * 60000,
    limit: 10,
    message: { error: 'Demasiados intentos. Espera 15 minutos.' },
  });
  app.post('/api/admin/login', loginLimit, async (request, response, next) => {
    try {
      const { email, password } = request.body;
      if (typeof email !== 'string' || typeof password !== 'string' || password.length > 100)
        return response.status(400).json({ error: 'Datos inválidos.' });
      const user = db
        .prepare('SELECT * FROM admins WHERE email=?')
        .get(email.trim().toLowerCase()) as any;
      if (!user || !(await compare(password, user.password_hash)))
        return response.status(401).json({ error: 'Correo o contraseña incorrectos.' });
      request.session.regenerate((e) => {
        if (e) return next(e);
        request.session.adminId = user.id;
        request.session.csrf = randomBytes(32).toString('hex');
        request.session.save((e) => (e ? next(e) : response.json({ csrf: request.session.csrf })));
      });
    } catch (e) {
      next(e);
    }
  });
  app.use('/api/admin', required, csrf);
  app.get('/api/admin/session', (request, response) =>
    response.json({ csrf: request.session.csrf }),
  );
  app.post('/api/admin/logout', (request, response, next) =>
    request.session.destroy((e) => {
      if (e) return next(e);
      response.clearCookie('lya.sid').json({ ok: true });
    }),
  );
}
