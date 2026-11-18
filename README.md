# Lujos & Aceros — código organizado

Aplicación en español con React + Vite y Node.js + Express, TypeScript en ambos. El nombre es provisional. Las ilustraciones SVG y 14 fichas están marcadas como muestras; no son trabajos reales. No se inventan certificaciones, testimonios ni años de experiencia.

Esta entrega separa páginas, componentes, hooks y rutas del servidor. Consulta `ESTRUCTURA.md` para encontrar cada función y `LEEME_PRIMERO.md` para iniciar el proyecto.

## Requisitos y ejecución

Node.js **24 LTS**, npm y terminal. SQLite se ejecuta dentro del proceso; no necesita servicio independiente. `better-sqlite3` y `sharp` usan binarios nativos: si no hay binario para tu plataforma puede requerirse herramienta de compilación del sistema.

```powershell
cd RUTA\lujos-y-aceros
npm install
Copy-Item .env.example .env
npm run dev
```

Abre **http://127.0.0.1:5173**. API en http://127.0.0.1:3001. Vite reenvía `/api` y `/uploads` al backend, conservando un solo origen para el navegador. Usa `127.0.0.1`, o ajusta `APP_ORIGIN` y el proxy. No hay cuentas preinstaladas.

```powershell
npm run admin:create
```

Ejecuta el comando en terminal interactiva, introduce correo y una contraseña única de 12–72 caracteres (entrada oculta). Se guarda únicamente un hash bcrypt con coste 12. No pases contraseñas como argumentos ni las guardes en código. Accede a `/admin`. No hay registro público. Si pierdes acceso, crea otra cuenta desde una terminal autorizada y revoca la anterior directamente en la base bajo un procedimiento de mantenimiento.

```powershell
npm test
npm run build
npm start
```

Después del build, Express sirve también `dist` en el puerto 3001. Para esta modalidad configura `APP_ORIGIN=http://127.0.0.1:3001`. `npm start` ejecuta el servidor TypeScript mediante tsx; no necesita un build separado del backend. Mantén instaladas las dependencias de desarrollo si usas este comando. Para un despliegue con dependencias de producción únicamente, mueve tsx a dependencies o compila el backend y ajusta start.

## Organización y datos

- `src/`: interfaz pública, filtros, detalles ampliables, contacto y panel.
- `server/app.ts`: configuración de Express, seguridad y registro de rutas.
- `server/routes/`: API pública, contacto, autenticación, trabajos, catálogos e imágenes.
- `server/session-store.ts`: persistencia de sesiones en SQLite.
- `server/config.ts`: identidad, servicios, historia y canales editables.
- `server/migrations/001_initial.sql`: esquema inicial idempotente, aplicado al abrir la base.
- `server/db.ts`: SQLite, migración y semilla inicial si el catálogo está vacío.
- `public/samples/`: ilustraciones locales originales de muestra.
- `tests/`: pruebas de API con base aislada en memoria.
- `data/site.sqlite` y `uploads/`: datos locales generados, excluidos de Git.

Relaciones: Marca 1→N Modelo 1→N Trabajo 1→N Imagen. La marca del trabajo se deriva del modelo. Administrador almacena correo y hash. Sesiones se guardan en SQLite y caducan en 8 horas. `deliveries` guarda identificadores y huellas HMAC de envíos hasta 24 horas; no almacena solicitudes ni sus textos. Las relaciones impiden borrar marcas/modelos utilizados. Para futuras migraciones incrementales añade un registro de versiones y ejecútalas transaccionalmente antes de iniciar; la primera versión usa un único esquema inicial.

## Funciones

Inicio, portafolio paginado a 12 resultados, filtros dependientes (cambiar marca limpia modelo), estados de carga/error/sin resultados, detalle con galería modal y consulta por referencia, Nosotros, Contacto, Privacidad y página no encontrada. Menú móvil, foco visible, etiquetas, carga diferida y metadatos por ruta. Todo el entorno está marcado `noindex`.

El panel permite crear borradores, editar, publicar, retirar y destacar trabajos; añadir/renombrar/eliminar marcas y modelos sin romper relaciones; subir hasta 12 imágenes por trabajo, ordenar, elegir portada y editar textos alternativos. No se publica un trabajo incompleto. El contenido de demostración conserva su etiqueta al editarlo; crea fichas nuevas para trabajos reales. Los trabajos se retiran cambiando su estado. El botón Eliminar foto quita la imagen de la ficha y reasigna la portada si es necesario. Un trabajo publicado debe conservar una foto. Los archivos de imagen se conservan en disco.

## Correo y WhatsApp

`MAIL_MODE=test` valida el flujo y responde explícitamente que **no se envió ningún correo**. No hay buzón de prueba que guarde mensajes. Para enviar realmente:

