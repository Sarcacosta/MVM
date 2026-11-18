import { Link } from 'react-router-dom';

export function ContactCTA() {
  return (
    <section className="cta">
      <div>
        <p className="eyebrow">DA EL SIGUIENTE PASO</p>
        <h2>
          ¿Qué tienes en mente
          <br />
          para tu camión?
        </h2>
      </div>
      <Link className="button lime" to="/contacto">
        Cuéntanos tu idea ↗
      </Link>
    </section>
  );
}
