# Setup de Supabase

Esta carpeta contiene las migraciones SQL que hay que correr en el proyecto Supabase, en orden numérico.

## Migraciones

| Archivo | Fase | Qué crea |
|---|---|---|
| `migrations/001_fase1_auth.sql` | FASE 1 | Tablas `perfiles`, `cursos`, `inscripciones` + trigger de auto-perfil + RLS |
| `migrations/002_fase3_proyectos.sql` | FASE 3 | Tabla `proyectos` con JSONB + RLS + trigger de timestamp |
| `migrations/003_fix_rls_recursion.sql` | FIX | Helper functions `SECURITY DEFINER` para evitar recursión infinita en RLS |

## Cómo correr una migración

1. Entrar al [dashboard de Supabase](https://supabase.com/dashboard) y abrir tu proyecto.
2. Menú izquierdo → **SQL Editor** → **New query**.
3. Copiar todo el contenido del archivo `.sql`.
4. Pegar y darle **Run** (Ctrl+Enter).
5. Verificar que dice `Success. No rows returned`.

Si algo falla, revisar el error en la consola de Supabase y avisar — usualmente significa que la migración ya se corrió parcialmente y hay que limpiar antes de reintentar.
