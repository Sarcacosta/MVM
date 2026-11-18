import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = 'http://127.0.0.1:' + (process.env.PORT || env.PORT || '3001');
  const proxy = {
    target,
    configure(proxy: any) {
      proxy.on('error', (_error: unknown, _req: unknown, res: any) => {
        if (res && !res.headersSent && typeof res.writeHead === 'function') {
          res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(
            JSON.stringify({
              error:
                'El servidor está iniciando o no está disponible. Comprueba la terminal y vuelve a intentar.',
            }),
          );
        }
      });
    },
  };
  return {
    plugins: [react()],
    server: { strictPort: true, proxy: { '/api': proxy, '/uploads': { target } } },
  };
});
