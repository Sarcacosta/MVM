import { useState } from 'react';
import { type Config } from '../api';
import { ContactCTA } from '../components/ContactCTA';
import { PageMeta } from '../components/PageMeta';
import { brandPhotos, founderPhoto, storyChapters, type StoryPhoto } from '../data/aboutStory';

function HistoryPhoto({ photo, logo = false }: { photo: StoryPhoto; logo?: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className={`history-photo${logo ? ' history-photo-logo' : ''}`}>
      {photo.src && !failed ? (
        <img src={photo.src} alt={photo.alt} loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <div className="history-photo-placeholder">
          <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <rect x="6" y="10" width="36" height="28" rx="3" />
            <circle cx="17" cy="20" r="3" />
            <path d="m8 34 10-9 7 6 7-11 9 14" />
          </svg>
          <span className="eyebrow">ARCHIVO FOTOGRÁFICO</span>
          <strong>{photo.label}</strong>
          <span>Espacio reservado para fotografía</span>
        </div>
      )}
      <figcaption>{photo.caption}</figcaption>
    </figure>
  );
}

export function AboutPage({ config }: { config: Config }) {
  return (
    <>
      <PageMeta title="Nosotros · La historia de MVM" />
      <section className="page-intro history-intro">
        <p className="eyebrow">MVM · UNA HISTORIA QUE COMIENZA EN 1980</p>
        <h1>
          Una historia de familia.
          <br />
          <em>Un oficio que sigue adelante.</em>
        </h1>
        <p>
          De la pasión de Virgilio Moreno al compromiso de sus hijos: una empresa que evoluciona
          conservando sus raíces.
        </p>
      </section>

      <section className="section history-founder" aria-labelledby="founder-heading">
        <div className="history-founder-copy">
          <p className="eyebrow">EL ORIGEN DE MVM</p>
          <h2 id="founder-heading">
            Todo empezó con pasión
            <br />y ganas de construir.
          </h2>
          <p>{config.about}</p>
          <p>
            Hablar de MVM es hablar de una familia y de un conocimiento que se transmite. Es
            recordar de dónde venimos y reconocer a quienes han puesto sus manos, su tiempo y su
            dedicación en cada etapa de este camino.
          </p>
          <p className="history-signature">
            Virgilio Moreno <span>Fundador · 1980</span>
          </p>
        </div>
        <HistoryPhoto key={founderPhoto.src} photo={founderPhoto} />
      </section>

      <section className="section tinted history-timeline" aria-labelledby="history-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">RECUERDOS QUE NOS TRAJERON HASTA AQUÍ</p>
            <h2 id="history-heading">
              Nuestra historia,
              <br />
              etapa a etapa.
            </h2>
          </div>
          <p>
            Una mirada a los comienzos, a lo que hemos aprendido y a quienes siguen escribiendo esta
            historia.
          </p>
        </div>
        <ol className="history-chapters">
          {storyChapters.map((chapter, index) => (
            <li className="history-chapter" key={chapter.period}>
              <div className="history-chapter-copy">
                <p className="history-period">
                  <span aria-hidden="true">0{index + 1}</span>
                  {chapter.period}
                </p>
                <h3>{chapter.title}</h3>
                <p>{chapter.text}</p>
              </div>
              <HistoryPhoto key={chapter.photo.src} photo={chapter.photo} />
            </li>
          ))}
        </ol>
      </section>

      <section className="section history-brand" aria-labelledby="identity-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CAMBIAR LA IMAGEN, CONSERVAR EL ORIGEN</p>
            <h2 id="identity-heading">
              Nuestra imagen cambia.
              <br />
              La esencia permanece.
            </h2>
          </div>
          <p>
            El logo también forma parte de nuestros recuerdos. Antes nos representaba otra imagen;
            con el paso del tiempo, nuestra identidad fue cambiando junto con la empresa.
          </p>
        </div>
        <div className="history-brand-grid">
          {brandPhotos.map((photo) => (
            <HistoryPhoto key={photo.label + photo.src} photo={photo} logo />
          ))}
        </div>
      </section>

      <section className="section history-values" aria-labelledby="values-heading">
        <p className="eyebrow">LO QUE QUEREMOS CONSERVAR</p>
        <h2 id="values-heading">
          El legado se cuida
          <br />
          en cada detalle.
        </h2>
        <div className="services">
          {[
            [
              'Pasión por el oficio',
              'Valorar lo aprendido y poner dedicación en el trabajo, como lo hizo Virgilio desde el comienzo.',
            ],
            [
              'Calidad con propósito',
              'Seguir mejorando nuestros productos, con atención a los detalles y a lo que necesitan nuestros clientes.',
            ],
            [
              'Continuidad familiar',
              'Honrar nuestras raíces y sumar nuevas ideas para que la siguiente etapa conserve lo mejor de las anteriores.',
            ],
          ].map(([title, text], index) => (
            <article key={title}>
              <span className="service-index">0{index + 1} /</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <ContactCTA />
    </>
  );
}
