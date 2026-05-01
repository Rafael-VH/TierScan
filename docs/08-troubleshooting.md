# Solución de Problemas

## Errores de Conexión

### "Failed to fetch"

**Causa:** No se puede conectar al servidor de Supabase.

**Solución:**
1. Verificar URL correcta: `https://<ref>.supabase.co`
2. Verificar que el proyecto está activo en el dashboard
3. Verificar conexión a internet
4. Intentar abrir URL en navegador: `https://<ref>.supabase.co/rest/v1/`

```bash
# Test de conectividad
curl -I https://yghrkicevfbcwfafqytk.supabase.co/rest/v1/
```

### "JWT expired"

**Causa:** La clave anon ha expirado (poco común, expiran en años).

**Solución:**
1. Ve a **Dashboard → Project Settings → API**
2. Copia una nueva clave anon
3. Actualiza `.env.local`

---

## Errores de Base de Datos

### PGRST205: "Could not find the table"

**Causa:** La tabla no existe en la base de datos.

**Solución:**
```bash
# 1. Verificar migraciones
ls supabase/migrations/

# 2. Aplicar migraciones pendientes
supabase db push

# 3. Verificar en dashboard
# Dashboard → Table Editor → ¿Existen las tablas?
```

Si las tablas no existen, el esquema no se ha aplicado.

### PGRST200: "Not Found"

**Causa:** El endpoint REST no se encuentra (proyecto inactivo o URL incorrecta).

**Solución:**
1. Verificar URL del proyecto
2. Verificar que el proyecto está activo
3. Esperar si el proyecto se acaba de crear (~2 minutos)

### 42501: "violates row-level security policy"

**Causa:** RLS está habilitado pero no hay políticas que permitan la operación.

**Solución:**
```bash
# Crear migración con políticas
# Ver docs/04-rls-policies.md

# Aplicar migración
supabase db push
```

Verificar políticas existentes:
```sql
select tablename, policyname, cmd 
from pg_policies 
where schemaname = 'public';
```

### 23505: "duplicate key value violates unique constraint"

**Causa:** Intentas insertar una fila con un valor único que ya existe.

**Solución:**
```javascript
// Opción 1: Usar upsert
const { error } = await supabase
  .from("manga_titles")
  .upsert({ slug: "mi-manga", ...datos }, { onConflict: "slug" });

// Opción 2: Verificar antes de insertar
const { data } = await supabase
  .from("manga_titles")
  .select("id")
  .eq("slug", "mi-manga")
  .single();

if (!data) {
  // Insertar
}
```

### 23503: "foreign key constraint violation"

**Causa:** Intentas insertar una fila con un FK que no existe en la tabla padre.

**Solución:**
1. Asegurarse de insertar padres primero
2. Usar los IDs retornados por la inserción de padres
3. Verificar que los IDs son válidos

### 23502: "null value violates not-null constraint"

**Causa:** Un campo obligatorio (NOT NULL) tiene valor `null`.

**Solución:**
```javascript
// Verificar que todos los campos requeridos están presentes
const { data, error } = await supabase
  .from("manga_titles")
  .insert({
    slug: "mi-manga",
    title: "Mi Manga",      // NOT NULL
    author: "Autor",         // NOT NULL
    origin: "Manga",         // NOT NULL con CHECK
    year: 2024,              // NOT NULL con CHECK
    state: "ongoing",        // NOT NULL con CHECK
    // ... campos opcionales pueden omitirse si tienen DEFAULT
  });
```

---

## Errores de Supabase CLI

### "Docker not available" en Windows

**Causa:** Docker Desktop no está corriendo o no está instalado.

**Solución:**
- Si trabajas con proyecto **remoto**, ignora este error. El CLI puede operar proyectos remotos sin Docker.
- Si necesitas desarrollo **local**, instala Docker Desktop.

```bash
# Verificar que el proyecto está vinculado (funciona sin Docker)
cat supabase/.temp/linked-project.json
```

### "failed to inspect container health"

**Causa:** El CLI intenta verificar contenedores locales de Supabase.

