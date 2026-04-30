# Tier Scan

Lector web de manga, manhwa y manhua construido con React, Vite, TypeScript, Tailwind CSS v4 y soporte para Supabase. La app puede leer datos reales desde Supabase y, si no hay variables de entorno configuradas o ocurre un error, usa automaticamente el catalogo local de demostracion.

## Caracteristicas

- Interfaz responsive para movil, tablet y escritorio.
- Soporte de UI en Espanol, English, Portugues, Francais y Nihongo romanizado.
- Catalogo, busqueda, ranking, pagina de detalles y lector de capitulos.
- Lector online con modo webtoon y modo por pagina.
- Carga de manga y capitulos desde Supabase mediante `@supabase/supabase-js`.
- Fallback local en `src/features/catalog/data/catalog.ts` para desarrollo offline.
- Arquitectura limpia por capas: `app`, `entities`, `features`, `shared` y `utils`.

## Stack

- React 19
- Vite 7
- TypeScript
- Tailwind CSS v4
- Supabase JavaScript Client

## Configuracion

1. Crea un proyecto en Supabase.
2. Ejecuta el SQL de la seccion `SQL para Supabase`.
3. Copia `.env.example` a `.env.local`.
4. Coloca tus credenciales publicas de Supabase.

```bash
cp .env.example .env.local
```

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-or-publishable-key
```

## Como ejecutar

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev`: inicia el servidor de desarrollo.
- `npm run build`: genera la version de produccion.
- `npm run preview`: sirve localmente la version compilada.

## Estructura

```text
src/
  app/
    AppShell.tsx
  entities/
    manga/
      model.ts
  features/
    catalog/
      api/
        mangaRepository.ts
      components/
        HeroSpotlight.tsx
        LibraryShelf.tsx
        MangaDetails.tsx
        RankingPanel.tsx
      data/
        catalog.ts
    reader/
      components/
        ReaderPanel.tsx
  shared/
    api/
      supabaseClient.ts
    components/
      CoverArt.tsx
    i18n/
      translations.ts
    layout/
      TopNavigation.tsx
  utils/
    cn.ts
```

## Flujo de datos

- `src/shared/api/supabaseClient.ts` crea el cliente de Supabase si existen variables de entorno.
- `src/features/catalog/api/mangaRepository.ts` consulta `manga_titles` junto con `manga_chapters`.
- El repositorio transforma los nombres snake_case de Supabase al modelo interno en camelCase.
- Si Supabase no esta configurado, retorna `mangaCatalog` desde `src/features/catalog/data/catalog.ts`.

## Tablas de Supabase

La app usa dos tablas principales:

- `manga_titles`: informacion general del manga/manhwa/manhua.
- `manga_chapters`: capitulos relacionados a cada manga.

### SQL para Supabase

Ejecuta este script en el SQL Editor de Supabase.

```sql
create extension if not exists pgcrypto;

create table if not exists public.manga_titles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  alt_title text,
  author text not null,
  artist text,
  origin text not null check (origin in ('Manga', 'Manhwa', 'Manhua')),
  year integer not null check (year >= 1900),
  state text not null check (state in ('ongoing', 'complete')),
  status jsonb not null default '{"es":"En emision","en":"Ongoing","pt":"Em lancamento","fr":"En cours","ja":"Renzoku chu"}'::jsonb,
  safety text not null default 'Safe',
  genres text[] not null default '{}',
  demographics text[] not null default '{}',
  languages text[] not null default '{es}',
  synopsis jsonb not null default '{}'::jsonb,
  color_from text not null default '#0f172a',
  color_to text not null default '#334155',
  accent text not null default '#fbbf24',
  ranking integer not null default 999,
  reads text not null default '0',
  rating numeric(2,1) not null default 0 check (rating >= 0 and rating <= 5),
  rating_count text not null default '0',
  bookmarks text not null default '0',
  views text not null default '0',
  total_chapters integer not null default 0,
  last_updated date not null default current_date,
  source text,
  scan_group text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.manga_chapters (
  id uuid primary key default gen_random_uuid(),
  manga_id uuid not null references public.manga_titles(id) on delete cascade,
  number numeric(8,2) not null,
  title jsonb not null default '{}'::jsonb,
  pages integer not null default 1 check (pages > 0),
  page_images text[] not null default '{}',
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  updated_at date not null default current_date,
  created_at timestamptz not null default now(),
  unique (manga_id, number)
);

create index if not exists manga_titles_ranking_idx on public.manga_titles (ranking asc);
create index if not exists manga_titles_slug_idx on public.manga_titles (slug);
create index if not exists manga_chapters_manga_number_idx on public.manga_chapters (manga_id, number desc);

alter table public.manga_titles enable row level security;
alter table public.manga_chapters enable row level security;

create policy "Public read manga titles"
on public.manga_titles
for select
to anon, authenticated
using (true);

create policy "Public read manga chapters"
on public.manga_chapters
for select
to anon, authenticated
using (true);
```

## Estructura JSON esperada

Supabase devuelve las filas como JSON. La consulta principal usa esta forma:

```ts
supabase
  .from("manga_titles")
  .select("*, manga_chapters(*)")
  .order("ranking", { ascending: true });
```

### JSON de `manga_titles`

