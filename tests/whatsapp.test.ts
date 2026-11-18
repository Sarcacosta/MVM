import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createContactWhatsAppUrl } from '../src/utils/contactWhatsApp';

test('WhatsApp conserva los datos, saltos y caracteres especiales del formulario', () => {
  const link = createContactWhatsAppUrl('573001234567', 'Hola, quiero cotizar.', {
    name: 'Persona de prueba',
    phone: '+57 300 987 6543',
    email: 'prueba@example.test',
    brand: 'Kenworth',
    model: 'T800',
    message: 'Quiero acero & accesorios.\n¿Podemos revisar mi camión?',
  });
  assert.ok(link);
  const url = new URL(link);
  assert.equal(url.origin, 'https://wa.me');
  assert.equal(url.pathname, '/573001234567');
  const message = url.searchParams.get('text')!;
  for (const value of [
    'Persona de prueba',
    '+57 300 987 6543',
    'prueba@example.test',
    'Kenworth',
    'T800',
    'acero & accesorios.\n¿Podemos revisar mi camión?',
  ]) {
    assert.ok(message.includes(value));
  }
  assert.equal(url.searchParams.size, 1);
});

test('campos opcionales vacíos no generan líneas vacías de datos', () => {
  const url = createContactWhatsAppUrl('573001234567', '', {
    name: 'Prueba',
    phone: '3001234567',
    message: 'Consulta de ejemplo.',
  });
  const message = new URL(url!).searchParams.get('text')!;
  assert.ok(!message.includes('undefined'));
  assert.ok(!message.includes('Correo:'));
  assert.ok(!message.includes('Marca:'));
  assert.ok(!message.includes('Modelo:'));
});

test('no prepara un destinatario inexistente o un enlace arbitrario', () => {
  const contact = { name: 'Prueba', phone: '3001234567', message: 'Consulta de ejemplo.' };
  for (const number of ['', '+57 3001234567', 'https://otro.example', '123']) {
    assert.equal(createContactWhatsAppUrl(number, '', contact), null);
  }
});