1. Usa `MAIL_MODE=smtp` y configura host, puerto, TLS, usuario y contraseña del proveedor mediante variables de entorno.
2. Configura `MAIL_FROM` con remitente autorizado y `MAIL_TO` con buzón real. No uses datos de visitantes como remitente.
3. Valida DNS/remitente con el proveedor y realiza una prueba autorizada verificando recepción y spam. Un 200 significa aceptación técnica del proveedor, no lectura ni entrega garantizada.
4. El fallo del proveedor responde 502 y conserva el formulario. El servidor no registra nombres, teléfonos, mensajes ni contraseñas.

Configura `WHATSAPP_NUMBER` con código de país y solo dígitos (sin `+`). Mensaje inicial editable en `server/config.ts`. Sin número se muestra acceso a Contacto con aviso; no se abre un destinatario ficticio. En cada detalle la referencia se añade al mensaje. El visitante revisa y envía desde WhatsApp. La barra inferior reserva su propio espacio y deja accesible el resto de controles.

## Seguridad y operación

Cookie HttpOnly, SameSite=Lax, Secure en producción; regeneración al iniciar sesión, invalidación al salir, CSRF para operaciones administrativas, comprobación de origen, CORS limitado, Helmet y CSP. Sesión persistente en SQLite, sin MemoryStore. Límites por IP para login y formulario, campo trampa y clave de idempotencia para doble envío. El formulario no guarda datos en almacenamiento del navegador. Las imágenes se validan por MIME y por decodificación real, máximo 10 MB y 40 megapíxeles; se recodifican a WebP de hasta 1600 px sin metadatos y con nombres aleatorios.

El límite por IP en memoria es apropiado para desarrollo y una sola instancia; para varias réplicas usa un almacén compartido (Redis u otro compatible). Ajusta `trust proxy` al número exacto de proxies de confianza: la configuración inicial espera uno en producción. Evita exponer el puerto directamente detrás de un proxy no validado. Cambia el bind de `127.0.0.1` de `server/index.ts` solo si tu plataforma lo exige.

El modo SMTP es obligatorio en producción; configura `SESSION_SECRET` aleatorio de al menos 32 caracteres. Cambiar el secreto invalida cookies y huellas previas. No incluyas `.env`, base de datos ni uploads en el repositorio. Usa HTTPS con proxy de confianza, backups y límites de cuerpo/tiempos en el proxy. No se hace auditoría de accesibilidad ni prueba de penetración certificada.

## Sustituir muestras y publicar

1. En `server/config.ts`, reemplaza nombre, textos, servicios, teléfono, correo, ubicación y horario; actualiza marca tipográfica en `src/main.tsx`, panel, títulos y `index.html`. Elimina los avisos de demostración únicamente cuando todo sea real y aprobado.
2. En el panel retira las 14 fichas de muestra y crea fichas nuevas con fotografías autorizadas. Los SVG son marcadores locales; comprueba imágenes, textos alternativos, portada y relación marca/modelo.
3. Valida privacidad según operación y ubicación: responsable, finalidades, base, destinatarios, conservación y atención de derechos. La versión incluida es provisional.
4. Verifica WhatsApp y una entrega real de correo. No se ha contratado dominio, hosting ni correo ni publicado el sitio.
5. Para un servidor único con disco persistente, SQLite WAL funciona como opción sencilla. Monta `data/` y `uploads/` en volumen persistente con permisos mínimos. Para varias instancias migra a PostgreSQL y almacenamiento de objetos: sustituye acceso SQL, sesiones, idempotencia y subida de imágenes por adaptadores compartidos; no copies SQLite a un disco de red como mecanismo de concurrencia.
6. Haz backups diarios con la API de backup de SQLite (no copies únicamente el archivo con WAL activo), copia uploads con el mismo punto de consistencia, cifra respaldos y conserva al menos 7 días. Antes de producción prueba restauración en directorio aislado: inicia con DB_PATH/UPLOAD_DIR restaurados, comprueba catálogo, login y fotografías. Esta prueba operativa depende del destino y queda pendiente.
7. Solo al aprobar contenido real, elimina noindex del HTML y la cabecera de API si procede, añade canonical, sitemap.xml y robots.txt con el dominio real. En desarrollo robots.txt bloquea rastreo. Para SEO de cada detalle en redes sociales será conveniente prerender/SSR: esta primera versión actualiza metadatos en cliente.
8. Ejecuta pruebas y build, revisa 360/768/1440 px, teclado y dispositivos reales; mide rendimiento móvil con tres corridas de Lighthouse. Configura monitorización sin datos personales, rotación de secretos y actualización de dependencias.

## Límites de esta entrega

Funciona localmente con muestras y correo simulado. El envío/recepción real, número de WhatsApp, validación legal, marca y fotos definitivas, dominio, HTTPS público, restauración en hosting, pruebas en Safari/iOS/Android y objetivos Lighthouse dependen de configuraciones o equipos externos. Consulta `VERIFICACION.md` para las comprobaciones ejecutadas en esta entrega.
