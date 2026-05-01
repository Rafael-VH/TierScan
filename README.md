# Tier Scan

Lector web de manga, manhwa y manhua construido con React, Vite, TypeScript, Tailwind CSS v4 y Supabase. La app lee datos reales desde una base de datos remota en Supabase y, si no hay variables de entorno configuradas o ocurre un error, usa automaticamente el catalogo local de demostracion como fallback.

## Caracteristicas

- Interfaz responsive para movil, tablet y escritorio.
- Soporte de UI en Espanol, English, Portugues, Francais y Nihongo romanizado.
- Catalogo, busqueda, ranking, pagina de detalles y lector de capitulos.
- Lector online con modo webtoon y modo por pagina.
- Carga de manga y capitulos desde Supabase mediante `@supabase/supabase-js`.
- Fallback local en `src/features/catalog/data/catalog.ts` para desarrollo offline.
- Arquitectura Feature-Sliced Design (FSD) con capas: `app`, `entities`, `features`, `shared`.
- Base de datos remota en Supabase con 8 mangas y 24 capitulos precargados.
- Row Level Security (RLS) configurado con politicas de lectura publica y escritura.
- Storage bucket para alojamiento de imagenes de capitulos.
- Documentacion completa en `docs/` con guias de configuracion, migraciones y troubleshooting.

## Stack

- React 19
- Vite 7
- TypeScript
- Tailwind CSS v4
- Supabase JavaScript Client (`@supabase/supabase-js`)
- clsx + tailwind-merge (utilidades de clases CSS)

## Configuracion

### 1. Variables de entorno

Copia el archivo de ejemplo y agrega tus credenciales de Supabase:

```bash
cp .env.example .env.local
```

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

> **Nota:** `.env.local` esta excluido de git. Nunca commitees credenciales reales.

### 2. Configurar Supabase

Si es un proyecto nuevo, ejecuta los siguientes pasos:

#### a) Inicializar y vincular proyecto

```bash
supabase init
supabase link --project-ref <tu-project-ref>
```

#### b) Aplicar migraciones

```bash
supabase db push
```

Esto crea las tablas `manga_titles` y `manga_chapters` con indices, constraints y politicas RLS.

#### c) Poblar la base de datos (seed)

Crea un script de seeding o importa datos desde el dashboard de Supabase. Ver `docs/05-seed-database.md` para ejemplos.

#### d) Crear bucket de storage

Desde el dashboard: **Storage → New Bucket → `chapter-pages` (public)**.

## Como ejecutar

```bash
npm install
npm run dev
```

## Scripts

| Comando           | Descripcion                           |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Inicia el servidor de desarrollo      |
| `npm run build`   | Genera la version de produccion       |
| `npm run preview` | Sirve localmente la version compilada |

## Arquitectura

El proyecto sigue **Feature-Sliced Design (FSD)**. Cada capa tiene responsabilidades claras:

```
src/
├── app/                          # App Shell, providers, layout global
│   ├── AppShell.tsx              # Orquestador principal de vistas
│   └── layout/                   # Componentes de layout especificos de la app
│       ├── TopNavigation.tsx     # Barra de navegacion superior
│       └── SideDrawer.tsx        # Menu lateral deslizable
│
├── entities/                     # Modelos de dominio (sin UI, sin API)
│   └── manga/
│       └── model.ts              # Tipos: Manga, Chapter, Locale, etc.
│
├── features/                     # Funcionalidades con UI y logica de negocio
│   ├── catalog/                  # Feature: catalogo de mangas
│   │   ├── api/
│   │   │   └── mangaRepository.ts  # Data access layer (Supabase + fallback)
│   │   ├── components/
│   │   │   ├── HeroSpotlight.tsx   # Slider destacado
│   │   │   ├── HomeSlider.tsx      # Slider principal
│   │   │   ├── LibraryShelf.tsx    # Estante de mangas
│   │   │   ├── MangaDetails.tsx    # Vista de detalle
│   │   │   └── RankingPanel.tsx    # Panel de ranking
│   │   └── data/
│   │       └── catalog.ts          # Catalogo local de fallback (8 mangas)
│   └── reader/                   # Feature: lector de capitulos
│       └── components/
│           └── ReaderPanel.tsx     # Lector con modo webtoon/pagina
│
└── shared/                       # Codigo reutilizable entre features
    ├── api/
    │   └── supabaseClient.ts     # Singleton de Supabase con config check
    ├── components/
    │   └── CoverArt.tsx          # Componente de portada reutilizable
    ├── i18n/
    │   └── translations.ts       # Traducciones en 5 idiomas
    └── utils/
        └── cn.ts                 # Utility para clases CSS (clsx + twMerge)
```

