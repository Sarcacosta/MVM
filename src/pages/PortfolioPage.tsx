import { useState } from 'react';
import { type Catalog, type Work } from '../api';
import { ContactCTA } from '../components/ContactCTA';
import { LoadingState } from '../components/LoadingState';
import { PageMeta } from '../components/PageMeta';
import { TruckFilters } from '../components/TruckFilters';
import { WorkCard } from '../components/WorkCard';
import { emptyCatalog } from '../data/catalog';
import { useRemote } from '../hooks/useRemote';

export function PortfolioPage() {
  const [brand, setBrand] = useState(''),
    [model, setModel] = useState(''),
    [page, setPage] = useState(1);
  const catalogState = useRemote<Catalog>('/catalog');
  const { data, error } = useRemote<{ items: Work[]; pages: number; total: number }>(
    `/works?brand=${brand}&model=${model}&page=${page}`,
  );
  const clear = () => {
    setBrand('');
    setModel('');
    setPage(1);
  };
  return (
    <>
      <PageMeta title="Trabajos realizados" />
      <section className="page-intro">
        <p className="eyebrow">EXPLORA EL PORTAFOLIO</p>
        <h1>
          El acero tiene
          <br />
          <em>muchas formas.</em>
        </h1>
        <p>Encuentra inspiración para tu marca y modelo de camión.</p>
      </section>
      <section className="section portfolio">
        <div className="filters">
          <TruckFilters
            catalog={catalogState.data || emptyCatalog}
            brand={brand}
            model={model}
            onBrand={(v) => {
              setBrand(v);
              setModel('');
              setPage(1);
            }}
            onModel={(v) => {
              setModel(v);
              setPage(1);
            }}
          />
          <button className="outline" onClick={clear}>
            Limpiar filtros ↺
          </button>
        </div>
        {catalogState.error && <LoadingState error={catalogState.error} />}
        <div className="results-head">
          <p>{data ? `${data.total} referencias` : 'Buscando…'}</p>
          <span>CONTENIDO DE DEMOSTRACIÓN</span>
        </div>
        {!data || error ? (
          <LoadingState error={error} />
        ) : data.items.length ? (
          <div className="work-grid">
            {data.items.map((w) => (
              <WorkCard key={w.id} w={w} />
            ))}
          </div>
        ) : (
          <div className="state">
            <h2>Aún no hay referencias para esta selección.</h2>
            <button onClick={clear}>Ver todos los trabajos</button>
          </div>
        )}
        {data && data.pages > 1 && (
          <nav className="pagination" aria-label="Páginas de trabajos">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              ← Anterior
            </button>
            <span>
              Página {page} de {data.pages}
            </span>
            <button disabled={page >= data.pages} onClick={() => setPage(page + 1)}>
              Siguiente →
            </button>
          </nav>
        )}
      </section>
      <ContactCTA />
    </>
  );
}
