export interface ContactWhatsAppData {
  name: string;
  phone: string;
  email?: string;
  brand?: string;
  model?: string;
  message: string;
}

/** Solo prepara un enlace. WhatsApp deja el envío final en manos del visitante. */
export function createContactWhatsAppUrl(
  number: string,
  greeting: string,
  contact: ContactWhatsAppData,
): string | null {
  if (!/^[1-9]\d{6,14}$/.test(number)) return null;

  const lines = [
    greeting.trim() || 'Hola, quiero consultar por un trabajo para mi camión.',
    '',
    `Nombre: ${contact.name}`,
    `Teléfono / WhatsApp: ${contact.phone}`,
    ...(contact.email ? [`Correo: ${contact.email}`] : []),
    ...(contact.brand ? [`Marca: ${contact.brand}`] : []),
    ...(contact.model ? [`Modelo: ${contact.model}`] : []),
    '',
    'Mi consulta:',
    contact.message,
  ];

  return `https://wa.me/${number}?text=${encodeURIComponent(lines.join('\n'))}`;
}
