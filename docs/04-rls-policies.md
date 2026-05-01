# Políticas de Seguridad (Row Level Security)

## Qué es RLS

Row Level Security (RLS) es un mecanismo de PostgreSQL que permite controlar qué filas puede leer, insertar, actualizar o eliminar un usuario. En Supabase, RLS es **esencial** porque el cliente se conecta directamente a la base de datos.

---

## Habilitar RLS

Siempre habilita RLS en cada tabla:

```sql
alter table public.manga_titles enable row level security;
alter table public.manga_chapters enable row level security;
```

**Importante:** Una vez habilitado RLS, **ninguna consulta funcionará** hasta que crees políticas que permitan el acceso.

---

## Tipos de Políticas

### 1. SELECT (Lectura)

```sql
create policy "Public read manga titles"
on public.manga_titles
for select
to anon, authenticated
using (true);
```

- `for select`: Aplica a consultas SELECT
- `to anon, authenticated`: Aplica a usuarios no autenticados y autenticados
- `using (true)`: Permite acceso a todas las filas

### 2. INSERT (Inserción)

```sql
create policy "Anon insert manga titles"
on public.manga_titles
for insert
to anon
with check (true);
```

- `for insert`: Aplica a INSERT
- `with check (true)`: Permite insertar cualquier fila

### 3. UPDATE (Actualización)

```sql
create policy "Anon update manga titles"
on public.manga_titles
for update
to anon
using (true)
with check (true);
```

- `for update`: Aplica a UPDATE
- `using (true)`: Puede actualizar cualquier fila existente
- `with check (true)`: La fila resultante puede ser cualquier valor

### 4. DELETE (Eliminación)

```sql
create policy "Anon delete manga titles"
on public.manga_titles
for delete
to anon
using (true);
```

- `for delete`: Aplica a DELETE
- `using (true)`: Puede eliminar cualquier fila

---

## Patrones de Acceso

### Solo Lectura Pública

```sql
-- Ideal para catálogos, contenido público
create policy "Public read" on tabla
for select to anon, authenticated
using (true);
```

### Lectura + Escritura Completa (Desarrollo)

```sql
-- Para desarrollo o datos no sensibles
create policy "Public read" on tabla for select to anon, authenticated using (true);
create policy "Anon insert" on tabla for insert to anon with check (true);
create policy "Anon update" on tabla for update to anon using (true) with check (true);
create policy "Anon delete" on tabla for delete to anon using (true);
```

### Solo Autenticados

```sql
-- Solo usuarios registrados pueden acceder
create policy "Authenticated read" on tabla
for select to authenticated
using (true);
```

### Acceso por Usuario (Owner)

```sql
-- Solo el dueño puede ver/modificar sus filas
create policy "Users can view own" on tabla
for select to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own" on tabla
for insert to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own" on tabla
for update to authenticated
using (auth.uid() = user_id);

create policy "Users can delete own" on tabla
for delete to authenticated
using (auth.uid() = user_id);
```

### Acceso por Rol

```sql
-- Solo admins pueden escribir, todos pueden leer
create policy "Public read" on tabla
for select to anon, authenticated
using (true);

create policy "Admin write" on tabla
for all to authenticated
using (auth.jwt() ->> 'role' = 'admin')
with check (auth.jwt() ->> 'role' = 'admin');
```

---

## Migración Completa de Políticas

```sql
-- 002_write_policies.sql

-- Políticas de lectura (públicas)
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

-- Políticas de escritura (para desarrollo/seed)
create policy "Anon insert manga titles"
on public.manga_titles
for insert
to anon
with check (true);

create policy "Anon update manga titles"
on public.manga_titles
for update
to anon
using (true)
with check (true);

create policy "Anon delete manga titles"
on public.manga_titles
for delete
to anon
using (true);

create policy "Anon insert manga chapters"
on public.manga_chapters
for insert
to anon
with check (true);

create policy "Anon update manga chapters"
on public.manga_chapters
for update
to anon
using (true)
with check (true);

create policy "Anon delete manga chapters"
on public.manga_chapters
for delete
to anon
using (true);
```

---

## Ver Políticas Existentes

```sql
-- Ver todas las políticas
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public';
```

O desde el dashboard:
**Supabase Dashboard → Authentication → Policies**

---

## Eliminar Políticas

```sql
drop policy "Nombre de la política" on public.tabla;
```

---

## ⚠️ Advertencias de Seguridad

### NUNCA hagas esto en producción:

```sql
-- Esto permite CUALQUIER operación a CUALQUIER persona
create policy "Allow all" on tabla
for all to anon
using (true)
with check (true);
```

### Para producción, limita las operaciones:

```sql
-- Solo lectura pública
create policy "Public read" on tabla
for select to anon, authenticated
using (true);

-- Escritura solo con autenticación + validación
create policy "Authenticated insert" on tabla
for insert to authenticated
with check (auth.uid() is not null);
```

---

## RLS y Service Role Key

El **service role key** ignora RLS completamente. Úsalo solo en:
- Backend server (NUNCA en el cliente)
- Scripts de administración/migración
- Funciones serverless

```javascript
// NUNCA hacer esto en el cliente
const supabase = createClient(url, SERVICE_ROLE_KEY); // ❌
```

---

## Checklist de RLS

- [ ] RLS habilitado en todas las tablas
- [ ] Políticas de lectura configuradas
- [ ] Políticas de escritura configuradas (según necesidad)
- [ ] Políticas de eliminación configuradas
- [ ] Probado con usuario anon
- [ ] Probado con usuario autenticado
- [ ] Verificado que no hay acceso no autorizado