### Reglas de dependencias entre capas

```
app/        → puede importar de todas las capas
features/   → puede importar de entities/ y shared/
shared/     → puede importar de entities/ (solo tipos)
entities/   → no importa de ninguna capa interna
```

## Flujo de datos

1. `AppShell.tsx` inicializa el estado con el catalogo local (`mangaCatalog`).
2. `useEffect` llama a `loadMangaCatalog()` del repositorio.
3. `mangaRepository.ts` verifica si Supabase esta configurado:
   - **Si**: Consulta `manga_titles` con `manga_chapters(*)` y transforma los datos.
   - **No**: Retorna el catalogo local como fallback.
   - **Error**: Retorna el catalogo local como fallback.
4. `setCatalog(loaded)` reemplaza los datos locales con los de Supabase.

```
AppShell.tsx
  │
  ├── useState(mangaCatalog)          ← Estado inicial: fallback local
  │
  └── useEffect()
        │
        └── loadMangaCatalog()
              │
              ├── isSupabaseConfigured?
              │     ├── NO  → return mangaCatalog (local)
              │     └── YES → supabase.from("manga_titles").select("*, manga_chapters(*)")
              │                   ├── error? → return mangaCatalog (local)
              │                   ├── empty? → return mangaCatalog (local)
              │                   └── success → mapManga(row) → Manga[]
              │
              └── setCatalog(loaded)      ← Reemplaza si Supabase OK
```

## Base de datos Supabase

### Tablas

| Tabla            | Filas | Descripcion                                        |
| ---------------- | ----- | -------------------------------------------------- |
| `manga_titles`   | 8     | Informacion general del manga/manhwa/manhua        |
| `manga_chapters` | 24    | Capitulos relacionados a cada manga (3 por titulo) |

### Esquema resumido

#### `manga_titles`

| Columna                                            | Tipo         | Nota                       |
| -------------------------------------------------- | ------------ | -------------------------- |
| `id`                                               | uuid         | PK, auto-generado          |
| `slug`                                             | text         | UNIQUE                     |
| `title`, `alt_title`                               | text         |                            |
| `author`, `artist`                                 | text         |                            |
| `origin`                                           | text         | CHECK: Manga/Manhwa/Manhua |
| `year`                                             | integer      | CHECK >= 1900              |
| `state`                                            | text         | CHECK: ongoing/complete    |
| `status`, `synopsis`                               | jsonb        | Localizacion multi-idioma  |
| `genres`, `demographics`, `languages`              | text[]       |                            |
| `ranking`, `reads`, `rating`, `views`, `bookmarks` | various      | Metricas                   |
| `total_chapters`, `last_updated`                   | integer/date |                            |

#### `manga_chapters`

| Columna                | Tipo           | Nota                           |
| ---------------------- | -------------- | ------------------------------ |
| `id`                   | uuid           | PK                             |
| `manga_id`             | uuid           | FK → manga_titles(id), CASCADE |
| `number`               | numeric(8,2)   |                                |
| `title`                | jsonb          | Localizado                     |
| `pages`, `page_images` | integer/text[] | URLs de paginas                |
| `progress`             | integer        | 0-100%                         |

### Politicas RLS

