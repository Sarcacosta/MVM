export interface StoryPhoto {
  src: string;
  alt: string;
  label: string;
  caption: string;
}

// Guarda fotos en public/images/historia/ y completa src: '/images/historia/foto.jpg'.
export const founderPhoto: StoryPhoto = {
  src: '',
  alt: 'Virgilio Moreno, fundador de MVM',
  label: 'Virgilio Moreno · El comienzo de nuestra historia',
  caption: 'Un espacio para recordar a quien dio el primer paso.',
};

export const storyChapters = [
  {
    period: '1980',
    title: 'Una idea que nació del oficio.',
    text: 'Virgilio Moreno fundó MVM con la pasión por su trabajo y los conocimientos que había adquirido en experiencias anteriores. Lo aprendido se convirtió en el punto de partida de una empresa propia: un proyecto al que dedicó su esfuerzo, sus ideas y sus ganas de salir adelante.',
    photo: {
      src: '',
      alt: 'Fotografía de los primeros años de MVM',
      label: 'Los primeros años',
      caption: 'Aquí habrá espacio para una fotografía de los inicios o del primer taller.',
    },
  },
  {
    period: 'Con el paso de los años',
    title: 'Crecer también es aprender a mejorar.',
    text: 'La empresa fue encontrando su camino, sobresaliendo y mejorando sus productos. Cada etapa trajo nuevos aprendizajes y oportunidades para cuidar más los detalles. Esa evolución mantuvo un mismo propósito: ofrecer a los clientes productos cada vez mejores y seguir fortaleciendo el oficio que dio origen a MVM.',
    photo: {
      src: '',
      alt: 'Fotografía de una etapa de crecimiento de MVM',
      label: 'El taller en evolución',
      caption: 'Un lugar para recordar trabajos, personas y momentos del crecimiento de MVM.',
    },
  },
  {
    period: 'La siguiente generación',
    title: 'Nuevas manos. La misma esencia.',
    text: 'Con el tiempo, los hijos de Virgilio tomaron las riendas de la empresa y continuaron el camino que él había iniciado. Hoy, ese legado familiar sigue presente en la forma de entender el trabajo: conservar la dedicación de siempre, cuidar la calidad y mantener abiertas las puertas a nuevas ideas para seguir mejorando.',
    photo: {
      src: '',
      alt: 'Fotografía de la familia o del equipo actual de MVM',
      label: 'La familia y el equipo de hoy',
      caption: 'Espacio para una fotografía de quienes continúan esta historia.',
    },
  },
] satisfies { period: string; title: string; text: string; photo: StoryPhoto }[];

export const brandPhotos: StoryPhoto[] = [
  {
    src: '',
    alt: 'Antiguo logo de MVM',
    label: 'Nuestra primera identidad',
    caption: 'El logo que acompañó una etapa de nuestra historia.',
  },
  {
    src: '',
    alt: 'Logo actual de MVM',
    label: 'Nuestra identidad actual',
    caption: 'Una imagen que acompaña la continuidad del legado familiar.',
  },
];
