import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodeApiResponse, api } from '../src/api';
test('respuestas vacías o inválidas muestran errores en español', async () => {
  await assert.rejects(decodeApiResponse(new Response('', { status: 503 })), /No se pudo conectar/);
  await assert.rejects(
    decodeApiResponse(new Response('<html>Error<\/html>', { status: 502 })),
    /respuesta no válida/,
  );
  await assert.rejects(
    decodeApiResponse(
      new Response(JSON.stringify({ error: 'Error del servicio' }), { status: 400 }),
    ),
    /Error del servicio/,
  );
  assert.deepEqual(await decodeApiResponse(new Response('{"ok":true}')), { ok: true });
});
test('GET reintenta durante el arranque; POST no se repite', async () => {
  const original = globalThis.fetch;
  let calls = 0;
  try {
    globalThis.fetch = async () => {
      calls++;
      return calls === 1 ? new Response('', { status: 503 }) : new Response('{"ok":true}');
    };
    assert.deepEqual(await api('/config'), { ok: true });
    assert.equal(calls, 2);
    calls = 0;
    globalThis.fetch = async () => {
      calls++;
      return new Response('', { status: 503 });
    };
    await assert.rejects(api('/contact', { method: 'POST', body: '{}' }), /No se pudo conectar/);
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = original;
  }
});
