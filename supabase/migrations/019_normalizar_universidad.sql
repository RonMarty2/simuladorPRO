-- ============================================================================
-- FASE 19 — Normalización de universidades existentes
--
-- Antes el campo perfiles.universidad era texto libre. Resultado: la misma
-- universidad aparecía 3 veces ("ucatec", "Ucatec", "UCATEC") en el panel
-- del docente.
--
-- A partir de ahora la app normaliza al guardar (helper normalizarUniversidad:
-- trim + UPPERCASE). Esta migración hace lo mismo de un solo golpe a las
-- filas ya cargadas, dejando todo consistente.
-- ============================================================================

UPDATE perfiles
SET universidad = UPPER(TRIM(universidad))
WHERE universidad IS NOT NULL
  AND universidad <> UPPER(TRIM(universidad));
