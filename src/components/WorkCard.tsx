import { Link } from 'react-router-dom';
import { type Work } from '../api';

export function WorkCard({ w }: { w: Work }) {
  return (
    <Link className="work-card" to={'/trabajos/' + w.id}>
      <div className="card-image">
        <img
          src={w.images[0]?.url}
          alt={w.images[0]?.alt || 'Referencia de trabajo'}
          loading="lazy"
        />
        {!!w.demo && <span className="sample">MUESTRA</span>}
        <span className="circle-arrow" aria-hidden="true">
          ↗
        </span>
      </div>
      <div className="card-copy">
        <small>
          {w.brand} / {w.model}
        </small>
        <h3>{w.title}</h3>
        <p>{w.type}</p>
      </div>
    </Link>
  );
}
