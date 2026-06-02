# Notificar nota por email

Manda un email al estudiante cuando el docente califica una de sus entregas.

El **código ya está listo**. Para activarlo necesitás 3 pasos (una sola vez):

## 1. Crear cuenta de envío de emails (Resend — gratis)

1. Entrá a https://resend.com y creá una cuenta (gratis, 3.000 emails/mes).
2. En **API Keys** → **Create API Key** → copiá la clave (empieza con `re_`).
3. (Opcional pero recomendado) En **Domains** verificá tu dominio para enviar
   desde `notas@tudominio.com`. Mientras tanto podés usar el remitente de
   prueba `onboarding@resend.dev` (funciona pero llega como Resend).

## 2. Desplegar la función en Supabase

Desde tu compu, con el [CLI de Supabase](https://supabase.com/docs/guides/cli)
instalado y logueado:

```bash
supabase functions deploy notificar-nota --project-ref TU_PROJECT_REF
```

(El `TU_PROJECT_REF` es el de la URL de tu proyecto, ej. `syfbgauvictgykdptamb`.)

Luego configurá los secrets:

```bash
supabase secrets set RESEND_API_KEY=re_xxxxx --project-ref TU_PROJECT_REF
# Opcional, si verificaste tu dominio:
supabase secrets set EMAIL_FROM="Simulador <notas@tudominio.com>" --project-ref TU_PROJECT_REF
```

> `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` ya están disponibles
> automáticamente en el entorno de las funciones — no hay que setearlos.

## 3. Crear el Database Webhook

En Supabase Dashboard → **Database** → **Webhooks** → **Create a new hook**:

- **Name:** `notificar-nota`
- **Table:** `entregas`
- **Events:** marcá solo **Update**
- **Type:** `Supabase Edge Functions`
- **Edge Function:** `notificar-nota`
- **Method:** `POST`

Guardá. Listo.

## Cómo funciona

Cuando el docente califica una entrega (la pasa de `pendiente` a
`aprobada`/`reprobada` con nota), el webhook llama a la función, que:

1. Verifica que sea una calificación nueva (no un cambio irrelevante).
2. Lee el email del estudiante (con la service role key, sin RLS).
3. Manda un email con la nota, el paso, y el comentario del docente si lo hay.

Si no configurás esto, **la app funciona igual** — simplemente no se mandan
emails (el alumno se entera por el badge rojo dentro de la app, como hasta hoy).
