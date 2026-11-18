import { Link } from 'react-router-dom';
import { type Config, type Work } from '../api';
import { ContactCTA } from '../components/ContactCTA';
import { HeroCarousel } from '../components/HeroCarousel';
import { LoadingState } from '../components/LoadingState';
import { PageMeta } from '../components/PageMeta';
import { WorkCard } from '../components/WorkCard';
import { useRemote } from '../hooks/useRemote';

export function HomePage({ config }: { config: Config }) {
  const { data, error } = useRemote<{ items: Work[] }>('/works?featured=1');
  return (
    <>
      <PageMeta title="" />
      <section className="hero">
        <div className="hero-copy">
          <h1>
            Lujos &
            <br />
            Aceros
            <br />
            <em>Para tu camión</em>
          </h1>
          <p className="hero-description">
            Ideas que toman forma en acero. Explora referencias de lujos y personalización para
            darle a tu camión una identidad propia.
          </p>
          <div className="actions">
            <Link className="button lime" to="/trabajos">
              Explorar trabajos <span>↗</span>
            </Link>
            <Link className="text-link" to="/contacto">
              Hablemos de tu idea →
            </Link>
          </div>
        </div>
        <HeroCarousel />
      </section>
      <div className="material-strip">
        <span>DISEÑADO PARA TU CAMIÓN</span>
        <span>ACERO & PERSONALIZACIÓN</span>
        <span>EL DETALLE MARCA LA DIFERENCIA</span>
      </div>
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">EL TALLER, EN CADA DETALLE</p>
            <h2>
              Acero que transforma.
              <br />
              Detalles que distinguen.
            </h2>
          </div>
          <p>
            Una primera mirada a lo que podemos conversar contigo. La oferta definitiva será
            confirmada por el taller.
          </p>
        </div>
        <div className="services">
          {config.services.map((s, i) => (
            <article key={s.title}>
              <span className="service-index">0{i + 1} /</span>
              {s.image && (
  <img
    className="service-photo"
    src={s.image}
    alt={s.imageAlt || s.title}
    loading="lazy"
  />
)}
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section tinted">
        <div className="section-heading">
          <div>
            <p className="eyebrow">REFERENCIAS PARA INSPIRARTE</p>
            <h2>
              El próximo detalle
              <br />
              empieza aquí.
            </h2>
          </div>
          <Link className="text-link dark" to="/trabajos">
            Ver todo el portafolio ↗
          </Link>
        </div>
        <p className="demo-note">
          Estas ilustraciones y fichas son de demostración. No representan trabajos reales de la
          empresa.
        </p>
        {error || !data ? (
          <LoadingState error={error} />
        ) : (
          <div className="work-grid">
            {data.items.slice(0, 3).map((w) => (
              <WorkCard key={w.id} w={w} />
            ))}
          </div>
        )}
      </section>
      <section className="about-teaser section">
        <p className="eyebrow">DE TU IDEA AL TALLER</p>
        <h2>
          Cada camión tiene una historia.
          <br />
          <em>Conversemos sobre la tuya.</em>
        </h2>
        <Link className="button" to="/nosotros">
          Conoce el proyecto ↗
        </Link>
      </section>
      <ContactCTA />
    </>
  );
}
