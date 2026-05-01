# Configuración de Storage Bucket

## Qué es Supabase Storage

Supabase Storage permite almacenar archivos (imágenes, videos, documentos) con una API sencilla. Se organiza en **buckets** (contenedores) con políticas de acceso configurables.

---

## Crear Bucket desde Dashboard

### Pasos

1. Ve a **Supabase Dashboard → Storage**
2. Click en **"New Bucket"**
3. Configura:
   - **Name**: `chapter-pages` (sin espacios, solo minúsculas y guiones)
   - **Public**: ✅ Sí (para acceso directo por URL)
   - **File size limit**: `10485760` (10MB)
   - **Allowed MIME types**: `image/png, image/jpeg, image/webp, image/gif`
4. Click en **"Create bucket"**

### Configuración Recomendada para Imágenes de Capítulos

| Configuración | Valor |
|---------------|-------|
| Bucket name | `chapter-pages` |
| Public | `true` |
| File size limit | `10 MB` |
| Allowed MIME types | `image/png, image/jpeg, image/webp, image/gif` |

---

## Crear Bucket vía Migración SQL

```sql
-- 003_storage_bucket.sql

-- Crear bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('chapter-pages', 'chapter-pages', true, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do nothing;
```

**Nota:** La tabla `storage.buckets` puede no ser accesible directamente en migraciones. Si falla, crea el bucket desde el dashboard.

---

## Políticas de Storage

Las políticas de storage funcionan similar a RLS pero para archivos:

### Lectura Pública

```sql
create policy "Public Read chapter-pages"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'chapter-pages');
```

### Subida de Archivos

```sql
create policy "Anon upload chapter-pages"
on storage.objects
for insert
to anon
with check (bucket_id = 'chapter-pages');
```

### Actualización

```sql
create policy "Anon update chapter-pages"
on storage.objects
for update
to anon
using (bucket_id = 'chapter-pages')
with check (bucket_id = 'chapter-pages');
```

### Eliminación

```sql
create policy "Anon delete chapter-pages"
on storage.objects
for delete
to anon
using (bucket_id = 'chapter-pages');
```

---

## Migración Completa de Storage

```sql
-- 003_storage_bucket.sql

-- Crear bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('chapter-pages', 'chapter-pages', true, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

-- Políticas de acceso
create policy "Public Read chapter-pages"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'chapter-pages');

create policy "Anon insert chapter-pages"
on storage.objects
for insert
to anon
with check (bucket_id = 'chapter-pages');

create policy "Anon update chapter-pages"
on storage.objects
for update
to anon
using (bucket_id = 'chapter-pages')
with check (bucket_id = 'chapter-pages');

create policy "Anon delete chapter-pages"
on storage.objects
for delete
to anon
using (bucket_id = 'chapter-pages');
```

Aplicar:

```bash
supabase db push
```

---

## URLs de Objetos

### URL Pública Directa

```
https://<project-ref>.supabase.co/storage/v1/object/public/<bucket-name>/<path>
```

### Ejemplo

```
https://yghrkicevfbcwfafqytk.supabase.co/storage/v1/object/public/chapter-pages/mizu-zokusei/ch013/001.webp
```

### Estructura de Ruta Recomendada

```
chapter-pages/
├── {manga-slug}/
│   ├── ch{number}/
│   │   ├── 001.webp
│   │   ├── 002.webp
│   │   └── ...
│   └── ...
└── ...
```

Ejemplo:
```
chapter-pages/
├── mizu-zokusei/
│   ├── ch001/
│   │   ├── 001.webp
│   │   └── 002.webp
│   └── ch013/
│       ├── 001.webp
│       ├── 002.webp
│       └── 003.webp
└── watashi-first-love/
    └── ch010/
        └── ...
```

---

## Subir Archivos con supabase-js

### Desde Cliente

```javascript
const { data, error } = await supabase.storage
  .from('chapter-pages')
  .upload(`mizu-zokusei/ch013/001.webp`, file, {
    cacheControl: '3600',
    upsert: false
  });

if (error) console.error(error);
else console.log('Uploaded:', data.path);
```

### Desde Node.js

```javascript
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const fileContent = readFileSync("./pages/001.webp");

const { data, error } = await supabase.storage
  .from('chapter-pages')
  .upload(`mizu-zokusei/ch013/001.webp`, fileContent, {
    contentType: 'image/webp',
    upsert: true
  });
```

---

## Listar Archivos

```javascript
const { data, error } = await supabase.storage
  .from('chapter-pages')
  .list('mizu-zokusei/ch013');

if (data) {
  data.forEach(file => {
    console.log(file.name); // 001.webp, 002.webp, etc.
  });
}
```

---

## Eliminar Archivos

```javascript
const { data, error } = await supabase.storage
  .from('chapter-pages')
  .remove(['mizu-zokusei/ch013/001.webp']);
```

---

## Obtener URL Pública

```javascript
const { data } = supabase.storage
  .from('chapter-pages')
  .getPublicUrl('mizu-zokusei/ch013/001.webp');

console.log(data.publicUrl);
// https://.../storage/v1/object/public/chapter-pages/mizu-zokusei/ch013/001.webp
```

---

## URLs Firmadas (para buckets privados)

```javascript
const { data, error } = await supabase.storage
  .from('chapter-pages')
  .createSignedUrl('mizu-zokusei/ch013/001.webp', 3600); // 1 hora

console.log(data.signedUrl);
```

---

## Mejores Prácticas

### Formatos de Imagen

| Formato | Uso | Tamaño |
|---------|-----|--------|
| WebP | Principal (mejor compresión) | ~60KB/página |
| PNG | Solo si necesita transparencia | ~150KB/página |
| JPEG | Alternativa | ~80KB/página |

### Optimización

- **Tamaño máximo**: 1500px de ancho
- **Calidad**: 80-85% para WebP/JPEG
- **Formato**: WebP como preferido
- **Cache**: Usar CDN (Supabase usa Cloudflare)

### Nomenclatura

- Usar `slug` del manga para carpetas
- Números de capítulo con padding: `ch001`, `ch013`, `ch100`
- Páginas numeradas: `001.webp`, `002.webp`

### Límites

| Límite | Valor |
|--------|-------|
| File size limit | Configurado por bucket (default 50MB) |
| Total storage | Depende del plan |
| Bandwidth | Depende del plan |

---

## Verificar Bucket

```javascript
const { data, error } = await supabase.storage.listBuckets();

if (error) console.error(error);
else {
  const bucket = data.find(b => b.name === 'chapter-pages');
  if (bucket) {
    console.log('Bucket exists:', bucket.name);
    console.log('Public:', bucket.public);
    console.log('File size limit:', bucket.file_size_limit);
  } else {
    console.log('Bucket not found');
  }
}
```
