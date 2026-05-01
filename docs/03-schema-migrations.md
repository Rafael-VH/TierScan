# Migraciones de Esquema

## Qué son las Migraciones

Las migraciones son archivos SQL versionados que definen la estructura de tu base de datos. Cada migración se aplica en orden y Supabase rastrea cuáles ya fueron ejecutadas.

---

## Estructura de una Migración

```sql
-- supabase/migrations/001_initial_schema.sql

-- Extensión necesaria para UUIDs
create extension if not exists pgcrypto;

-- Tabla principal
create table if not exists public.manga_titles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  -- ... más columnas
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tabla relacionada
create table if not exists public.manga_chapters (
  id uuid primary key default gen_random_uuid(),
  manga_id uuid not null references public.manga_titles(id) on delete cascade,
  number numeric(8,2) not null,
  -- ... más columnas
  unique (manga_id, number)
);

-- Índices para rendimiento
create index if not exists manga_titles_ranking_idx on public.manga_titles (ranking asc);
create index if not exists manga_titles_slug_idx on public.manga_titles (slug);
create index if not exists manga_chapters_manga_number_idx on public.manga_chapters (manga_id, number desc);
```

---

## Tipos de Columnas Comunes

### UUIDs
```sql
id uuid primary key default gen_random_uuid()
```
- Genera IDs únicos automáticamente
- Requiere `pgcrypto` o `pgcrypto` extension

### Texto
```sql
title text not null
slug text not null unique
```

### JSONB (datos estructurados)
```sql
status jsonb not null default '{"es":"En emision","en":"Ongoing"}'::jsonb
synopsis jsonb not null default '{}'::jsonb
```
- Ideal para datos localizados o flexibles
- Se puede indexar con GIN

### Arrays
```sql
genres text[] not null default '{}'
demographics text[] not null default '{}'
```

### Numéricos
```sql
rating numeric(2,1) not null default 0 check (rating >= 0 and rating <= 5)
year integer not null check (year >= 1900)
ranking integer not null default 999
```

### Fechas y Timestamps
```sql
last_updated date not null default current_date
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### Checks (validación)
```sql
check (origin in ('Manga', 'Manhwa', 'Manhua'))
check (state in ('ongoing', 'complete'))
check (rating >= 0 and rating <= 5)
```

---

## Foreign Keys

```sql
-- Relación padre-hijo con cascade
manga_id uuid not null references public.manga_titles(id) on delete cascade
```

Opciones de `on delete`:
- `cascade`: Elimina hijos cuando se elimina el padre
- `restrict`: Impide eliminar el padre si tiene hijos
- `set null`: Establece la FK a null

---

## Índices

### Cuándo crear índices
- Columnas usadas en `WHERE`
- Columnas usadas en `ORDER BY`
- Foreign keys frecuentemente consultadas
- Columnas usadas en `JOIN`

### Sintaxis
```sql
create index if not exists nombre_idx on public.tabla (columna asc);
create index if not exists nombre_idx on public.tabla (columna desc);
create index if not exists nombre_idx on public.tabla (col1, col2);
```

### Índice compuesto
```sql
-- Para consultas que filtran por manga_id y ordenan por number
create index if not exists manga_chapters_manga_number_idx 
  on public.manga_chapters (manga_id, number desc);
```

---

## Aplicar Migraciones

### Push a remoto

```bash
supabase db push --workdir "<ruta-del-proyecto>"
```

**Salida:**
```
Connecting to remote database...
Do you want to push these migrations to the remote database?
  • 001_initial_schema.sql

[Y/n] 
Applying migration 001_initial_schema.sql...
NOTICE (42710): extension "pgcrypto" already exists, skipping
Finished supabase db push.
```

### Push automático (sin confirmación)

```bash
supabase db push --yes
```

### Ver estado de migraciones

```bash
supabase db remote commit --workdir "<ruta-del-proyecto>"
```

---

## Reset Local (para desarrollo)

```bash
supabase db reset
```

Esto reinicia la base de datos local aplicando todas las migraciones desde cero.

---

## Ejemplo: Migración Completa

```sql
-- 001_initial_schema.sql

-- Extensiones
create extension if not exists pgcrypto;

-- Tabla: manga_titles
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

-- Tabla: manga_chapters
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

-- Índices
create index if not exists manga_titles_ranking_idx on public.manga_titles (ranking asc);
create index if not exists manga_titles_slug_idx on public.manga_titles (slug);
create index if not exists manga_chapters_manga_number_idx on public.manga_chapters (manga_id, number desc);
```

---

## Convenciones de Nomenclatura

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Tablas | snake_case, plural | `manga_titles`, `manga_chapters` |
| Columnas | snake_case | `created_at`, `total_chapters` |
| Índices | `{tabla}_{columnas}_idx` | `manga_titles_ranking_idx` |
| Foreign Keys | `{tabla}_{columna_ref}_fkey` | `manga_chapters_manga_id_fkey` |
| Checks | `{tabla}_{columna}_check` | `manga_titles_origin_check` |
| Migraciones | `{num}_{descripcion}.sql` | `001_initial_schema.sql` |

---

## Patrones Útiles

### Soft Delete
```sql
deleted_at timestamptz
-- En lugar de eliminar físicamente, establece deleted_at
```

### Audit Columns
```sql
created_by uuid references auth.users(id),
updated_by uuid references auth.users(id),
```

### Default Values
```sql
-- Valores por defecto seguros
status text not null default 'pending'
is_active boolean not null default true
```
