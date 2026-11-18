# Verificación de la primera versión

Fecha: 25 de octubre de 2026, America/Bogota. Entorno: Windows, Node 24.22.0, npm 11.19.1, navegador integrado de Codex.

## Comprobaciones ejecutadas

- `npm install`: completado; `package-lock.json` fija el árbol de dependencias. El gestor advierte de la dependencia transitiva prebuild-install; los módulos nativos funcionaron durante las pruebas.
- `npm run build`: comprobación estricta de TypeScript y compilación Vite completadas.
- `npm test`: 5 pruebas aprobadas, 0 fallos. Incluyen catálogo, filtro combinado, incompatibilidad marca/modelo, dos páginas, validación de campos y consentimiento, antispam, idempotencia, fallo del proveedor, rechazo de origen ajeno, autenticación, CSRF, publicación incompleta, subida válida/archivo falso, retirada, integridad de catálogos y cierre de sesión.
- `npm run dev`: API y Vite iniciados correctamente en 3001 y 5173.
- Navegador: Inicio y portafolio cargados; selección Kenworth/T800 mostró 2 referencias; cambiar a Freightliner restableció el modelo y ofreció únicamente Cascadia/M2 con 4 referencias.
- Navegador: formulario completado con datos ficticios, consentimiento inicialmente sin marcar, respuesta visible «Prueba procesada. No se envió ningún correo.» y campos restablecidos.
- Navegador: detalle de referencia 1 abierto, galería modal ampliada y navegación de imagen 1/2 a 2/2, cierre comprobado.
- Navegador: apertura y cierre del menú móvil comprobados.
- Revisión visual en el panel estrecho del navegador integrado; se reservó una franja propia para que el contacto flotante no tape contenido.

Los tests crean su administrador con credenciales aleatorias en una base en memoria; no añaden una cuenta al sitio entregado. Usa `npm run admin:create` para crear tu cuenta.

## Pendientes de verificación externa

No se verificaron recepción SMTP real, apertura de WhatsApp con número definitivo, dominio ni HTTPS público. No se realizó auditoría WCAG completa, medición Lighthouse, matriz exacta 360/768/1440, pruebas en Safari/Firefox/iOS/Android ni restauración en un alojamiento real. La guía explica la preparación de esos pasos. El diseño tiene reglas adaptables para móvil, tableta y escritorio, pero no se atribuye una certificación ni una puntuación de rendimiento.

## Corrección de arranque y respuestas vacías

Se comprobó la respuesta HTTP 200 y JSON válido en /api/config, /api/catalog y /api/works a través de Vite. La portada devuelve HTTP 200. Se añadieron mensajes en español y reintentos de lectura durante el arranque; los envíos POST no se repiten automáticamente. Vite devuelve un error JSON si el backend está caído y respeta PORT en .env. Pruebas actualizadas: 7 aprobadas, 0 fallos. TypeScript y build Vite completados. Esta corrección se verificó por HTTP y pruebas automatizadas; la revisión visual del cambio queda pendiente.

## Entrega de código organizado — 4 de noviembre de 2026

Frontend separado en páginas, componentes y hook de carga. Backend separado en módulos de rutas y almacén de sesiones. Se mantienen los flujos de la versión anterior. Compilación TypeScript/Vite y 7 pruebas automatizadas aprobadas tras la separación. Esta entrega verifica la reorganización mediante compilación y pruebas; no incorpora una nueva auditoría visual o de producción.

## Carrusel de portada

Se añadió HeroCarousel con flechas, indicadores, reproducción/pausa, control con flechas del teclado y pausa al interactuar o dejar la pestaña. Respeta movimiento reducido al iniciar. Las imágenes, textos y duración se configuran en src/data/homeSlides.ts. Compilación TypeScript/Vite correcta y 7 pruebas existentes aprobadas. El build informa un aviso de tamaño del bundle; la revisión visual del carrusel en navegador queda pendiente.

## Ajuste de tipografía y legibilidad

Se sustituyó Arial por Manrope Variable alojada en el propio proyecto, se aumentó el texto principal a 18 px y los controles a 16 px, con etiquetas secundarias de 12–14 px. Se ajustaron interlineado, tamaños móviles y navegación compacta hasta 1100 px. Se añadieron las declaraciones vite/client necesarias para importar imágenes locales. Compilación TypeScript/Vite aprobada; revisión visual de esta nueva escala pendiente.

## Consulta del formulario por WhatsApp

Se añadió la opción de preparar el mensaje con datos del formulario después de validar campos y consentimiento. Compilación TypeScript/Vite aprobada. Se ejecutaron 5 pruebas de cliente (incluidas 3 nuevas sobre datos, codificación y destinatario de WhatsApp), todas aprobadas. No se envió un mensaje real ni se verificó en una aplicación WhatsApp externa.

## Paleta azul con fondos claros

Paleta centralizada en variables CSS: marino #203762, azul #315fa7 y superficies blancas/gris claro. Se actualizaron colores públicos y administrativos, controles e ilustraciones SVG de demostración. Fotos propias conservadas. Compilación TypeScript/Vite aprobada y referencias de variables CSS comprobadas. Revisión visual en navegador pendiente.

## Historia de MVM en Nosotros

Se redactó la historia a partir de los datos proporcionados: fundación en 1980 por Virgilio Moreno, crecimiento y mejora de productos, cambio de identidad y continuidad con sus hijos. Se añadieron títulos jerarquizados, tres etapas, valores y espacios configurables para fotografías y logos. No se inventaron fechas intermedias ni certificaciones. Compilación TypeScript/Vite aprobada; revisión visual en navegador pendiente.