```json
{
  "id": "7ef7a19b-f99a-49dc-b920-74d1a9cf8a90",
  "slug": "mizu-zokusei",
  "title": "Mizu Zokusei no Mahoutsukai",
  "alt_title": "Water Attribute Magician",
  "author": "Kubo Tadashi",
  "artist": "Bokutengou",
  "origin": "Manga",
  "year": 2024,
  "state": "ongoing",
  "status": {
    "es": "En emision",
    "en": "Ongoing",
    "pt": "Em lancamento",
    "fr": "En cours",
    "ja": "Renzoku chu"
  },
  "safety": "Safe",
  "genres": ["Adventure", "Magic", "Fantasy", "Isekai"],
  "demographics": ["Shonen"],
  "languages": ["es", "en", "fr"],
  "synopsis": {
    "es": "Un mago de agua explora ruinas hundidas mientras protege a una aprendiz.",
    "en": "A water mage explores sunken ruins while protecting an apprentice.",
    "pt": "Um mago da agua explora ruinas submersas enquanto protege uma aprendiz.",
    "fr": "Un mage de l'eau explore des ruines englouties en protegeant une apprentie.",
    "ja": "Mizu no mahotsukai ga shizunda iseki wo aruku."
  },
  "color_from": "#0ea5e9",
  "color_to": "#a855f7",
  "accent": "#38bdf8",
  "ranking": 7,
  "reads": "980K",
  "rating": 4.5,
  "rating_count": "8.3K",
  "bookmarks": "22.1K",
  "views": "1.2M",
  "total_chapters": 13,
  "last_updated": "2026-01-16",
  "source": "AlphaPolis",
  "scan_group": "PyonScans"
}
```

### JSON de `manga_chapters`

```json
{
  "id": "db3fe8ca-c65e-4a72-9d38-028bfa31f44f",
  "manga_id": "7ef7a19b-f99a-49dc-b920-74d1a9cf8a90",
  "number": 13,
  "title": {
    "es": "Resonancia",
    "en": "Resonance",
    "pt": "Ressonancia",
    "fr": "Resonance",
    "ja": "Resonance"
  },
  "pages": 3,
  "page_images": [
    "https://cdn.example.com/mizu-zokusei/013/001.webp",
    "https://cdn.example.com/mizu-zokusei/013/002.webp",
    "https://cdn.example.com/mizu-zokusei/013/003.webp"
  ],
  "progress": 0,
  "updated_at": "2026-01-16"
}
```

## CSV para cargar nuevos mangas

Puedes importar CSV desde el Table Editor de Supabase. Para columnas `jsonb` usa JSON escapado dentro de comillas. Para columnas `text[]` puedes usar formato de arreglo de Postgres como `{Action,Fantasy}`.

### CSV para `manga_titles`

```csv
slug,title,alt_title,author,artist,origin,year,state,status,safety,genres,demographics,languages,synopsis,color_from,color_to,accent,ranking,reads,rating,rating_count,bookmarks,views,total_chapters,last_updated,source,scan_group
mizu-zokusei,Mizu Zokusei no Mahoutsukai,Water Attribute Magician,Kubo Tadashi,Bokutengou,Manga,2024,ongoing,"{""es"":""En emision"",""en"":""Ongoing"",""pt"":""Em lancamento"",""fr"":""En cours"",""ja"":""Renzoku chu""}",Safe,"{Adventure,Magic,Fantasy,Isekai}","{Shonen}","{es,en,fr}","{""es"":""Un mago de agua explora ruinas hundidas."",""en"":""A water mage explores sunken ruins."",""pt"":""Um mago da agua explora ruinas submersas."",""fr"":""Un mage de l'eau explore des ruines englouties."",""ja"":""Mizu no mahotsukai ga shizunda iseki wo aruku.""}",#0ea5e9,#a855f7,#38bdf8,7,980K,4.5,8.3K,22.1K,1.2M,13,2026-01-16,AlphaPolis,PyonScans
```

### CSV para `manga_chapters`

Primero necesitas el `id` del manga en `manga_titles`. Puedes obtenerlo con:

```sql
select id, slug from public.manga_titles order by title;
```

Luego usa ese `id` como `manga_id`.

```csv
manga_id,number,title,pages,page_images,progress,updated_at
7ef7a19b-f99a-49dc-b920-74d1a9cf8a90,13,"{""es"":""Resonancia"",""en"":""Resonance"",""pt"":""Ressonancia"",""fr"":""Resonance"",""ja"":""Resonance""}",3,"{https://cdn.example.com/mizu-zokusei/013/001.webp,https://cdn.example.com/mizu-zokusei/013/002.webp,https://cdn.example.com/mizu-zokusei/013/003.webp}",0,2026-01-16
```

## Notas sobre imagenes de capitulos

- `page_images` contiene las URLs de las paginas del capitulo en orden.
- Si `page_images` esta vacio, el lector muestra paginas generadas de demostracion.
- Puedes alojar imagenes en Supabase Storage, Cloudflare R2, S3 o cualquier CDN publico.
- Si usas Supabase Storage, crea un bucket publico o firma URLs desde un backend antes de enviarlas al cliente.

## Roadmap sugerido

- Persistir progreso real de lectura por usuario.
- Agregar autenticacion y biblioteca privada.
- Crear un panel admin para subir mangas, capitulos e imagenes.
- Agregar rutas con React Router para compartir enlaces directos.
- Agregar busqueda remota con filtros en Supabase.

## Licencia

Proyecto preparado como base para repositorio GitHub. Define la licencia segun el uso final del producto.
