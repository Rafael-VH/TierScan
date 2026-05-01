# Inicialización de Proyecto Supabase

## Vincular Proyecto Remoto Existente

Si ya creaste un proyecto en el dashboard de Supabase y quieres vincularlo localmente:

```bash
supabase init --workdir "<ruta-del-proyecto>"
```

Esto crea la carpeta `supabase/` con la estructura necesaria.

### Estructura Generada

```
tu-proyecto/
├── supabase/
│   ├── .temp/          # Metadatos del CLI (no commitear)
│   │   ├── linked-project.json
│   │   ├── project-ref
│   │   ├── cli-latest
│   │   └── ...
│   ├── config.toml     # Configuración del proyecto
│   └── migrations/     # Migraciones SQL (crear manualmente)
```

### Linked Project

El archivo `supabase/.temp/linked-project.json` contiene:

```json
{
  "ref": "yghrkicevfbcwfafqytk",
  "name": "TierScan",
  "organization_id": "hfftaemctwewgryeqpym",
  "organization_slug": "hfftaemctwewgryeqpym"
}
```

- `ref`: Identificador único del proyecto (aparece en la URL: `https://yghrkicevfbcwfafqytk.supabase.co`)

---

## Crear Nuevo Proyecto Remoto

### Vía CLI

```bash
supabase projects create --name "Mi Proyecto" --region us-east-2 --password "<db-password>"
```

### Vía Dashboard

1. Ve a https://app.supabase.com
2. Click en "New Project"
3. Selecciona organización
4. Nombre del proyecto
5. Contraseña de la base de datos (**guárdala, no se puede recuperar**)
6. Región (recomendado: `us-east-2` para América, `eu-central-1` para Europa)
7. Espera ~2 minutos a que se provisione

---

## Vincular Proyecto Existente al CLI

Si el proyecto fue creado vía dashboard y no está vinculado:

```bash
supabase link --project-ref <tu-project-ref>
```

El project ref lo encuentras en:
- URL del dashboard: `https://app.supabase.com/project/<ref>`
- Settings → General → Project ref

---

## Config.toml

El archivo `supabase/config.toml` gestiona la configuración del proyecto:

```toml
project_id = "yghrkicevfbcwfafqytk"

[api]
enabled = true
port = 54321
schemas = ["public", "storage"]

[db]
port = 54322

[studio]
enabled = true
port = 54323
```

### Configuración Mínima

Para proyectos remotos, solo necesitas:

```toml
project_id = "tu-project-ref"
```

---

## Verificar Vinculación

```bash
supabase status --workdir "<ruta-del-proyecto>"
```

Si está vinculado correctamente, mostrará información del proyecto remoto.

**Nota en Windows:** El comando puede mostrar un error de Docker. Esto es esperado si no tienes Docker Desktop corriendo y solo estás trabajando con el proyecto remoto.

---

## Directorio de Migraciones

Crea manualmente la carpeta de migraciones:

```bash
mkdir supabase/migrations
```

Las migraciones se nombran con prefijo numérico:

```
supabase/migrations/
├── 001_initial_schema.sql
├── 002_write_policies.sql
├── 003_storage_bucket.sql
└── ...
```

El orden numérico determina el orden de aplicación.

---

## Mejores Prácticas

1. **Siempre vincula el proyecto antes de crear migraciones**
2. **Nunca commitees `supabase/.temp/`** (agrega al `.gitignore`)
3. **Usa prefijos numéricos en migraciones** para mantener orden
4. **Nombra migraciones descriptivamente** (`001_initial_schema`, no `001_fix`)
5. **Mantén migraciones atómicas** (una tabla o un cambio por migración)
