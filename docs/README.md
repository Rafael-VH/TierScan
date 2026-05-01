# Guía de Configuración de Supabase

Documentación completa para configurar, migrar, poblar y conectar proyectos con Supabase.

## Índice

1. [Verificación de CLI Tools](01-cli-tools-verification.md)
   - Instalación y verificación de GitHub CLI y Supabase CLI
   - Autenticación y estados

2. [Inicialización de Proyecto Supabase](02-supabase-project-init.md)
   - Vinculación con proyecto remoto
   - Estructura de directorios

3. [Migraciones de Esquema](03-schema-migrations.md)
   - Creación de tablas
   - Índices y constraints
   - Aplicación de migraciones

4. [Políticas de Seguridad RLS](04-rls-policies.md)
   - Row Level Security
   - Políticas de lectura y escritura
   - Buenas prácticas

5. [Poblado de Datos (Seed)](05-seed-database.md)
   - Scripts de seeding con Node.js
   - Insertar datos iniciales
   - Mapeo de datos locales a remotos

6. [Configuración de Storage](06-storage-bucket.md)
   - Creación de buckets
   - Políticas de acceso
   - URLs de objetos

7. [Conexión Remota](07-remote-connection.md)
   - Variables de entorno
   - .env.local vs .env.example
   - Cliente de Supabase en la app

8. [Solución de Problemas](08-troubleshooting.md)
   - Errores comunes
   - Diagnóstico y resolución

9. [Referencia Rápida](09-quick-reference.md)
   - Comandos esenciales
   - Checklist de configuración
   - Estructura típica de migraciones

## Stack Utilizado

- **Supabase CLI**: v2.95.4+
- **@supabase/supabase-js**: v2.105.1+
- **Node.js**: v20+
- **PostgreSQL**: 15+ (Supabase)
