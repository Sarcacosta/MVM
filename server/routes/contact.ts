import { rateLimit } from 'express-rate-limit';
import { createHmac } from 'node:crypto';
import nodemailer from 'nodemailer';
import type { AppContext } from '../context';
import { contactSchema } from '../validation';

export function registerContactRoutes({ app, db, secret, opts }: AppContext) {
  app.post(
    '/api/contact',
    rateLimit({
      windowMs: 15 * 60000,
      limit: 8,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: { error: 'Has realizado varios intentos. Espera 15 minutos.' },
    }),
    async (request, response, next) => {
      try {
        const parsed = contactSchema.safeParse(request.body);
        if (!parsed.success)
          return response.status(400).json({
            error: 'Revisa los campos del formulario.',
            fields: parsed.error.flatten().fieldErrors,
          });
        const contactData = parsed.data;
        if (
          contactData.brandId &&
          !db.prepare('SELECT id FROM brands WHERE id=?').get(contactData.brandId)
        )
          return response.status(400).json({ error: 'Marca inválida.' });
        if (
          contactData.modelId &&
          (!contactData.brandId ||
            !db
              .prepare('SELECT id FROM models WHERE id=? AND brand_id=?')
              .get(contactData.modelId, contactData.brandId))
        )
          return response.status(400).json({ error: 'El modelo no corresponde a la marca.' });
        const key = request.get('idempotency-key');
        if (!key || !/^[\w-]{16,100}$/.test(key))
          return response.status(400).json({ error: 'Identificador de envío inválido.' });
        const fingerprint = createHmac('sha256', secret)
          .update(JSON.stringify(contactData))
          .digest('hex');
        const mailMode = process.env.MAIL_MODE || 'test';
        db.prepare('DELETE FROM deliveries WHERE created<?').run(Date.now() - 86400000);
        const previousDelivery = db.prepare('SELECT * FROM deliveries WHERE key=?').get(key) as any;
        if (previousDelivery) {
          if (previousDelivery.fingerprint !== fingerprint)
            return response
              .status(409)
              .json({ error: 'El contenido del envío ha cambiado. Reintenta.' });
          if (previousDelivery.state === 'sent')
            return response.json({
              mode: previousDelivery.mode,
              message:
                previousDelivery.mode === 'test'
                  ? 'Prueba procesada. No se envió ningún correo.'
                  : 'Solicitud aceptada por el proveedor de correo.',
            });
          return response.status(409).json({ error: 'Tu solicitud se está procesando.' });
        }
        db.prepare('INSERT INTO deliveries VALUES(?,?,?,?,?)').run(
          key,
          fingerprint,
          'pending',
          mailMode,
          Date.now(),
        );
        try {
          if (opts.mail) await opts.mail(contactData);
          else if (mailMode === 'smtp') {
            if (!process.env.SMTP_HOST || !process.env.MAIL_FROM || !process.env.MAIL_TO)
              throw Error('mail-config');
            const transport = nodemailer.createTransport({
              host: process.env.SMTP_HOST,
              port: Number(process.env.SMTP_PORT || 587),
              secure: process.env.SMTP_SECURE === 'true',
              auth: process.env.SMTP_USER
                ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
                : undefined,
              connectionTimeout: 10000,
              socketTimeout: 15000,
            });
            const result = await transport.sendMail({
              from: process.env.MAIL_FROM,
              to: process.env.MAIL_TO,
              replyTo: contactData.email || undefined,
              subject: 'Solicitud desde el sitio web',
              text: `Fecha: ${new Date().toISOString()}\nNombre: ${contactData.name}\nTeléfono: ${contactData.phone}\nCorreo: ${contactData.email || 'Sin correo'}\nMarca: ${contactData.brandId || 'Sin especificar'} / Modelo: ${contactData.modelId || 'Sin especificar'}\nMensaje: ${contactData.message}\nAutorización: aceptada`,
            });
            if (!result.accepted?.length) throw Error('mail-rejected');
          } else if (mailMode !== 'test') throw Error('mail-mode');
          db.prepare("UPDATE deliveries SET state='sent' WHERE key=?").run(key);
          response.json({
            mode: mailMode,
            message:
              mailMode === 'test'
                ? 'Prueba procesada. No se envió ningún correo.'
                : 'Solicitud aceptada por el proveedor de correo. El taller revisará tu mensaje.',
          });
        } catch {
          db.prepare('DELETE FROM deliveries WHERE key=?').run(key);
          response.status(502).json({
            error:
              'No se pudo procesar tu solicitud. Conservamos el texto en el formulario para que reintentes.',
          });
        }
      } catch (e) {
        next(e);
      }
    },
  );
}
