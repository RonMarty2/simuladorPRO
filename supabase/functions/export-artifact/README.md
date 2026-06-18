# Edge Function: export-artifact

Exporta los proyectos de un estudiante en formato `StudentArtifact` estándar
(contrato `C0.Cerebro_contrato`) para que WEBAPP los incorpore al Proyecto Maestro.

## Endpoints

```
GET /functions/v1/export-artifact?email=user@gmail.com
→ StudentArtifact[]  (todos los proyectos del estudiante)

GET /functions/v1/export-artifact?email=user@gmail.com&projectId=uuid
→ StudentArtifact    (un proyecto específico)
```

## Auth

Header requerido: `X-Webapp-Key: <valor de WEBAPP_API_KEY>`

La clave es compartida entre WEBAPP y simuladorPRO. No se expone al navegador.

## Configurar secrets en Supabase

```bash
supabase secrets set WEBAPP_API_KEY="una-clave-larga-y-secreta-aqui"
```

En WEBAPP, agregar al `.env.local` y a las variables de Vercel:
```env
SIMULADOR_PRO_URL=https://<tu-proyecto>.supabase.co/functions/v1/export-artifact
SIMULADOR_PRO_API_KEY=una-clave-larga-y-secreta-aqui
```

## Deploy

```bash
supabase functions deploy export-artifact
```

## Prueba local

```bash
supabase functions serve export-artifact

curl "http://localhost:54321/functions/v1/export-artifact?email=estudiante@gmail.com" \
  -H "X-Webapp-Key: tu-clave-local"
```

## Lo que devuelve

Por cada proyecto del estudiante:

```json
{
  "artifact_id": "simuladorPRO-uuid-del-proyecto",
  "cerebro_id": "simuladorPRO",
  "google_id": "estudiante@gmail.com",
  "project_id": "uuid",
  "maestro_id": null,
  "titulo": "Cafetería La Orquídea",
  "resumen": "Proyecto del sector servicios (Cafetería La Orquídea). VAN Bs. 45k, TIR 22% — viable.",
  "key_metrics": [
    { "label": "VAN", "value": 45000, "unit": "BOB" },
    { "label": "TIR", "value": 22.0, "unit": "%" }
  ],
  "feeds_sections": ["evaluacion_financiera"],
  "content": {
    "nombre_proyecto": "Cafetería La Orquídea",
    "sector": "servicios",
    "van_bob": 45000,
    "tir_decimal": 0.22,
    "wacc_decimal": 0.14,
    "payback_anios": 3.2
  },
  "status": "aprobado",
  "completeness_pct": 100,
  "created_at": "2026-03-01T10:00:00Z",
  "updated_at": "2026-05-15T14:30:00Z",
  "approved_at": "2026-05-15T14:30:00Z"
}
```

## Notas

- Solo devuelve proyectos del estudiante (tipo `libre`, `entrega_estudiante`, `proyecto_grupal`).
  Los `caso_curso` (plantillas del docente) se excluyen.
- Los indicadores financieros (VAN, TIR, WACC, Payback) vienen de la última entrega
  revisada por el docente. Si no hay entrega, los campos son nulos.
- `maestro_id` siempre es `null` aquí — WEBAPP lo vincula en su lado al registrar el artefacto.
- Agregar features a simuladorPRO (rankings, clases, visualizaciones) no afecta esta función.
