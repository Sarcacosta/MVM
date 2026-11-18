import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { whatsapp, type Catalog, type Config } from '../api';
import { PageMeta } from '../components/PageMeta';
import { TruckFilters } from '../components/TruckFilters';
import { emptyCatalog } from '../data/catalog';
import { useRemote } from '../hooks/useRemote';
import { createContactWhatsAppUrl } from '../utils/contactWhatsApp';

export function ContactPage({ config }: { config: Config }) {
  const catalogState = useRemote<Catalog>('/catalog');
  const [brand, setBrand] = useState(''),
    [model, setModel] = useState(''),
    [status, setStatus] = useState(''),
    [errors, setErrors] = useState<Record<string, string>>({});
  const whatsAppConfigured = Boolean(whatsapp(config));
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget,
      formData = new FormData(form);
    const payload = {
      name: String(formData.get('name')).trim(),
      phone: String(formData.get('phone')).trim(),
      email: String(formData.get('email')).trim(),
      message: String(formData.get('message')).trim(),
      consent: formData.get('consent') === 'on',
      website: String(formData.get('website') || ''),
      ...(brand ? { brandId: Number(brand) } : {}),
      ...(model ? { modelId: Number(model) } : {}),
    };
    const fieldErrors: Record<string, string> = {};
    if (payload.name.length < 2 || payload.name.length > 100)
      fieldErrors.name = 'Escribe entre 2 y 100 caracteres.';
    if (
      !/^[+\d\s().-]+$/.test(payload.phone) ||
      payload.phone.replace(/\D/g, '').length < 7 ||
      payload.phone.replace(/\D/g, '').length > 15
    )
      fieldErrors.phone = 'Escribe entre 7 y 15 dígitos.';
    if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email))
      fieldErrors.email = 'Revisa el correo.';
    if (payload.message.length < 10 || payload.message.length > 2000)
      fieldErrors.message = 'Escribe entre 10 y 2000 caracteres.';
    if (!payload.consent) fieldErrors.consent = 'Debes autorizar el tratamiento de tus datos.';
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length) {
      setStatus('Revisa los campos señalados.');
      form.querySelector<HTMLElement>(`[name="${Object.keys(fieldErrors)[0]}"]`)?.focus();
      return;
    }
    const catalog = catalogState.data || emptyCatalog;
    const selectedBrand = catalog.brands.find((item) => String(item.id) === brand);
    const selectedModel = catalog.models.find(
      (item) => String(item.id) === model && String(item.brand_id) === brand,
    );
    const url = createContactWhatsAppUrl(config.whatsappNumber, config.whatsappMessage, {
      ...payload,
      brand: selectedBrand?.name,
      model: selectedModel?.name,
    });
    if (!url) {
      setStatus('El número de WhatsApp del taller todavía no está configurado.');
      return;
    }
    // Es una navegación solicitada por el visitante; no envía correo ni mensajes automáticamente.
    window.location.assign(url);
    return;
  }
  return (
    <>
      <PageMeta title="Contacto" />
      <section className="page-intro">
        <p className="eyebrow">HABLEMOS DE TU PROYECTO</p>
        <h1>
          Todo empieza
          <br />
          <em>con una idea.</em>
        </h1>
        <p>Cuéntanos qué camión tienes y qué te gustaría transformar.</p>
      </section>
      <section className="section contact-layout">
        <aside>
          <h2>
            El primer paso
            <br />
            lo damos conversando.
          </h2>
          <p>Los datos comerciales definitivos se agregarán antes de publicar.</p>
          <dl>
            <dt>Ubicación / zona de atención</dt>
            <dd>{config.location}</dd>
            <dt>Horario</dt>
            <dd>{config.hours}</dd>
            <dt>Teléfono</dt>
            <dd>
              {config.phone ? (
                <a href={'tel:' + config.phone}>{config.phone}</a>
              ) : (
                'Pendiente de configurar'
              )}
            </dd>
            <dt>Correo</dt>
            <dd>
              {config.email ? (
                <a href={'mailto:' + config.email}>{config.email}</a>
              ) : (
                'Pendiente de configurar'
              )}
            </dd>
          </dl>
        </aside>
        <form onSubmit={submit} noValidate>
          <h2>Cuéntanos tu idea</h2>
          <div className="form-grid">
            {[
              ['name', 'Nombre *', 'text'],
              ['phone', 'Teléfono o WhatsApp *', 'tel'],
              ['email', 'Correo electrónico (opcional)', 'email'],
            ].map(([name, label, type]) => (
              <label key={name}>
                {label}
                <input
                  name={name}
                  type={type}
                  autoComplete={name === 'name' ? 'name' : name === 'phone' ? 'tel' : 'email'}
                  maxLength={name === 'name' ? 100 : name === 'email' ? 254 : 40}
                  required={name !== 'email'}
                  aria-invalid={!!errors[name]}
                  aria-describedby={errors[name] ? name + '-error' : undefined}
                />
                {errors[name] && (
                  <span id={name + '-error'} className="field-error">
                    {errors[name]}
                  </span>
                )}
              </label>
            ))}
            <TruckFilters
              catalog={catalogState.data || emptyCatalog}
              brand={brand}
              model={model}
              onBrand={(v) => {
                setBrand(v);
                setModel('');
              }}
              onModel={setModel}
            />
          </div>
          {catalogState.error && (
            <p className="field-error">
              El catálogo no está disponible. Puedes describir tu camión en el mensaje.
            </p>
          )}
          <p className="muted">Si tu camión no aparece, indícalo en el mensaje.</p>
          <label>
            Mensaje *
            <textarea
              name="message"
              rows={5}
              minLength={10}
              maxLength={2000}
              required
              aria-invalid={!!errors.message}
              aria-describedby="message-error"
              placeholder="Mi camión es… y me gustaría…"
            />
            <span id="message-error" className="field-error">
              {errors.message}
            </span>
          </label>
          <div className="honeypot" aria-hidden="true">
            <label>
              Sitio web
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <label className="checkbox">
            <input type="checkbox" name="consent" required aria-invalid={!!errors.consent} />{' '}
            <span>
              Autorizo el tratamiento de mis datos para responder esta solicitud. He leído la{' '}
              <Link to="/privacidad">información de privacidad</Link>.
            </span>
          </label>
          {errors.consent && <p className="field-error">{errors.consent}</p>}
          <p role="status" className="form-status" tabIndex={-1}>
            {status}
          </p>
          <div className="actions contact-submit-actions">
            <button
              className="button lime"
              type="submit"
              name="channel"
              value="whatsapp"
              disabled={!whatsAppConfigured}
              aria-describedby="whatsapp-form-help"
            >
              Continuar por WhatsApp ↗
            </button>
          </div>
          <p id="whatsapp-form-help" className="muted">
            {whatsAppConfigured
              ? 'Se incluirán tu nombre, teléfono, correo si lo indicas, camión y consulta. Se abrirá WhatsApp, un servicio externo, para que revises el mensaje y pulses Enviar.'
              : 'El canal de WhatsApp todavía no está disponible.'}
          </p>
        </form>
      </section>
    </>
  );
}