**Solución:**
- Normal en Windows sin Docker.
- Para proyectos remotos, usa comandos con `--workdir`:

```bash
supabase db push --workdir "C:\ruta\al\proyecto"
```

### "unknown flag"

**Causa:** Versión del CLI no soporta ese flag.

**Solución:**
```bash
# Actualizar CLI
# Windows (Scoop)
scoop update supabase

# macOS (Homebrew)
brew upgrade supabase
```

---

## Errores de Variables de Entorno

### `isSupabaseConfigured = false`

**Causa:** Las variables de entorno no se leen correctamente.

**Solución:**
1. Verificar nombre exacto: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
2. El prefijo `VITE_` es obligatorio
3. Reiniciar servidor de desarrollo después de cambiar `.env`:

```bash
# Detener y reiniciar
npm run dev
```

4. Verificar que `.env.local` existe:

```bash
# PowerShell
Test-Path .env.local

# Debe ser True
```

### Variables no disponibles en el cliente

**Causa:** Falta prefijo `VITE_`.

**Solución:**
```env
# ❌ MAL
SUPABASE_URL=https://...

# ✅ BIEN
VITE_SUPABASE_URL=https://...
```

---

## Errores de Storage

### "Bucket not found"

**Causa:** El bucket no existe.

**Solución:**
1. Crear bucket desde el dashboard
2. O aplicar migración de storage

### "new row violates row-level security policy" (Storage)

**Causa:** El bucket existe pero no tiene políticas de acceso.

**Solución:**
```sql
-- Crear políticas para el bucket
create policy "Public Read bucket-name"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'bucket-name');

create policy "Anon insert bucket-name"
on storage.objects
for insert
to anon
with check (bucket_id = 'bucket-name');
```

### "File size exceeds limit"

**Causa:** El archivo supera el límite del bucket.

**Solución:**
1. Aumentar límite en dashboard
2. O comprimir archivo antes de subir

---

## Diagnóstico General

### Verificar Estado Completo

```javascript
// diagnostic.mjs
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(url, key);

async function diagnostic() {
  console.log("=== DIAGNÓSTICO SUPABASE ===\n");

  // 1. Verificar conexión
  const { data: tables, error: tablesError } = await supabase
    .from("pg_tables")
    .select("tablename")
    .eq("schemaname", "public");

  if (tablesError) {
    console.log("❌ No se puede consultar pg_tables (normal con anon key)");
  } else {
    console.log("✅ Tablas encontradas:", tables.map(t => t.tablename));
  }

  // 2. Verificar tablas específicas
  const tablesToCheck = ["manga_titles", "manga_chapters"];
  
  for (const table of tablesToCheck) {
    const { count, error } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });
    
    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: ${count} filas`);
    }
  }

  // 3. Verificar storage
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  
  if (bucketsError) {
    console.log("❌ Storage:", bucketsError.message);
  } else {
    console.log("✅ Buckets:", buckets.map(b => b.name));
  }

  // 4. Verificar RLS
  console.log("\n=== Verificación RLS ===");
  const { data: testInsert, error: insertError } = await supabase
    .from("manga_titles")
    .insert({ 
      slug: "test-diagnostic",
      title: "Test",
      author: "Test",
      origin: "Manga",
      year: 2024,
      state: "ongoing"
    })
    .select();

  if (insertError) {
    console.log("❌ Insert bloqueado:", insertError.message);
  } else {
    console.log("✅ Insert funciona");
    // Limpiar
    await supabase.from("manga_titles").delete().eq("slug", "test-diagnostic");
  }
}

diagnostic().catch(console.error);
```

---

## Checklist de Resolución

Cuando algo no funciona:

- [ ] ¿El proyecto de Supabase está activo?
- [ ] ¿Las variables de entorno están configuradas?
- [ ] ¿Las migraciones se aplicaron correctamente?
- [ ] ¿Las políticas RLS existen?
- [ ] ¿El bucket de storage existe (si aplica)?
- [ ] ¿El servidor de desarrollo se reinició después de cambiar `.env`?
- [ ] ¿No hay errores en la consola del navegador?
- [ ] ¿La URL de Supabase es accesible desde el navegador?
