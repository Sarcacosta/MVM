# Cómo iniciar el proyecto

1. Descomprime el ZIP y abre una terminal en la carpeta **lujos-y-aceros-organizado**, donde está `package.json`.
2. Instala todas las dependencias, incluidas las de desarrollo:

```powershell
npm install --include=dev
Copy-Item .env.example .env
npm run dev
```

3. Mantén esa terminal abierta y visita **http://127.0.0.1:5173/**.
4. Para crear tu cuenta de administración, abre otra terminal en la misma carpeta:

```powershell
npm run admin:create
```

Después entra en **http://127.0.0.1:5173/admin**. No hay contraseñas predefinidas.

## Comandos disponibles

| Comando                | Función                                       |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Inicia React y Express juntos                 |
| `npm test`             | Ejecuta pruebas de API y manejo de respuestas |
| `npm run build`        | Revisa TypeScript y compila el frontend       |
| `npm run format`       | Aplica el formato de Prettier                 |
| `npm run format:check` | Comprueba el formato sin modificar archivos   |
| `npm run admin:create` | Crea un administrador desde la terminal       |

## Si no abre

- **concurrently no se reconoce:** ejecuta `npm install --include=dev` en esta carpeta.
- **El servidor no está disponible:** confirma que `npm run dev` siga abierto y que la terminal indique los puertos 3001 y 5173.
- **El puerto 5173 ya está ocupado:** detén la ejecución anterior con Ctrl+C en su terminal. Esta versión evita abrir silenciosamente otro puerto.
- Para detener los servicios, pulsa Ctrl+C en la terminal donde ejecutaste `npm run dev`.

## Qué contiene esta entrega

Código fuente organizado, pruebas, migración inicial, configuración de ejemplo e imágenes locales de demostración. No incluye `node_modules`, contraseñas, `.env`, datos de administradores, archivos subidos ni el sitio compilado: se generan localmente siguiendo estos pasos.

La funcionalidad y los avisos provisionales se mantienen. El correo sigue en modo de prueba hasta configurar SMTP; WhatsApp requiere el número real. La preparación de producción está en `README.md`.

## Cambiar las imágenes del carrusel de inicio

1. Guarda tus fotos en `public/images/` (crea la carpeta si no existe).
2. Abre `src/data/homeSlides.ts`.
3. Cambia cada `src`, `alt` y `caption`. Puedes añadir o quitar entradas de la lista:

```ts
{
  src: '/images/mi-camion.webp',
  alt: 'Camión con defensa de acero pulido',
  caption: 'Personalización y acabados en acero',
}
```

La ruta no lleva `public`. Usa fotos horizontales y deja visible el elemento principal en el centro: el carrusel recorta los bordes para llenar el espacio. Elimina `label: 'Ilustración de muestra'` solo cuando reemplaces esa ilustración por una fotografía real autorizada. Cambia `homeCarouselIntervalMs` para ajustar la duración en milisegundos (6000 equivale a 6 segundos).

El texto de la izquierda sigue en `src/pages/HomePage.tsx`. El componente del carrusel está en `src/components/HeroCarousel.tsx`. No se administra desde el panel de trabajos.

## Tipografía

Toda la interfaz usa Manrope Variable, incluida como dependencia local en `package.json`. Después de actualizar el proyecto ejecuta `npm install --include=dev` para descargarla. Se importa en `src/main.tsx`. La escala de texto y los ajustes adaptables están en `src/style.css`: texto principal de 18 px, controles de 16 px y etiquetas secundarias de 12–14 px. No requiere conexión a Google Fonts.

## Datos del formulario en WhatsApp

El botón Continuar por WhatsApp valida los campos y la autorización, y abre una conversación con el número configurado en WHATSAPP_NUMBER. El mensaje incluye nombre, teléfono, correo opcional, marca y modelo seleccionados por nombre y la consulta. El visitante revisa y envía desde WhatsApp. Esta opción no llama al backend de correo, no copia al portapapeles ni confirma un envío automático. El botón permanece deshabilitado si el número del taller no es válido. Los textos del mensaje se editan en src/utils/contactWhatsApp.ts.

## Paleta de colores

La paleta está centralizada en el primer bloque `:root` de `src/style.css`: marino #203762, azul #315fa7, blanco #ffffff y gris claro #f4f6fa. Cambia las variables --navy, --accent y --surface para ajustar colores globalmente. Las ilustraciones SVG de muestra acompañan la paleta; las fotografías propias se mantienen intactas.

## Reproducción del carrusel

El carrusel del inicio avanza automáticamente cada 6 segundos y no muestra flechas. Los puntos permiten seleccionar una imagen sin desactivar la rotación; al salir de sus controles la reproducción continúa. Se pausa mientras hay foco en sus controles o la pestaña está oculta. Si el dispositivo pide movimiento reducido, no gira automáticamente; los puntos permiten seleccionar cada imagen.

## Fuente de los títulos

Los encabezados h1–h6 usan Work Sans Variable; los textos y controles conservan Manrope. Ambas fuentes se incluyen mediante dependencias locales. Ejecuta `npm install --include=dev` al actualizar esta versión. La fuente de títulos se ajusta con `--font-heading` en `src/style.css`.

## Historia y fotografías de Nosotros

La sección incluye la fundación en 1980 por Virgilio Moreno, el crecimiento, la continuidad de sus hijos y la evolución del logo. El párrafo de presentación se edita en `server/config.ts`, propiedad `about`. Los capítulos y todos los espacios de fotografías se editan en `src/data/aboutStory.ts`.

Guarda fotos en `public/images/historia/` y completa `src` con rutas como `/images/historia/primer-taller.jpg`. Actualiza `alt` y `caption` para describir la foto real. Mientras `src` esté vacío se verá un espacio reservado, sin enlaces rotos. Las fotos se muestran completas con `object-fit: contain`. Hay espacios para el fundador, las tres etapas y los logos antiguo/actual. No se asignan fechas intermedias no confirmadas.
