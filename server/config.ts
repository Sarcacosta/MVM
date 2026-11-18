export const siteConfig = {
  name: 'Métalicas Virgilio',
  tagline: 'Moreno',
  provisional: true,
  location: 'Ubicación por confirmar',
  hours: 'Horario por confirmar',
  email: '',
  phone: '',
  whatsappNumber: process.env.WHATSAPP_NUMBER || '',
  whatsappMessage: 'Hola, quiero consultar sobre un trabajo para mi camión.',
  about:
    'MVM nació en 1980 de la mano de Virgilio Moreno. Con pasión por el oficio y la experiencia adquirida en trabajos anteriores, dio vida a una empresa que fue creciendo y mejorando sus productos. Con el paso del tiempo, sus hijos asumieron la dirección y continuaron su legado con la misma dedicación a la calidad.',
  services: [
    {
      title: 'Trabajos en acero',
      image: '/images/guardapolvo.png',
      text: 'Referencias de piezas y acabados metálicos. Servicios específicos pendientes de confirmar.',
    },
    {
      title: 'Lujos para camiones',
      image: '/images/cocuyo.png',
      text: 'Ideas para darle identidad al vehículo. Cada propuesta requiere revisión del taller.',
    },
    {
      title: 'Personalización',
      image: '/images/camion.png',
      text: 'Una conversación sobre tu camión, tu estilo y el alcance del proyecto.',
    },
  ],
};
