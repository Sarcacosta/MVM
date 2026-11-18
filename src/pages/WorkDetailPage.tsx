import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { whatsapp, type Config, type Work } from '../api';
import { LoadingState } from '../components/LoadingState';
import { PageMeta } from '../components/PageMeta';
import { useRemote } from '../hooks/useRemote';

export function WorkDetailPage({ config }: { config: Config }) {
  const { id } = useParams(),
    { data: work, error } = useRemote<Work>('/works/' + id);
  const [activeImageIndex, setActiveImage] = useState<number | null>(null);
  const galleryDialog = React.useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (activeImageIndex !== null) galleryDialog.current?.showModal();
    else galleryDialog.current?.close();
  }, [activeImageIndex]);
  if (!work) return <LoadingState error={error} />;
  const whatsappUrl = whatsapp(config, `#${work.id} — ${work.title}`);
  return (
    <>
      <PageMeta title={work.title} />
      <section className="section detail">
        <Link to="/trabajos" className="text-link dark">
          ← Volver al portafolio
        </Link>
        <div className="detail-heading">
          <div>
            <p className="eyebrow">
              {work.brand} / {work.model} · REF. {work.id}
            </p>
            <h1>{work.title}</h1>
          </div>
          <p>{work.type}</p>
        </div>
        {!!work.demo && (
          <p className="notice">
            Contenido de muestra. Las imágenes son ilustraciones y no corresponden a trabajos
            reales.
          </p>
        )}
        <div className="detail-grid">
          <div>
            <button className="image-button" onClick={() => setActiveImage(0)}>
              <img src={work.images[0]?.url} alt={work.images[0]?.alt} />
              <span>Ampliar imagen ↗</span>
            </button>
            <div className="thumbnails">
              {work.images.map((im, i) => (
                <button
                  key={im.id}
                  onClick={() => setActiveImage(i)}
                  aria-label={'Ampliar ' + im.alt}
                >
                  <img src={im.url} alt={im.alt} loading="lazy" />
                </button>
              ))}
            </div>
          </div>
          <aside>
            <p className="eyebrow">SOBRE ESTA REFERENCIA</p>
            <p>{work.description}</p>
            <dl>
              <dt>Marca</dt>
              <dd>{work.brand}</dd>
              <dt>Modelo</dt>
              <dd>{work.model}</dd>
              <dt>Tipo de trabajo</dt>
              <dd>{work.type}</dd>
            </dl>
            {whatsappUrl ? (
              <a className="button" href={whatsappUrl} target="_blank" rel="noreferrer">
                Consultar por WhatsApp ↗
              </a>
            ) : (
              <>
                <Link className="button" to="/contacto">
                  Consultar esta referencia ↗
                </Link>
                <p className="muted">WhatsApp pendiente de configuración. Referencia #{work.id}.</p>
              </>
            )}
          </aside>
        </div>
        <dialog
          ref={galleryDialog}
          onCancel={() => setActiveImage(null)}
          onClose={() => setActiveImage(null)}
          aria-label="Galería ampliada"
        >
          <button className="close-dialog" onClick={() => setActiveImage(null)}>
            Cerrar ×
          </button>
          {activeImageIndex !== null && (
            <>
              <img
                src={work.images[activeImageIndex].url}
                alt={work.images[activeImageIndex].alt}
              />
              <div className="dialog-controls">
                <button
                  onClick={() =>
                    setActiveImage((activeImageIndex - 1 + work.images.length) % work.images.length)
                  }
                >
                  ← Anterior
                </button>
                <span>
                  {activeImageIndex + 1} / {work.images.length}
                </span>
                <button onClick={() => setActiveImage((activeImageIndex + 1) % work.images.length)}>
                  Siguiente →
                </button>
              </div>
            </>
          )}
        </dialog>
      </section>
    </>
  );
}
