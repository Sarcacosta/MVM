import { useEffect, useState } from 'react';
import { homeCarouselIntervalMs, homeSlides } from '../data/homeSlides';

/** Carrusel automático de portada, sin flechas ni botón de pausa. */
export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const autoPlay = !reducedMotion;
  const [focused, setFocused] = useState(false);
  const [pageHidden, setPageHidden] = useState(document.hidden);
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const slide = homeSlides[activeIndex];
  const hasMultipleSlides = homeSlides.length > 1;

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onPreferenceChange = () => {
      setReducedMotion(preference.matches);
    };
    const onVisibilityChange = () => setPageHidden(document.hidden);
    preference.addEventListener('change', onPreferenceChange);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      preference.removeEventListener('change', onPreferenceChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!autoPlay || focused || pageHidden || !hasMultipleSlides) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % homeSlides.length);
    }, homeCarouselIntervalMs);
    return () => window.clearInterval(timer);
  }, [autoPlay, focused, pageHidden, hasMultipleSlides, activeIndex]);

  function goToSlide(index: number) {
    setActiveIndex((index + homeSlides.length) % homeSlides.length);
  }

  if (!slide) return null;

  return (
    <section
      className="hero-art hero-carousel"
      aria-label="Imágenes destacadas del inicio"
      aria-roledescription="carrusel"
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          goToSlide(activeIndex + (event.key === 'ArrowLeft' ? -1 : 1));
        }
      }}
    >
      <div
        className="hero-carousel-slide"
        role="group"
        aria-roledescription="diapositiva"
        aria-label={`${activeIndex + 1} de ${homeSlides.length}`}
        aria-live={autoPlay ? 'off' : 'polite'}
      >
        {failedSource === slide.src ? (
          <p className="hero-carousel-fallback">
            No se pudo cargar esta imagen. Prueba con la siguiente.
          </p>
        ) : (
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            fetchPriority={activeIndex === 0 ? 'high' : 'auto'}
            onError={() => setFailedSource(slide.src)}
          />
        )}
        {slide.label && <span className="art-label">{slide.label}</span>}
      </div>

      <div className="hero-carousel-footer">
        <div className="hero-carousel-caption">
          <span>{slide.caption}</span>
          <span>
            {String(activeIndex + 1).padStart(2, '0')} /{' '}
            {String(homeSlides.length).padStart(2, '0')}
          </span>
        </div>
        {hasMultipleSlides && (
          <div className="hero-carousel-controls">
            <div className="hero-carousel-dots" role="group" aria-label="Elegir imagen">
              {homeSlides.map((item, index) => (
                <button
                  key={item.src + index}
                  type="button"
                  className="hero-carousel-dot"
                  aria-label={`Ver imagen ${index + 1}: ${item.caption}`}
                  aria-current={index === activeIndex ? 'true' : undefined}
                  onClick={() => goToSlide(index)}
                >
                  <span />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
