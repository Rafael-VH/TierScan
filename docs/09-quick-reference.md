# Referencia Rápida

## Comandos Esenciales

### Supabase CLI

| Comando | Descripción |
|---------|-------------|
| `supabase --version` | Verificar versión |
| `supabase login` | Autenticar |
| `supabase init` | Inicializar proyecto local |
| `supabase link --project-ref <ref>` | Vincular proyecto remoto |
| `supabase status` | Ver estado |
| `supabase db push` | Aplicar migraciones a remoto |
| `supabase db push --yes` | Aplicar sin confirmación |
| `supabase db reset` | Resetear base de datos local |

### GitHub CLI

| Comando | Descripción |
|---------|-------------|
| `gh --version` | Verificar versión |
| `gh auth status` | Verificar autenticación |
| `gh auth login` | Iniciar sesión |

---

## Estructura de Archivos

```
tu-proyecto/
├── .env.example              # Template de variables (commitear)
├── .env.local                # Variables reales (NO commitear)
├── .gitignore                # Excluir .env*.local
├── package.json
├── supabase/
│   ├── config.toml           # Configuración del proyecto
│   ├── .temp/                # Metadatos (NO commitear)
│   └── migrations/           # Migraciones SQL (commitear)
│       ├── 001_initial_schema.sql
│       ├── 002_write_policies.sql
│       └── 003_storage_bucket.sql
├── src/
│   ├── shared/
│   │   └── api/
│   │       └── supabaseClient.ts    # Cliente singleton
│   └── features/
│       └── catalog/
│           ├── api/
│           │   └── mangaRepository.ts  # Data access layer
│           └── data/
│               └── catalog.ts          # Fallback local
└── docs/                     # Documentación
```

---

## Checklist de Configuración Completa

### Paso 1: Verificar CLI Tools

```bash
gh --version
supabase --version
gh auth status
```

### Paso 2: Crear/Vincular Proyecto

```bash
# Opción A: Crear nuevo
supabase projects create --name "Mi Proyecto" --region us-east-2

# Opción B: Vincular existente
supabase link --project-ref <ref>
```

### Paso 3: Crear Migraciones

```bash
mkdir supabase/migrations
# Crear archivos SQL en orden numérico
```

### Paso 4: Aplicar Migraciones

```bash
supabase db push
```

### Paso 5: Configurar Variables

```bash
cp .env.example .env.local
# Editar .env.local con valores reales
```

### Paso 6: Poblar Datos (Seed)

```bash
node seed.mjs
```

### Paso 7: Verificar

```bash
node diagnostic.mjs
# O abrir app en navegador
npm run dev
```

---

## SQL Template: Tabla Completa

```sql
-- Extensión
create extension if not exists pgcrypto;

-- Tabla
create table if not exists public.mi_tabla (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  data jsonb not null default '{}'::jsonb,
  tags text[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices
create index if not exists mi_tabla_status_idx on public.mi_tabla (status);
create index if not exists mi_tabla_slug_idx on public.mi_tabla (slug);
create index if not exists mi_tabla_created_idx on public.mi_tabla (created_at desc);

-- RLS
alter table public.mi_tabla enable row level security;

-- Políticas
create policy "Public read mi_tabla"
on public.mi_tabla for select to anon, authenticated
using (true);

create policy "Anon write mi_tabla"
on public.mi_tabla for insert to anon
with check (true);

create policy "Anon update mi_tabla"
on public.mi_tabla for update to anon
using (true) with check (true);

create policy "Anon delete mi_tabla"
on public.mi_tabla for delete to anon
using (true);
```

---

## JavaScript Template: Cliente Supabase

```javascript
// supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(supabaseUrl && supabaseKey);
export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;
```

---

## JavaScript Template: Repositorio

```javascript
// repository.js
import { supabase, isConfigured } from "./supabaseClient";
import { localData } from "./localData";

export async function loadData() {
  if (!isConfigured || !supabase) {
    return localData;
  }

  const { data, error } = await supabase
    .from("mi_tabla")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data?.length) {
    console.warn("Using local fallback:", error?.message);
    return localData;
  }

  return data;
}
```

---

## JavaScript Template: Seed Script

```javascript
// seed.mjs
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const seedData = [
  // ... datos
];

async function seed() {
  const { data, error } = await supabase
    .from("mi_tabla")
    .insert(seedData)
    .select();

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log(`✅ Inserted ${data.length} rows`);
}

seed();
```

---

## Patrones de Consulta

### SELECT Básico

```javascript
const { data, error } = await supabase
  .from("tabla")
  .select("*");
```

### SELECT con Filtro

```javascript
const { data, error } = await supabase
  .from("tabla")
  .select("*")
  .eq("status", "active")
  .gt("year", 2020);
```

### SELECT con Relación

```javascript
const { data, error } = await supabase
  .from("padres")
  .select("*, hijos(*)");
```

### SELECT con Orden y Límite

```javascript
const { data, error } = await supabase
  .from("tabla")
  .select("*")
  .order("ranking", { ascending: true })
  .limit(10);
```

### COUNT

```javascript
const { count, error } = await supabase
  .from("tabla")
  .select("*", { count: "exact", head: true });
```

### INSERT

```javascript
const { data, error } = await supabase
  .from("tabla")
  .insert([{ name: "Item 1" }, { name: "Item 2" }])
  .select();
```

### UPDATE

```javascript
const { data, error } = await supabase
  .from("tabla")
  .update({ status: "inactive" })
  .eq("id", "uuid-aqui")
  .select();
```

### DELETE

```javascript
const { error } = await supabase
  .from("tabla")
  .delete()
  .eq("id", "uuid-aqui");
```

### UPSERT

```javascript
const { data, error } = await supabase
  .from("tabla")
  .upsert({ slug: "unico", name: "Item" }, { onConflict: "slug" })
  .select();
```

---

## Operadores de Filtro

| Operador | Sintaxis | SQL equivalente |
|----------|----------|-----------------|
| Igualdad | `.eq("col", val)` | `WHERE col = val` |
| No igual | `.neq("col", val)` | `WHERE col <> val` |
| Mayor que | `.gt("col", val)` | `WHERE col > val` |
| Mayor o igual | `.gte("col", val)` | `WHERE col >= val` |
| Menor que | `.lt("col", val)` | `WHERE col < val` |
| Menor o igual | `.lte("col", val)` | `WHERE col <= val` |
| IN | `.in("col", [a, b])` | `WHERE col IN (a, b)` |
| LIKE | `.like("col", "%val%")` | `WHERE col LIKE '%val%'` |
| ILIKE | `.ilike("col", "%val%")` | `WHERE col ILIKE '%val%'` |
| IS NULL | `.is("col", null)` | `WHERE col IS NULL` |
| BETWEEN | `.between("col", a, b)` | `WHERE col BETWEEN a AND b` |

---

## Errores Comunes y Soluciones

| Error | Código | Solución |
|-------|--------|----------|
| Tabla no existe | PGRST205 | Aplicar migraciones |
| RLS bloquea | 42501 | Crear políticas |
| Duplicado | 23505 | Usar upsert o verificar |
| FK inválida | 23503 | Insertar padre primero |
| NOT NULL | 23502 | Proveer valor requerido |
| JWT expirado | - | Regenerar key |
| No configurado | - | Verificar variables .env |

---

## Recursos

- **Supabase Docs**: https://supabase.com/docs
- **Supabase JS Client**: https://supabase.com/docs/reference/javascript/introduction
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Supabase Dashboard**: https://app.supabase.com
