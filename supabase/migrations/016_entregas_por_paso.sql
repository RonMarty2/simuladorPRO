-- ============================================================================
-- FASE 16 — Entregas por PASO + Pesos por paso para la nota ponderada
--
-- Antes, el alumno entregaba el proyecto entero una sola vez al final. Ahora
-- puede entregar cada paso por separado y el docente lo califica por paso.
-- La nota final del proyecto se calcula como suma ponderada de las notas por
-- paso, usando los pesos que el docente define a nivel de CURSO.
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

-- Pesos por paso en el curso (default: enfocados en los pasos finales).
ALTER TABLE cursos
  ADD COLUMN pesos_pasos JSONB NOT NULL
    DEFAULT '{"1":5,"2":10,"3":10,"4":10,"5":10,"6":10,"7":10,"8":15,"9":20}'::jsonb;

COMMENT ON COLUMN cursos.pesos_pasos IS
  'Peso (en %) de cada paso (1..9) para la nota ponderada del proyecto. Suma 100.';

-- Permite que un mismo proyecto tenga varios intentos POR PASO (no solo un
-- único intento por proyecto). La unicidad ahora es (proyecto, paso, intento).
-- Las entregas viejas con paso_entregado NULL mantienen su numero_intento único.
ALTER TABLE entregas DROP CONSTRAINT IF EXISTS entregas_proyecto_id_numero_intento_key;
ALTER TABLE entregas
  ADD CONSTRAINT entregas_proyecto_paso_intento_unico
  UNIQUE (proyecto_id, paso_entregado, numero_intento);
