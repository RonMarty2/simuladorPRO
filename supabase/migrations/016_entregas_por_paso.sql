-- ============================================================================
-- FASE 16 — Entregas por PASO (promedio simple, sin pesos)
--
-- Antes, el alumno entregaba el proyecto entero una sola vez al final. Ahora
-- puede entregar cada paso por separado y el docente lo califica por paso.
-- La nota individual del alumno es el promedio SIMPLE de las notas de sus
-- entregas (no importa cuántas etapas entregó: todas pesan igual). Luego, la
-- nota final del estudiante se calcula como ya estaba:
--    nota_final = peso_individual × promedio_individual + peso_grupal × nota_grupal
--
-- Las entregas viejas (sin paso) siguen siendo válidas: tienen paso_entregado
-- NULL y se interpretan como "entrega final del proyecto entero".
-- ============================================================================

-- Nuevo campo en entregas: a qué paso pertenece la entrega.
ALTER TABLE entregas
  ADD COLUMN paso_entregado INT NULL
    CHECK (paso_entregado IS NULL OR (paso_entregado BETWEEN 1 AND 9));

CREATE INDEX idx_entregas_paso ON entregas(paso_entregado)
  WHERE paso_entregado IS NOT NULL;

COMMENT ON COLUMN entregas.paso_entregado IS
  'Paso (1..9) que se entrega. NULL = entrega del proyecto entero (legacy o final).';

-- Permite que un mismo proyecto tenga varios intentos POR PASO. La unicidad
-- ahora es (proyecto, paso, intento). Las entregas viejas con paso_entregado
-- NULL mantienen su numero_intento único.
ALTER TABLE entregas DROP CONSTRAINT IF EXISTS entregas_proyecto_id_numero_intento_key;
ALTER TABLE entregas
  ADD CONSTRAINT entregas_proyecto_paso_intento_unico
  UNIQUE (proyecto_id, paso_entregado, numero_intento);
