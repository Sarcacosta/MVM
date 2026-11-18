import carroInicio1 from './img/camion-transparente.png';
import carroInicio2 from './img/camion2.png';
import carroInicio3 from './img/camion3.png';
export interface HomeSlide {
  src: string;
  alt: string;
  caption: string;
  label?: string;
}

export const homeSlides: HomeSlide[] = [
  {
    src: carroInicio1,
    alt: 'Ilustración de camión con defensa y acabados en acero',
    caption: 'Acabados que definen el camino',
    label: 'Ilustración de muestra',
  },
  {
    src: carroInicio2,
    alt: 'Ilustración de camión con detalles metálicos de personalización',
    caption: 'Detalles con identidad propia',
    label: 'Ilustración de muestra',
  },
  {
    src: carroInicio3,
    alt: 'Ilustración de camión con piezas y superficies de acero',
    caption: 'Inspiración para tu próximo proyecto',
    label: 'Ilustración de muestra',
  },
];

export const homeCarouselIntervalMs = 6000;
