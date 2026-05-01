# Verificación de CLI Tools

## GitHub CLI

### Verificar instalación

```bash
gh --version
```

**Salida esperada:**
```
gh version 2.92.0 (2026-04-28)
https://github.com/cli/cli/releases/tag/v2.92.0
```

### Verificar autenticación

```bash
gh auth status
```

**Salida esperada:**
```
github.com
  ✓ Logged in to github.com account <username> (keyring)
  - Active account: true
  - Git operations protocol: https
  - Token: gho_************************************
  - Token scopes: 'gist', 'read:org', 'repo', 'workflow'
```

### Si no está autenticado

```bash
gh auth login
```

Sigue las instrucciones en terminal:
1. Selecciona `GitHub.com`
2. Selecciona `HTTPS` como protocolo
3. Selecciona `Login with a web browser` o `Paste an authentication token`

---

## Supabase CLI

### Verificar instalación

```bash
supabase --version
```

**Salida esperada:**
```
2.95.4
```

### Si no está instalado

#### Windows (Scoop)
```bash
scoop install supabase
```

#### Windows (Chocolatey)
```bash
choco install supabase
```

#### macOS (Homebrew)
```bash
brew install supabase/tap/supabase
```

#### Linux
```bash
brew install supabase/tap/supabase
```

O descarga el binario desde: https://github.com/supabase/cli/releases

### Verificar autenticación

```bash
supabase login
```

Esto abrirá el navegador para autenticar. Si ya tienes un token:

```bash
supabase login --token <tu-access-token>
```

### Verificar estado del proyecto vinculado

```bash
supabase status
```

**Nota:** En Windows, este comando puede fallar si Docker no está corriendo. Esto es normal si solo estás trabajando con un proyecto remoto vinculado (no local).

---

## Verificación Combinada

Crea un script rápido para verificar todo:

```bash
# Verificar GitHub CLI
echo "=== GitHub CLI ==="
gh --version
gh auth status

# Verificar Supabase CLI
echo "=== Supabase CLI ==="
supabase --version
```

---

## Problemas Comunes

| Problema | Solución |
|----------|----------|
| `gh: command not found` | Reinstala GitHub CLI desde https://cli.github.com |
| `supabase: command not found` | Instala Supabase CLI (ver arriba) |
| Token expirado | Ejecuta `gh auth login` o `supabase login` nuevamente |
| Docker error en Windows | Normal si usas proyecto remoto. Ignora el error de `supabase status` |

---

## Tokens de Acceso

### GitHub Token
- Obtén uno en: https://github.com/settings/tokens
- Scopes necesarios: `repo`, `read:org`, `workflow`

### Supabase Access Token
- Obtén uno en: https://app.supabase.com/account/tokens
- Necesario para operar proyectos remotos vía CLI
