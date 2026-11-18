import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Admin } from './admin/Admin';
import { whatsapp, type Config } from './api';
import { LoadingState } from './components/LoadingState';
import { PageMeta } from './components/PageMeta';
import { useRemote } from './hooks/useRemote';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { HomePage } from './pages/HomePage';
import { PortfolioPage } from './pages/PortfolioPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { WorkDetailPage } from './pages/WorkDetailPage';
export function App() {
  const { data: config, error } = useRemote<Config>('/config'),
    [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    setMenuOpen(false);
    document.getElementById('root')?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }, [location.pathname]);
  if (location.pathname.startsWith('/admin')) return <Admin />;
  if (!config) return <LoadingState error={error} />;
  const whatsappUrl = whatsapp(config);
  return (
    <>
      <a className="skip" href="#contenido">
        Saltar al contenido
      </a>
      
      <header>
        <Link className="brand" to="/" aria-label={config.name + ' · Inicio'}>
          <span className="brand-mark" aria-hidden="true">
            L<span>/</span>A
          </span>
          <span>
            {config.name}
            <small>Moreno</small>
          </span>
        </Link>
        <button
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? 'Cerrar ×' : 'Menú ☰'}
        </button>
        <nav id="main-nav" className={menuOpen ? 'open' : ''} aria-label="Navegación principal">
          {[
            ['/', 'Inicio'],
            ['/trabajos', 'Trabajos realizados'],
            ['/nosotros', 'Nosotros'],
            ['/contacto', 'Contacto'],
          ].map(([p, t]) => (
            <NavLink end={p === '/'} key={p} to={p}>
              {t}
            </NavLink>
          ))}
        </nav>
        <Link className="header-contact" to="/contacto">
          Hablemos ↗
        </Link>
      </header>
      <main id="contenido">
        <Routes>
          <Route path="/" element={<HomePage config={config} />} />
          <Route path="/trabajos" element={<PortfolioPage />} />
          <Route path="/trabajos/:id" element={<WorkDetailPage config={config} />} />
          <Route path="/nosotros" element={<AboutPage config={config} />} />
          <Route path="/contacto" element={<ContactPage config={config} />} />
          <Route path="/privacidad" element={<PrivacyPage />} />
          <Route
            path="*"
            element={
              <section className="section">
                <PageMeta title="Página no encontrada" />
                <h1>Este camino no existe.</h1>
                <Link className="button" to="/">
                  Volver al inicio
                </Link>
              </section>
            }
          />
        </Routes>
      </main>
      <footer>
        <div>
          <Link className="footer-brand" to="/">
            {config.name}
          </Link>
          <p>Acero. Detalle. Identidad.</p>
          <small>Identidad provisional · Sitio de demostración</small>
        </div>
        <div>
          <Link to="/trabajos">Trabajos realizados</Link>
          <Link to="/nosotros">Nosotros</Link>
          <Link to="/contacto">Contacto</Link>
        </div>
        <div>
          <Link to="/privacidad">Privacidad</Link>
          <Link to="/admin">Administración</Link>
          <p>{config.location}</p>
        </div>
      </footer>
      <div className="floating-wrap">
        {whatsappUrl ? (
          <a className="whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer">
            ◉ WhatsApp ↗
          </a>
        ) : (
          <Link className="whatsapp" to="/contacto">
            ◉ Contacto <small>WhatsApp por configurar</small>
          </Link>
        )}
      </div>
    </>
  );
}
