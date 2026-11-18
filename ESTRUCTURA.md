# Guía del código

## Carpetas

```text
lujos-y-aceros-organizado/
├── src/                         # Frontend React
│   ├── main.tsx                 # Arranque y BrowserRouter
│   ├── App.tsx                  # Navegación, layout público y rutas
│   ├── api.ts                   # Cliente HTTP, reintentos y tipos compartidos
│   ├── style.css                # Estilos globales y adaptación a pantallas
│   ├── admin/
│   │   └── Admin.tsx            # Sesión y edición administrativa
│   ├── components/              # Elementos reutilizables
│   │   ├── HeroCarousel.tsx        # Carrusel de portada
│   │   ├── ContactCTA.tsx
│   │   ├── LoadingState.tsx
│   │   ├── PageMeta.tsx
│   │   ├── TruckFilters.tsx
│   │   └── WorkCard.tsx
│   ├── hooks/
│   │   └── useRemote.ts         # Carga de datos y estados de error
│   ├── data/
│   │   ├── homeSlides.ts          # Imágenes y textos del carrusel
│   │   └── catalog.ts           # Catálogo vacío mientras carga la API
│   └── pages/                   # Una página por archivo
│       ├── HomePage.tsx
│       ├── PortfolioPage.tsx
│       ├── WorkDetailPage.tsx
│       ├── AboutPage.tsx
│       ├── ContactPage.tsx
│       └── PrivacyPage.tsx
├── server/                      # Backend Express
│   ├── index.ts                 # Inicio del servidor y cierre de SQLite
│   ├── app.ts                   # Seguridad, sesiones y registro de rutas
│   ├── context.ts               # Dependencias de los módulos de rutas
│   ├── config.ts                # Datos comerciales y textos provisionales
│   ├── db.ts                    # Conexión, esquema y datos de muestra
│   ├── session-store.ts         # Almacén de sesiones
│   ├── validation.ts            # Esquemas Zod
│   ├── create-admin.ts          # Alta por terminal, sin registro público
│   ├── migrations/
│   │   └── 001_initial.sql      # Tablas, relaciones e índices
│   └── routes/
│       ├── public.ts            # Configuración, catálogo y portafolio públicos
│       ├── contact.ts           # Validación, antispam, idempotencia y correo
│       ├── auth.ts              # Login, sesión, logout y barrera administrativa
│       ├── works.ts             # Creación, edición y publicación de trabajos
│       ├── catalog.ts           # Gestión de marcas y modelos
│       └── images.ts            # Validación, subida, portada y orden
├── tests/                       # Pruebas automatizadas
├── public/                      # Ilustraciones locales y robots.txt
├── .env.example                 # Variables de configuración sin secretos
├── .editorconfig                # Codificación e indentación del editor
├── .prettierrc.json              # Reglas de formato
└── package.json                 # Dependencias y comandos
```

## Dónde cambiar cada cosa

| Necesitas cambiar…                         | Archivo                             |
| ------------------------------------------ | ----------------------------------- |
| Imágenes y duración del carrusel de inicio | `src/data/homeSlides.ts`            |
| Nombre, servicios y datos del negocio      | `server/config.ts`                  |
| Credenciales de correo y número WhatsApp   | `.env`, creado desde `.env.example` |
| Menú, enlaces y rutas públicas             | `src/App.tsx`                       |
| Contenido de una sección                   | Su archivo en `src/pages/`          |
| Filtros compartidos de camión              | `src/components/TruckFilters.tsx`   |
| Comunicación con el backend                | `src/api.ts`                        |
| Apariencia y tamaños de pantalla           | `src/style.css`                     |
| Reglas de validación del servidor          | `server/validation.ts`              |
| Correo y solicitudes de contacto           | `server/routes/contact.ts`          |
| Reglas para publicar trabajos              | `server/routes/works.ts`            |
| Fotografías y sus límites                  | `server/routes/images.ts`           |

## Flujo de una solicitud

La página usa `api.ts` para llamar a `/api`. Durante desarrollo Vite reenvía la solicitud a Express. `server/app.ts` aplica la seguridad común y registra las rutas. El módulo correspondiente valida datos, usa SQLite o el proveedor de correo y devuelve una respuesta JSON.

El registro de autenticación precede a las rutas administrativas: `auth.ts` instala la comprobación de sesión y CSRF antes de registrar trabajos, catálogos e imágenes. Conserva ese orden al añadir módulos.

## Criterios de organización

- Páginas y componentes reutilizables en archivos separados.
- Nombres de funciones, estados y setters más descriptivos.
- Rutas de Express separadas por responsabilidad.
- Formato uniforme de dos espacios, saltos de línea y bloques legibles con Prettier.
- Datos de ejecución y secretos excluidos de la entrega.

Los nombres técnicos del código están en inglés; los textos públicos y la documentación están en español. `Admin.tsx` conserva la edición administrativa en un solo módulo para mantener juntos sus estados y acciones; las páginas públicas están separadas individualmente.