| Tabla            | Operacion            | Acceso                        |
| ---------------- | -------------------- | ----------------------------- |
| `manga_titles`   | SELECT               | anon, authenticated (publico) |
| `manga_titles`   | INSERT/UPDATE/DELETE | anon (para desarrollo/seed)   |
| `manga_chapters` | SELECT               | anon, authenticated (publico) |
| `manga_chapters` | INSERT/UPDATE/DELETE | anon (para desarrollo/seed)   |

### Consulta principal

```ts
supabase
  .from("manga_titles")
  .select("*, manga_chapters(*)")  // eager-load hijos
  .order("ranking", { ascending: true });
```

### Storage

| Bucket          | Acceso | Uso                              |
| --------------- | ------ | -------------------------------- |
| `chapter-pages` | public | Imagenes de paginas de capitulos |

Estructura de ruta: `chapter-pages/{manga-slug}/ch{number}/{page}.webp`

> **Nota:** El bucket `chapter-pages` debe crearse manualmente desde el dashboard de Supabase.

## Migraciones

Las migraciones estan versionadas en `supabase/migrations/`:

| Migracion                | Contenido                                    |
| ------------------------ | -------------------------------------------- |
| `001_initial_schema.sql` | Tablas, indices, constraints, RLS habilitado |
| `002_write_policies.sql` | Politicas de escritura para anon             |
| `003_storage_bucket.sql` | Configuracion de bucket de storage           |

## Documentacion

Guia completa disponible en `docs/`:

| Archivo                             | Contenido                                 |
| ----------------------------------- | ----------------------------------------- |
| `docs/README.md`                    | Indice de documentacion                   |
| `docs/01-cli-tools-verification.md` | Instalacion de GitHub CLI y Supabase CLI  |
| `docs/02-supabase-project-init.md`  | Vinculacion de proyectos y estructura     |
| `docs/03-schema-migrations.md`      | Creacion de tablas, columnas, migraciones |
| `docs/04-rls-policies.md`           | Row Level Security y patrones de acceso   |
| `docs/05-seed-database.md`          | Scripts de seeding (Node.js, CSV, SQL)    |
| `docs/06-storage-bucket.md`         | Buckets, politicas, subida de archivos    |
| `docs/07-remote-connection.md`      | Variables de entorno, cliente, fallback   |
| `docs/08-troubleshooting.md`        | Errores comunes y soluciones              |
| `docs/09-quick-reference.md`        | Comandos, templates, referencia rapida    |

## Catalogo de ejemplo

El proyecto incluye 8 mangas precargados en la base de datos remota:

| #   | Titulo                                 | Origen | Capitulos | Estado   |
| --- | -------------------------------------- | ------ | --------- | -------- |
| 1   | Watashi no Hatsukoi wa Hazukashisugite | Manga  | 12        | Ongoing  |
| 2   | Nano Machine Reboot                    | Manhwa | 138       | Ongoing  |
| 3   | Eleceed Current                        | Manhwa | 26        | Ongoing  |
| 4   | Fukuu na Ossan no Kekkaijutsu          | Manga  | 11        | Ongoing  |
| 5   | Onikirimaru                            | Manga  | 55        | Complete |
| 6   | Dragon Soul Archives                   | Manga  | 43        | Complete |
| 7   | Mizu Zokusei no Mahoutsukai            | Manga  | 13        | Ongoing  |
| 8   | Record of the Kings                    | Manhwa | 21        | Complete |

## Roadmap

- [ ] Persistir progreso real de lectura por usuario
- [ ] Agregar autenticacion y biblioteca privada
- [ ] Crear panel admin para subir mangas, capitulos e imagenes
- [ ] Agregar rutas con React Router para enlaces directos
- [ ] Agregar busqueda remota con filtros en Supabase
- [ ] Implementar carga real de imagenes al bucket de storage
- [ ] Agregar tests unitarios y de integracion

## Licencia

Proyecto preparado como base para repositorio GitHub. Define la licencia segun el uso final del producto.
