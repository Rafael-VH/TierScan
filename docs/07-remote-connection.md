# Conexión Remota

## Variables de Entorno

### Archivo .env.example

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### Archivo .env.local (no commitear)

```env
VITE_SUPABASE_URL=https://yghrkicevfbcwfafqytk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ Importante:**
- `.env.local` **nunca** se commitea
- `.env.example` **sí** se commitea (sin valores reales)
- El prefijo `VITE_` es necesario para que Vite exponga las variables al cliente

---

## .gitignore

Asegúrate de excluir archivos de entorno:

```gitignore
# Environment
.env
.env.local
.env.*.local
```

---

## Cliente de Supabase

### Creación del Cliente

```typescript
// src/shared/api/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
) as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseKey!) 
  : null;
```

### Degradación Elegante

Si las variables de entorno no están configuradas:
- `isSupabaseConfigured` será `false`
- `supabase` será `null`
- La app debe tener un fallback local

---

## Patrón de Fallback

```typescript
// src/features/catalog/api/mangaRepository.ts
import { supabase, isSupabaseConfigured } from "@/shared/api/supabaseClient";
import { mangaCatalog } from "@/features/catalog/data/catalog";

export async function loadMangaCatalog(): Promise<Manga[]> {
  // Si no hay configuración, usar datos locales
  if (!isSupabaseConfigured || !supabase) {
    return mangaCatalog;
  }

  // Intentar cargar desde Supabase
  const { data, error } = await supabase
    .from("manga_titles")
    .select("*, manga_chapters(*)")
    .order("ranking", { ascending: true });

  // Si hay error, usar datos locales
  if (error) {
    console.warn("Supabase catalog load failed. Falling back to local data.", error.message);
    return mangaCatalog;
  }

  // Si no hay datos, usar datos locales
  if (!data?.length) {
    return mangaCatalog;
  }

  // Transformar y retornar datos de Supabase
  return (data as SupabaseMangaRow[]).map(mapManga);
}
```

---

## Uso en Componente

```tsx
// src/app/AppShell.tsx
import { useState, useEffect } from "react";
import { loadMangaCatalog } from "@/features/catalog/api/mangaRepository";
import { mangaCatalog } from "@/features/catalog/data/catalog";

export function AppShell() {
  const [catalog, setCatalog] = useState(mangaCatalog); // Estado inicial: local

  useEffect(() => {
    async function load() {
      const data = await loadMangaCatalog();
      setCatalog(data);
    }
    load();
  }, []);

  return (
    // ... usar catalog
  );
}
```

---

## Obtener Credenciales

### Desde Dashboard

1. Ve a **Supabase Dashboard → Project Settings → API**
2. Copia:
   - **Project URL**: `https://<ref>.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Desde CLI

```bash
# Obtener referencia del proyecto
cat supabase/.temp/project-ref

# Obtener pooler URL
cat supabase/.temp/pooler-url
```

---

## Tipos de Keys

| Key | Uso | Seguridad |
|-----|-----|-----------|
| `anon` (public) | Cliente web/app | ✅ Seguro exponer en frontend |
| `service_role` (secret) | Backend/servidor | ❌ NUNCA en frontend |

### Service Role Key

```javascript
// ❌ MAL: Usar en el cliente
const supabase = createClient(url, SERVICE_ROLE_KEY);

// ✅ BIEN: Usar en servidor
const adminClient = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY);
```

---

## Verificar Conexión

```javascript
async function testConnection() {
  if (!supabase) {
    console.log("❌ Supabase not configured");
    return;
  }

  const { data, error } = await supabase
    .from("manga_titles")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.log("❌ Connection failed:", error.message);
  } else {
    console.log("✅ Connected! Tables accessible.");
  }
}

testConnection();
```

---

## Configuración por Entorno

### Desarrollo (.env.local)

```env
VITE_SUPABASE_URL=https://yghrkicevfbcwfafqytk.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### Producción (.env.production.local)

```env
VITE_SUPABASE_URL=https://yghrkicevfbcwfafqytk.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### Variables en Vercel/Netlify

Configura las variables en el panel de tu hosting:

| Variable | Valor |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://<ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `tu-anon-key` |

---

## Diagnóstico de Conexión

### Checklist

- [ ] `.env.local` existe y tiene valores
- [ ] `VITE_SUPABASE_URL` comienza con `https://`
- [ ] `VITE_SUPABASE_ANON_KEY` es un JWT válido
- [ ] El proyecto de Supabase está activo
- [ ] Las tablas existen en la base de datos
- [ ] Las políticas RLS permiten acceso

### Problemas Comunes

| Problema | Síntoma | Solución |
|----------|---------|----------|
| Variables no leídas | `isSupabaseConfigured = false` | Verificar prefijo `VITE_` |
| Key inválida | `JWT expired` | Regenerar key en dashboard |
| Tablas no existen | `Could not find table` | Aplicar migraciones |
| RLS bloquea acceso | `violates row-level security` | Verificar políticas |
| Servidor caído | `Failed to fetch` | Verificar estado en dashboard |

---

## Migrar de Local a Remoto

1. Crear proyecto en Supabase
2. Aplicar migraciones de esquema
3. Crear políticas RLS
4. Poblar datos (seed)
5. Crear `.env.local` con credenciales
6. Reiniciar servidor de desarrollo
7. Verificar que carga datos remotos
